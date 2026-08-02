import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X, Loader2 } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  serviceKey?: string;
  serviceName?: string;
  platform?: string;
};

export default function FeedbackDialog({ open, onClose, serviceKey, serviceName, platform }: Props) {
  const { pick, dir } = useLang();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setComment("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (rating < 1) {
      toast({
        title: pick("يرجى اختيار تقييم", "Please choose a rating"),
        description: pick("اختر عدد النجوم من 1 إلى 5.", "Select a star rating between 1 and 5."),
        variant: "destructive",
      });
      return;
    }
    if (comment.length > 2000) return;
    setSubmitting(true);
    const { error } = await supabase.from("service_feedback").insert({
      service_key: serviceKey ?? null,
      service_name: serviceName ?? null,
      platform: platform ?? null,
      rating,
      comment: comment.trim() || null,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: pick("تعذّر إرسال التقييم", "Could not submit feedback"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: pick("شكرًا لك", "Thank you"),
      description: pick("تم تسجيل تقييمك بنجاح.", "Your feedback has been recorded."),
    });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      dir={dir}
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/40">
          <h2 className="text-sm font-bold text-foreground">
            {pick("شاركنا رأيك", "Share your feedback")}
          </h2>
          <button
            onClick={onClose}
            aria-label={pick("إغلاق", "Close")}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {serviceName && (
            <p className="text-xs text-muted-foreground">
              {pick("الخدمة:", "Service:")} <span className="font-bold text-foreground">{serviceName}</span>
            </p>
          )}
          <div>
            <p className="text-xs font-bold text-foreground mb-2">
              {pick("ما مدى رضاك عن هذه الخدمة؟", "How would you rate this service?")}
            </p>
            <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= (hover || rating);
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    aria-label={pick(`${n} نجوم`, `${n} stars`)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${filled ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ms-2 text-xs font-bold text-primary">
                  {rating}/5
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">
              {pick("تعليقك (اختياري)", "Your comment (optional)")}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 2000))}
              rows={4}
              maxLength={2000}
              placeholder={pick(
                "اكتب ملاحظاتك أو اقتراحاتك لتحسين الخدمة...",
                "Write your feedback or suggestions to help us improve..."
              )}
              className="w-full text-sm bg-secondary/60 border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-end">
              {comment.length}/2000
            </p>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border bg-secondary/30 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs font-bold text-foreground bg-secondary hover:bg-muted px-4 py-2 rounded-md"
          >
            {pick("إلغاء", "Cancel")}
          </button>
          <button
            onClick={submit}
            disabled={submitting || rating < 1}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {pick("إرسال التقييم", "Submit feedback")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}