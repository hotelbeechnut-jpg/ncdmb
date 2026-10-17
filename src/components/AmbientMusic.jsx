import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Normalized copy (-16.4 LUFS integrated, true peak ≈ -1.5 dB, 128 kbps,
// 2.1 MB), made from the full-quality original. Only this file ships in
// public/audio/; the full original and the retired -96k copy live only in
// media-source/audio-original/ (archival, never scanned, never referenced).
const TRACK =
  "/audio/" + encodeURI("leberch-from-the-mountain-documentary-storytelling-614348-16lufs.mp3");

const MUTED_KEY = "recap-music-muted";
// Volume storage is gone: the music always plays at FULL_VOLUME (1.0), no
// slider, no stored level. Legacy volume keys are only ever deleted.
const LEGACY_VOLUME_KEY = "recap-music-volume";
const LEGACY_VOLUME_KEY_V2 = "music-vol-v2";
// Session record: after a refresh or deep link the pill returns to idle
// "Play music" (with first-gesture start) unless the visitor had muted.
const STATE_KEY = "recap-music-state";
const FULL_VOLUME = 1.0;
const DUCKED_VOLUME = 0.1; // 10% while an unmuted video plays; restore is exactly 1.0

// Browsers only allow audio.play() after a real user gesture (pointerdown,
// click, keydown, touchend — scrolling does not count). There are no
// workarounds here: no muted-autoplay-then-unmute, no silent AudioContext
// tricks. Playback starts on Welcome, on the pill tap, or on the visitor's
// first gesture anywhere (except on /intro, which stays silent until Welcome).

function readMuted() {
  try {
    if (sessionStorage.getItem(MUTED_KEY) === "1") return true;
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) return !!JSON.parse(raw).muted;
  } catch {
    // storage unavailable — treat as unmuted
  }
  return false;
}

function readState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      return { started: !!o.started, muted: !!o.muted };
    }
  } catch {
    // ignore
  }
  return { started: false, muted: false };
}

