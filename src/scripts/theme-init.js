(() => {
  try {
    const t = localStorage.getItem('nelcota-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch {}
})();
