(() => {
  const initSuccessPopup = () => {
    const triggerBtns = document.querySelectorAll('.total .btn.full.outline, .contact-form-section form .btn.rounded');
    const popupOverlay = document.getElementById('paymentSuccessPopup');
    
    if (!triggerBtns.length || !popupOverlay) return;

    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {

        e.preventDefault();
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuccessPopup);
  } else {
    initSuccessPopup();
  }
})();
