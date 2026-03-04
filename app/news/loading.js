export default function Loading() {
  return (
    <div className="page-scroll" aria-busy="true" aria-live="polite">
      <div className="view-heading">Live News Feed · 72h</div>
      <div className="view-subheading">Loading latest items…</div>
      <div className="inst-card news-feed-card">
        <div className="skel-bar skel-news-row"></div>
        <div className="skel-bar skel-news-row"></div>
        <div className="skel-bar skel-news-row"></div>
      </div>
    </div>
  );
}
