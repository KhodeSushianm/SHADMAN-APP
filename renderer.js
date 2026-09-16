// Functional renderer bridge helper for Shima Academy
// The application UI is implemented in index.html; this file intentionally stays small.
window.SA = {
  now: () => new Date().toISOString(),
  initials: (first, last) => ((first || '')[0] || '') + ((last || '')[0] || '')
};
