/* Service Worker registration with update handling */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Noor Service Worker ready:', registration.scope);

        // Handle updates gracefully
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, silently reload on next navigation
                console.log('New Noor content available');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  });
}
