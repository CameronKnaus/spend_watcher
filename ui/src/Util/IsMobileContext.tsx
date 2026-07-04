// Context for returning getting if the screen is mobile screen sized. Returns true if screen is 768px+
import { useState, useEffect, use, createContext, ReactNode } from 'react';

export const MOBILE_BREAKPOINT = 768;
const mobileMatchMedia = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

export const IsMobileContext = createContext(mobileMatchMedia.matches);

export function IsMobileContextProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(mobileMatchMedia.matches);

  useEffect(() => {
    function handleMediaChange() {
      setIsMobile(mobileMatchMedia.matches);
    }

    mobileMatchMedia.addEventListener('change', handleMediaChange);

    return () => {
      mobileMatchMedia.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return <IsMobileContext value={isMobile}>{children}</IsMobileContext>;
}

// Custom hook for getting mobile screen status
export function useIsMobile() {
  return use(IsMobileContext);
}
