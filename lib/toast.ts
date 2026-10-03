type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Shows a short confirmation at the bottom of the window. */
export function toast(message: string) {
  listeners.forEach((listener) => listener(message));
}

export function onToast(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Copies text, then confirms with a toast. Resolves to whether it worked. */
export async function copyText(text: string, message = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
    return true;
  } catch {
    toast("Couldn't copy. Select it instead.");
    return false;
  }
}
