export const playScissorsSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('Audio context not available');
  }
};

export const initCursorSounds = () => {
  const init = () => {
    const clickableElements = document.querySelectorAll('button, a, .nav-link, .service-card, .gallery-item, .date-card, .time-slot, .btn');

    clickableElements.forEach((element) => {
      element.removeEventListener('click', handleClick);
      element.addEventListener('click', handleClick);
    });
  };

  const handleClick = () => {
    playScissorsSound();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const observer = new MutationObserver(() => {
    init();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

