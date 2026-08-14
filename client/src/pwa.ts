type ServiceWorkerRegistrationApi = {
  register: (scriptURL: string, options?: RegistrationOptions) => Promise<ServiceWorkerRegistration>;
};

type LoadListener = (listener: () => void) => void;

export function registerServiceWorker(
  isProduction: boolean,
  serviceWorker: ServiceWorkerRegistrationApi | undefined,
  addLoadListener: LoadListener,
): void {
  if (!isProduction || !serviceWorker) return;

  addLoadListener(() => {
    serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  });
}
