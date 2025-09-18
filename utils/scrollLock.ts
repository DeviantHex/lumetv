// utils/scrollLock.ts
let locks = 0;
let originalOverflow: string;

export function lockScroll() {
  if (locks === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks++;
}

export function unlockScroll() {
  locks = Math.max(locks - 1, 0);
  if (locks === 0) {
    document.body.style.overflow = originalOverflow || "";
  }
}