function writeState(patch) {
  try {
    const cur = readState();
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch {
    // session-only memory is best-effort
  }
}

function writeMuted(v) {
  try {
    if (v) sessionStorage.setItem(MUTED_KEY, "1");
    else sessionStorage.removeItem(MUTED_KEY);
  } catch {
    // storage unavailable — choice simply won't persist
  }
  writeState({ muted: !!v });
  if (v) writeState({ started: true });
}

// Clears every stored music choice (mute + session state + any legacy
// volume keys). Used by the ?intro=1 redirect so it always starts fresh.
export function clearMusicState() {
  try {
    sessionStorage.removeItem(MUTED_KEY);
    sessionStorage.removeItem(LEGACY_VOLUME_KEY);
    sessionStorage.removeItem(LEGACY_VOLUME_KEY_V2);
    sessionStorage.removeItem(STATE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

const MusicCtx = createContext({ status: "idle", start: () => {}, toggleMute: () => {} });
export const useAmbientMusic = () => useContext(MusicCtx);

export function AmbientMusicProvider({ children }) {
  const [status, setStatus] = useState("idle"); // idle | playing | muted — mirrors the AUDIO element, never a flag
  const [missing, setMissing] = useState(false);
  const audioRef = useRef(null); // exactly one Audio element, created lazily
  const fadeRef = useRef(null);
  const failsafeRef = useRef(null);
  const hiddenPausedRef = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;
  const duckedRef = useRef(new Set()); // media elements currently ducking the music
  const startingRef = useRef(false); // guards overlapping play() attempts
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const logAudio = useCallback((tag) => {
    try {
      const a = audioRef.current;
      console.info(
        `[music] ${tag} paused=${a ? a.paused : "(no element)"} readyState=${a ? a.readyState : "-"} volume=${a ? a.volume.toFixed(2) : "-"}`
      );
    } catch {
      // logging must never throw
    }
  }, []);

  const goIdle = useCallback((why) => {
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    if (statusRef.current === "idle") return;
    statusRef.current = "idle";
    setStatus("idle");
    logAudio(`idle (${why})`);
  }, [logAudio]);

  const fadeTo = useCallback((target, ms = 300) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const steps = Math.max(1, Math.round(ms / 50));
    const from = audio.volume;
    const delta = (target - from) / steps;
    let i = 0;
    fadeRef.current = setInterval(() => {
      i += 1;
      const a = audioRef.current;
      if (!a) {
        clearInterval(fadeRef.current);
        return;
      }
      a.volume = Math.max(0, Math.min(1, from + delta * i));
      if (i >= steps) {
        // Robust end: force the exact target (float drift must not leave
        // the fade stuck at 0.99). Duck fades target 0.1; all others 1.0.
        try {
          a.volume = target;
        } catch {
          // ignore
        }
        if (fadeRef.current) clearInterval(fadeRef.current);
      }
    }, 50);
  }, []);

  // Failsafe: if playing, audible and not ducked, the level is exactly 1.0.
  // Called ~3s after playback starts, after route changes and on tab return.
  // StrictMode-safe: timeout is cleared on every re-run/unmount, and forcing
  // 1.0 is idempotent.
  const enforceFullVolume = useCallback(() => {
    try {
      const a = audioRef.current;
      if (!a) return;
      if (statusRef.current !== "playing") return;
      if (duckedRef.current.size > 0) return; // ducked: 0.1 is correct
      if (a.paused) return;
      if (a.volume < 1) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        a.volume = FULL_VOLUME;
        logAudio("failsafe restored 1.0");
      }
    } catch {
      // ignore
    }
  }, [logAudio]);

  // Latest element-event handlers, read at creation time so the single
  // Audio element always calls current logic (StrictMode-safe: attached once,
  // never duplicated, never stale).
  const handlersRef = useRef(null);

  // The pill shows "playing" ONLY here, when the element is really audible.
  const onElementPlaying = useCallback(() => {
    statusRef.current = "playing";
    setStatus("playing");
    writeState({ started: true, muted: false });
    logAudio("playing");
    // 2s fade-in to full volume…
    fadeTo(FULL_VOLUME, 2000);
    // …plus a ~3s failsafe that forces exactly 1.0.
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    failsafeRef.current = setTimeout(() => {
      enforceFullVolume();
    }, 3000);
  }, [fadeTo, enforceFullVolume, logAudio]);

  const onElementPause = useCallback(() => {
    // Our own pauses must not flip the UI: background tab (invisible
    // anyway) and the mute fade both pause deliberately.
    try {
      if (document.hidden) return;
    } catch {
      // ignore
    }
    if (statusRef.current !== "playing") return;
    goIdle("element paused");
  }, [goIdle]);

  const onElementWaiting = useCallback(() => {
    // Stalled mid-stream: nothing audible → honest idle until it recovers.
    if (statusRef.current !== "playing") return;
    goIdle("stalled (waiting)");
  }, [goIdle]);

  handlersRef.current = {
    onPlaying: onElementPlaying,
    onPause: onElementPause,
    onWaiting: onElementWaiting,
  };

  const ensureAudio = useCallback(() => {
    // Single element for the whole session: reuse, never duplicate.
    // UI state follows the ELEMENT's events — never a flag.
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audio.src = TRACK; // always set — even resuming muted, so unmuting works
    audio.addEventListener("error", () => {
      setMissing(true);
      goIdle("element error");
    });
    const h = handlersRef.current;
    if (h) {
      audio.addEventListener("playing", h.onPlaying);
      audio.addEventListener("pause", h.onPause);
      audio.addEventListener("waiting", h.onWaiting);
    }
    audioRef.current = audio;
    return audio;
  }, [goIdle]);

  // Core start: returns true once play() is accepted. Never throws, never
  // fails silently — rejection returns to idle with "Play music". The UI
  // flips to playing only when the element fires 'playing'.
  const start = useCallback(async (reason = "tap") => {
    if (missing) return false;
    if (statusRef.current !== "idle") return statusRef.current === "playing";
    if (startingRef.current) return false;
    if (readMuted()) {
      ensureAudio();
      statusRef.current = "muted";
      setStatus("muted");
      writeState({ started: true, muted: true });
      logAudio("muted (stored choice)");
      return false;
    }
    startingRef.current = true;
    try {
      const audio = ensureAudio();
      await audio.play();
      writeState({ started: true, muted: false });
      logAudio(`play accepted (${reason}), awaiting 'playing'`);
      return true;
    } catch {
      writeState({ started: false });
      goIdle("play rejected");
      return false;
    } finally {
      startingRef.current = false;
    }
  }, [missing, ensureAudio, goIdle, logAudio]);

  const startRef = useRef(start);
  startRef.current = start;

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (statusRef.current === "playing") {
      writeMuted(true);
      writeState({ muted: true });
      statusRef.current = "muted";
      setStatus("muted");
      logAudio("muted by visitor");
      if (audio) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        if (failsafeRef.current) clearTimeout(failsafeRef.current);
        fadeTo(0, 250);
        setTimeout(() => {
          // Deliberate pause: the element 'pause' handler ignores it because
          // status is already 'muted'.
          if (statusRef.current === "muted") audio.pause();
        }, 300);
      }
    } else if (statusRef.current === "muted") {
      writeMuted(false);
      writeState({ muted: false });
      if (!audio || missing) return;
      try {
        audio.volume = FULL_VOLUME;
      } catch {
        // ignore
      }
      audio
        .play()
        .then(() => {
          // UI flips when the element fires 'playing'; reject → idle.
          logAudio("unmute accepted, awaiting 'playing'");
        })
        .catch(() => {
          goIdle("unmute rejected");
        });
    } else {
      // Idle pill has its own Play button; the mute button never shows here.
      startRef.current("tap");
    }
  }, [fadeTo, missing, goIdle, logAudio]);

  // Welcome button in the intro asks for music via this event (a real user tap,
  // which is the only moment browsers allow audio to start).
  useEffect(() => {
    const onStart = () => startRef.current("welcome");
    window.addEventListener("recap:start-music", onStart);
    return () => window.removeEventListener("recap:start-music", onStart);
  }, []);

  // First-gesture start: while idle and not explicitly muted, one set of
  // one-time window listeners tries play() on the visitor's first real
  // gesture and removes itself once playback succeeds. Skipped on /intro
  // (silent until Welcome) and forever after an explicit mute. Exactly one
  // set exists at a time; StrictMode setup/cleanup pairs stay balanced.
  useEffect(() => {
    if (status !== "idle" || missing) return;
    if (pathnameRef.current === "/intro") return;
    if (readMuted()) return;
    let settled = false;
    const attempt = async () => {
      if (settled) return;
      console.info("[music] gesture start");
      const ok = await startRef.current("gesture");
      if (ok) {
        settled = true;
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", attempt);
      window.removeEventListener("keydown", attempt);
      window.removeEventListener("touchend", attempt);
    };
    window.addEventListener("pointerdown", attempt);
    window.addEventListener("keydown", attempt);
    window.addEventListener("touchend", attempt);
    return cleanup;
  }, [status, pathname, missing]);

  // Pause in the background; on return resume if it was playing, else idle.
  // Failsafe re-runs here too, so a backgrounded fade can never stick low.
  useEffect(() => {
    const onVis = () => {
      const audio = audioRef.current;
      if (document.hidden) {
        if (statusRef.current === "playing" && audio && !audio.paused) {
          audio.pause();
          hiddenPausedRef.current = true;
        }
      } else if (hiddenPausedRef.current) {
        hiddenPausedRef.current = false;
        if (statusRef.current === "playing" && audio) {
          audio.play().then(() => {
            logAudio("resumed");
            enforceFullVolume();
          }).catch(() => {
            goIdle("resume rejected");
          });
        }
      } else {
        enforceFullVolume();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enforceFullVolume, goIdle, logAudio]);

  // Duck only under a video with sound actually playing and unmuted.
  // Muted autoplay videos (day clips, hero background, poster-first theater
  // placeholders) must NOT duck the music. Capture phase: media events don't bubble.
  // The exact pre-duck volume is saved and restored — never a fixed default.
  useEffect(() => {
    const external = (e) => e.target instanceof HTMLMediaElement && e.target !== audioRef.current;
    const duck = (el) => {
      const set = duckedRef.current;
      if (set.has(el)) return;
      set.add(el);
      if (statusRef.current === "playing") fadeTo(DUCKED_VOLUME, 300);
    };
    const unduck = (el) => {
      const set = duckedRef.current;
      set.delete(el);
      // Exact restore: always back to full volume, never a stored level.
      if (set.size === 0 && statusRef.current === "playing") fadeTo(FULL_VOLUME, 600);
    };
    const sounding = (el) => !el.muted && el.volume > 0 && !el.paused;
    const onPlay = (e) => {
      if (!external(e)) return;
      if (e.target.muted || e.target.volume === 0) return; // silent video: no duck
      duck(e.target);
    };
    const onStop = (e) => {
      if (!external(e)) return;
      unduck(e.target);
    };
    const onVolume = (e) => {
      if (!external(e)) return;
      // A playing video unmuted mid-play starts ducking; muting stops it.
      if (sounding(e.target)) duck(e.target);
      else unduck(e.target);
    };
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    document.addEventListener("volumechange", onVolume, true);
    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
      document.removeEventListener("volumechange", onVolume, true);
    };
  }, [fadeTo]);

  // Route change unmounts any playing video (its pause/ended may never fire):
  // clear a stuck duck and restore full volume, then run the failsafe so no
  // route-change timing can leave the level below 1.0. The gesture listeners
  // re-arm on the new route (except /intro) via the pathname dep.
  useEffect(() => {
    const set = duckedRef.current;
    if (set.size > 0) {
      set.clear();
      if (statusRef.current === "playing") fadeTo(FULL_VOLUME, 600);
    }
    enforceFullVolume();
  }, [pathname, fadeTo, enforceFullVolume]);

  if (missing) return <>{children}</>;

  return <MusicCtx.Provider value={{ status, start, toggleMute }}>{children}</MusicCtx.Provider>;
}

function EqualizerBars() {
  return (
    <span className="eq inline-flex items-end gap-[3px]" aria-hidden="true">
      <span className="eq-bar eq-bar-1" />
      <span className="eq-bar eq-bar-2" />
      <span className="eq-bar eq-bar-3" />
    </span>
  );
}

export function AmbientMusicToggle() {
  const { status, start, toggleMute } = useAmbientMusic();
  // Idle: play icon + label only. Shown until the element fires 'playing'.
  if (status === "idle") {
    return (
      <div
        className="fixed bottom-5 left-5 z-[70] flex items-center gap-2 rounded-full border border-white/30 bg-purple-900 py-1 pl-1 pr-3 shadow-lift"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          onClick={() => start("tap")}
          aria-label="Play ambient music"
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-white"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ▶
          </span>
          Play music
        </button>
      </div>
    );
  }
  // Playing: equalizer bars + one speaker mute button. Muted: speaker-off.
  // No slider anywhere — mute is the only control.
  const muted = status === "muted";
  return (
    <div
      className="fixed bottom-5 left-5 z-[70] flex items-center gap-2 rounded-full border border-white/30 bg-purple-900 py-1 pl-1 pr-3 shadow-lift"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute ambient music" : "Mute ambient music"}
        aria-pressed={!muted}
        className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-white"
      >
        {muted ? (
          <span aria-hidden="true" className="text-xl leading-none">
            🔇
          </span>
        ) : (
          <>
            <EqualizerBars />
            <span aria-hidden="true" className="text-xl leading-none">
              🔊
            </span>
          </>
        )}
      </button>
    </div>
  );
}
