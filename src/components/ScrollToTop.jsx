import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll position on navigation. Two separate things were leaving pages
// opened part-way down: the browser restoring a previous scroll offset on
// reload, and a route change inheriting the outgoing page's offset.
//
// Hash navigations are left alone on purpose — the event menu links to
// #travel, #expenses and friends, and forcing the top would break those jumps.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
