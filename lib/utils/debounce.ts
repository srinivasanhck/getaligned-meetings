export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  wait = 4000,
  maxWait = 10000,
) {
  let t: ReturnType<typeof setTimeout> | null = null;
  let timeOfLastCall = Date.now();

  return function (...args: Parameters<F>) {
    if (t) clearTimeout(t);

    const now = Date.now();
    const elapsed = now - timeOfLastCall;
    if (elapsed >= maxWait) {
      timeOfLastCall = now;
      fn(...args);
      return;
    }

    t = setTimeout(() => {
      timeOfLastCall = Date.now();
      fn(...args);
    }, wait);
  } as F;
}
