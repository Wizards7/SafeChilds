// The opening splash's ready signal (components/Splash.tsx). Whoever knows that the first screen is in place calls
// markSplashReady(): WelcomeGate when Home stays, Welcome when it mounts after the redirect, Splash itself on every
// other route once the incident store has answered. Idempotent; listeners run at once if the signal already fired.

declare global {
  interface Window {
    __scSplash?: { hide: () => void; fail: () => void };
  }
}

let ready = false;
const listeners = new Set<() => void>();

export function markSplashReady(): void {
  if (ready) return;
  ready = true;
  for (const fn of listeners) fn();
  listeners.clear();
}

export function onSplashReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => undefined;
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
