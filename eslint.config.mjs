import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/', 'node_modules/', 'out/', 'build/', 'figma-export/'],
  },
  {
    // Keep legacy hydration/fetch effects visible while migrating to React 19.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
];

export default config;
