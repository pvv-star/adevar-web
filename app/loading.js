export default function Loading() {
  return (
    <div className="page-scroll" aria-busy="true" aria-live="polite">
      <div className="dashboard-skeleton">
        <div className="skel-bar skel-hero"></div>
        <div className="skel-row">
          <div className="skel-bar skel-stat"></div>
          <div className="skel-bar skel-stat"></div>
        </div>
        <div className="skel-bar skel-news"></div>
      </div>
    </div>
  );
}
