'use client';

import { useEffect } from 'react';

export default function Error({ reset }) {
  useEffect(() => {
    // no-op: avoid leaking internals in production UI
  }, []);

  return (
    <div className="page-scroll">
      <div className="view-heading">Something went wrong</div>
      <div className="view-subheading">Please retry. If the issue continues, check again in a moment.</div>
      <button className="ctrl-btn" onClick={() => reset()}>Try again</button>
    </div>
  );
}
