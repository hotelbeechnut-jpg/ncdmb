import { usePageMeta } from "../hooks/usePageMeta";
import PageHeader from "../components/PageHeader";
import CreatorSection from "../components/CreatorSection";
import Pitch from "../components/Pitch";
import { event } from "../config/event";

export default function BuildYours() {
  usePageMeta(
    "Build yours",
    `Get a fast, professional website for your business — by ${event.builder.name}.`
  );
  return (
    <>
      <PageHeader
        kicker={`By ${event.builder.name}`}
        title="Build yours"
        intro="You've just seen what an owned asset can feel like. Let's build yours."
      />
      <CreatorSection />
      <Pitch />
    </>
  );
}
