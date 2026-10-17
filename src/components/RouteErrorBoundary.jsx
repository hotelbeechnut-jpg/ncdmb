import { Component } from "react";

// Shared route safety net: without this, any render error or rejected lazy
// chunk unmounts the whole app to a blank white screen (only a hard refresh
// recovers). With it, the visitor sees a short message + Reload instead,
// and the failure is logged with its route for diagnosis.
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    try {
      console.error(
        `[recap] route error on ${this.props.route ?? window.location.pathname}:`,
        error,
        info?.componentStack ?? ""
      );
    } catch {
      // logging must never throw
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-white pt-28 sm:pt-32" role="alert">
          <div className="mx-auto max-w-2xl px-4 pb-16 text-center sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
              Something didn&apos;t load
            </p>
            <h1 className="font-display mt-2 text-2xl font-bold text-ink">
              This page hit a snag
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/65">
              The content didn&apos;t finish loading. Reloading usually fixes it —
              your place in the site is kept.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-bold text-ink shadow-soft"
            >
              Reload ↻
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
