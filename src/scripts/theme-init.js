(() => {
  let theme = null;
  try {
    theme = localStorage.getItem('nelcota-theme');
  } catch {
    // Storage can be blocked (privacy mode, disabled cookies): no saved choice, follow the system theme.
    theme = null;
  }
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.dataset.theme = theme;
})();
