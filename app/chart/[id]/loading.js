export default function Loading() {
  return (
    <div className="page-scroll" aria-busy="true" aria-live="polite">
      <div className="skel-row" style={{ marginBottom: '16px' }}>
        <div className="skel-bar skel-stat"></div>
        <div className="skel-bar skel-stat"></div>
      </div>
      <div className="skel-bar skel-chart"></div>
      <div className="skel-bar skel-events" style={{ marginTop: '12px' }}></div>
    </div>
  );
}
