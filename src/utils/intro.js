// Intro seen-flag: only the automatic first-visit redirect in App.jsx reads
// it. /intro itself is a real route and always renders — visiting it (menu,
// footer, deep link) never depends on this flag, so there is no flag trick
// to replay and nothing that can get stuck.
export const INTRO_SEEN_KEY = "recap-intro-seen";

export function readIntroSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // storage unavailable — intro simply shows again next load
  }
}
