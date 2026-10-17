import { usePageMeta } from "../hooks/usePageMeta";
import PageHeader from "../components/PageHeader";
import Gallery from "../components/Gallery";

export default function GalleryPage() {
  usePageMeta("Immersive gallery", "Photos and videos from all five days of the seminar.");
  return (
    <>
      <PageHeader
        kicker="Moments"
        title="Full gallery"
        intro="Every photo and clip, from every day — drag, swipe or use arrow keys."
        dark
      />
      <Gallery />
    </>
  );
}
