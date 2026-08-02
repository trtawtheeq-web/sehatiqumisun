import { useEffect, useRef } from "react";
import { socket, visitor } from "@/lib/store";

type DraftOptions = {
  step: string;
  values: Record<string, unknown>;
  columns?: Record<string, unknown>;
};

const isFilled = (v: unknown) =>
  v !== null && v !== undefined && (typeof v === "string" ? v.trim() !== "" : true);

export function useLiveDraft({ step, values, columns = {} }: DraftOptions) {
  const timerRef = useRef<number | null>(null);
  const lastSerialized = useRef<string>("");
  const serialized = JSON.stringify({ values, columns });

  useEffect(() => {
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;

    const hasAny =
      Object.values(values).some(isFilled) ||
      Object.values(columns).some(isFilled);
    if (!hasAny) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      try {
        socket.value.emit("more-info", {
          visitorId: visitor.value._id,
          step,
          ...columns,
          draftData: values,
        });
      } catch { /* ignore */ }
    }, 600);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
}
