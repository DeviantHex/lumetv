'use client';

import { useEffect } from 'react';

export default function ScrollSlowProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY * 0.3, left: 0 }); // 0.7 = slower scroll
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return <>{children}</>;
}
