/**
 * Lightweight Google Maps JS API loader + helpers.
 * Exposes:
 * - window.loadGoogleMaps({ libraries?: string[] }): Promise<typeof google.maps>
 * - window.hasGoogleMapsKey(): boolean
 */

(function () {
  const GOOGLE_CB = '__artisanconnectGoogleMapsInit';
  let mapsPromise = null;

  function getKey() {
    const k = (window.GOOGLE_MAPS_API_KEY || '').trim();
    return k || '';
  }

  function hasGoogleMapsKey() {
    return !!getKey();
  }

  function loadGoogleMaps({ libraries = [] } = {}) {
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (mapsPromise) return mapsPromise;

    const key = getKey();
    if (!key) {
      mapsPromise = Promise.reject(new Error('Missing GOOGLE_MAPS_API_KEY'));
      return mapsPromise;
    }

    mapsPromise = new Promise((resolve, reject) => {
      // If another loader already set the callback, reuse it.
      const prevCb = window[GOOGLE_CB];

      window[GOOGLE_CB] = () => {
        try {
          prevCb?.();
        } catch (e) {
          // ignore
        }
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error('Google Maps loaded but google.maps is unavailable'));
      };

      const libParam = Array.isArray(libraries) && libraries.length
        ? `&libraries=${encodeURIComponent(libraries.join(','))}`
        : '';

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}${libParam}&callback=${GOOGLE_CB}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });

    return mapsPromise;
  }

  window.loadGoogleMaps = loadGoogleMaps;
  window.hasGoogleMapsKey = hasGoogleMapsKey;
})();

