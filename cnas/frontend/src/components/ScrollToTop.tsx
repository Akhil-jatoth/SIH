import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component automatically scrolls the window and primary scroll
 * containers back to the top whenever the user navigates to a new page/route.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    // Reset document element & body scroll
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset main content container if it has its own scrollbar
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};
