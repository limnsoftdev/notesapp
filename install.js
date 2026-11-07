/* ===================== add to home screen =====================
   iPhone/iPad only: Safari has no install prompt, so we show the steps ourselves.
   never shown when already opened from the home screen icon. pops up once, after the
   welcome screen hands over; after that it lives in settings. */
(function(){
  const ua = navigator.userAgent;
  const isApple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const installed = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if(!isApple || installed) return;

  const overlay = document.getElementById('installOverlay');
  const guideBtn = document.getElementById('installGuideBtn');
  guideBtn.hidden = false;

  function open(){ overlay.hidden = false; }
  function close(){
    overlay.hidden = true;
    if(!settings.installSeen){ settings.installSeen = true; saveSettings(); }
  }
  document.getElementById('closeInstallBtn').addEventListener('click', close);
  document.getElementById('installDoneBtn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  guideBtn.addEventListener('click', () => { closeSettings(); open(); });

  if(settings.installSeen) return;
  // wait until the foyer has handed over to the app, so it never covers danno waking up
  const root = document.documentElement;
  const tryShow = () => {
    if(root.classList.contains('foyer-open')) return false;
    setTimeout(open, 700);
    return true;
  };
  if(tryShow()) return;
  const mo = new MutationObserver(() => { if(tryShow()) mo.disconnect(); });
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
})();
