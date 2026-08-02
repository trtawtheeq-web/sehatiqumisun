import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll to top on every route change so the visitor
 * always sees the new page from the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
