import { useNavigate } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import IntroFiveDays from "../components/IntroFiveDays";
import { writeIntroSeen } from "../utils/intro";

// /intro is a real page: it renders the five-card floating intro whenever
// visited, with no dependence on any seen-flag. Welcome goes Home (replace,
// so Back from Home goes to the page before the intro — never a loop) and
// starts the music via the same user-tap event as before.
export default function Intro() {
  usePageMeta("Welcome", "A five-day digital marketing seminar recap — step inside.");
  const navigate = useNavigate();

  const enter = (withMusic) => {
    writeIntroSeen();
    if (withMusic) window.dispatchEvent(new CustomEvent("recap:start-music"));
    navigate("/", { replace: true });
  };

  return <IntroFiveDays onEnter={enter} />;
}
