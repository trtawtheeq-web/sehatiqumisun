import { useEffect } from "react";
import { useLocation } from "wouter";
import { socket } from "@/lib/store";

const STORAGE_KEY = "visitor_request_id";

export const setVisitorRequestId = (id: string) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch { /* ignore */ }
};

export const clearVisitorRequestId = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
};

const VisitorRedirectListener = () => {
  const [, navigate] = useLocation();

  useEffect(() => {
    const s = socket.value;
    const handleNavigate = (page: string) => {
      navigate(page);
    };
    s.on("visitor:navigate", handleNavigate);
    return () => {
      s.off("visitor:navigate", handleNavigate);
    };
  }, [navigate]);

  return null;
};

export default VisitorRedirectListener;
