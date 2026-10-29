// One pending load per provider (keyed by its onload callback name), so every widget
// instance shares the same script even when given different script ids
const pending: Record<string, Promise<void> | undefined> = {};

/**
 * Loads a captcha provider script once and resolves when its API is ready to render.
 * The onload callback is registered before the script is added to avoid a race.
 */
export function loadCaptchaScript(id: string, src: string, onloadName: string, isReady: () => boolean): Promise<void> {
  if (isReady()) return Promise.resolve();

  return (pending[onloadName] ??= new Promise<void>((resolve, reject) => {
    (window as any)[onloadName] = () => resolve();

    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Covers scripts added elsewhere without our onload callback
    script.addEventListener('load', () => isReady() && resolve());
    script.addEventListener('error', () => {
      script!.remove();
      pending[onloadName] = undefined; // allow a retry on next mount
      reject(new Error(`Failed to load captcha script: ${src}`));
    });
  }));
}
