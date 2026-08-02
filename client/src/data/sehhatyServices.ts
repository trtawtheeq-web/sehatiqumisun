import {
  CalendarClock,
  FlaskConical,
  Pill,
  FileText,
  Syringe,
  Activity,
  ShieldAlert,
  RefreshCw,
  UserPlus,
  LogIn,
  Download,
  Baby,
  HeartPulse,
  Stethoscope,
  MonitorSmartphone,
  CalendarPlus,
  Plane,
  FileClock,
  ShieldPlus,
  HeartHandshake,
  Brain,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SehhatyCategoryKey =
  | "access"
  | "records"
  | "appointments"
  | "family";

export type SehhatyCategory = {
  key: SehhatyCategoryKey;
  labelAr: string;
  labelEn: string;
};

export const SEHHATY_CATEGORIES: SehhatyCategory[] = [
  { key: "access", labelAr: "الدخول والتسجيل", labelEn: "Access & Registration" },
  { key: "records", labelAr: "السجل الطبي", labelEn: "Medical Records" },
  { key: "appointments", labelAr: "المواعيد والأدوية", labelEn: "Appointments & Medications" },
  { key: "family", labelAr: "الرعاية العائلية", labelEn: "Family Care" },
];

export type SehhatyService = {
  key: string;
  category: SehhatyCategoryKey;
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

export const SEHHATY_SERVICES: SehhatyService[] = [
  {
    key: "register",
    category: "access",
    icon: UserPlus,
    titleAr: "التسجيل في خدمة صحتي",
    titleEn: "Register for My Health Service",
    descAr: "أنشئ حساباً جديداً في بوابة صحتي للاطلاع على ملفك الطبي إلكترونياً.",
    descEn: "Create a new My Health account to access your medical file online.",
  },
  {
    key: "login",
    category: "access",
    icon: LogIn,
    titleAr: "تسجيل الدخول إلى بوابة صحتي",
    titleEn: "Log in to My Health Portal",
    descAr: "ادخل إلى حسابك في بوابة صحتي عبر رقم الهوية القطرية.",
    descEn: "Access your My Health account using your Qatari ID.",
  },
  {
    key: "appointments",
    category: "appointments",
    icon: CalendarClock,
    titleAr: "عرض وإدارة المواعيد الطبية",
    titleEn: "View & Manage Medical Appointments",
    descAr: "استعرض مواعيدك القادمة والسابقة في مستشفيات مؤسسة حمد الطبية ومراكز الرعاية الأولية.",
    descEn: "View your upcoming and past appointments at HMC hospitals and Primary Health Care centers.",
  },
  {
    key: "lab-results",
    category: "records",
    icon: FlaskConical,
    titleAr: "الاطلاع على نتائج الفحوصات المخبرية",
    titleEn: "View Laboratory Test Results",
    descAr: "اطّلع على نتائج تحاليل الدم والفحوصات المخبرية بمجرد اعتمادها.",
    descEn: "Access blood tests and lab results as soon as they are approved.",
  },
  {
    key: "medications",
    category: "appointments",
    icon: Pill,
    titleAr: "قائمة الأدوية الحالية",
    titleEn: "Current Medications List",
    descAr: "قائمة كاملة بالأدوية الموصوفة لك مع الجرعات وتعليمات الاستخدام.",
    descEn: "A complete list of your prescribed medications with dosages and instructions.",
  },
  {
    key: "prescription-refill",
    category: "appointments",
    icon: RefreshCw,
    titleAr: "طلب تجديد الوصفات الطبية",
    titleEn: "Request Prescription Refill",
    descAr: "أرسل طلب تجديد لوصفتك الطبية إلكترونياً دون الحاجة لزيارة العيادة.",
    descEn: "Submit a prescription refill request online without visiting the clinic.",
  },
  {
    key: "reports",
    category: "records",
    icon: FileText,
    titleAr: "التقارير الطبية والملخصات",
    titleEn: "Medical Reports & Summaries",
    descAr: "حمّل ملخصات الزيارات والتقارير الطبية الرسمية بصيغة PDF.",
    descEn: "Download visit summaries and official medical reports as PDF.",
  },
  {
    key: "immunizations",
    category: "records",
    icon: Syringe,
    titleAr: "سجل التطعيمات",
    titleEn: "Immunization Record",
    descAr: "سجل رسمي بالتطعيمات التي تلقيتها أنت وأفراد عائلتك.",
    descEn: "Official record of vaccinations received by you and your family.",
  },
  {
    key: "vitals",
    category: "records",
    icon: Activity,
    titleAr: "المؤشرات الحيوية والقياسات",
    titleEn: "Vitals & Measurements",
    descAr: "متابعة ضغط الدم، السكر، الوزن والطول وسائر القياسات الحيوية.",
    descEn: "Track blood pressure, glucose, weight, height and other vital measurements.",
  },
  {
    key: "allergies",
    category: "records",
    icon: ShieldAlert,
    titleAr: "الحساسية والتنبيهات الطبية",
    titleEn: "Allergies & Medical Alerts",
    descAr: "قائمة بأنواع الحساسية والتنبيهات المهمة لفريق الرعاية الصحية.",
    descEn: "List of allergies and important alerts for your healthcare team.",
  },
  {
    key: "history",
    category: "records",
    icon: HeartPulse,
    titleAr: "التاريخ المرضي والحالات المزمنة",
    titleEn: "Medical History & Chronic Conditions",
    descAr: "عرض التاريخ المرضي والحالات المزمنة المسجّلة في ملفك الصحي.",
    descEn: "View your recorded medical history and chronic conditions.",
  },
  {
    key: "family-access",
    category: "family",
    icon: Baby,
    titleAr: "الوصول إلى ملفات الأبناء",
    titleEn: "Access Children's Records",
    descAr: "ربط ملفات الأبناء دون سن 12 سنة بحسابك للاطلاع على معلوماتهم الطبية.",
    descEn: "Link records of children under 12 to your account to view their medical information.",
  },
  {
    key: "proxy-access",
    category: "family",
    icon: Stethoscope,
    titleAr: "تفويض الوصول لأحد أفراد الأسرة",
    titleEn: "Delegate Access to a Family Member",
    descAr: "منح تفويض رسمي لفرد من العائلة للاطلاع على ملفك الصحي بشكل آمن.",
    descEn: "Grant official proxy access to a family member to view your health record securely.",
  },
  {
    key: "teleconsultation",
    category: "appointments",
    icon: MonitorSmartphone,
    titleAr: "الاستشارة الطبية عن بُعد",
    titleEn: "Remote Medical Consultation",
    descAr: "احجز استشارة فيديو أو صوتية مع طبيب مؤسسة الرعاية الصحية الأولية دون الحاجة لزيارة المركز الصحي.",
    descEn: "Book a video or audio consultation with a PHCC physician without visiting the health center.",
  },
  {
    key: "vaccination-booking",
    category: "appointments",
    icon: CalendarPlus,
    titleAr: "حجز موعد تطعيم",
    titleEn: "Book a Vaccination Appointment",
    descAr: "احجز موعداً لتطعيمات الأطفال أو الإنفلونزا الموسمية أو تطعيمات السفر في أقرب مركز صحي.",
    descEn: "Book an appointment for childhood, seasonal flu or travel vaccinations at the nearest health center.",
  },
  {
    key: "hajj-clearance",
    category: "records",
    icon: Plane,
    titleAr: "الشهادة الصحية للحج والعمرة",
    titleEn: "Hajj & Umrah Health Clearance",
    descAr: "استخرج شهادة اللياقة الصحية والتطعيمات المطلوبة (الحمى الشوكية والحمى الصفراء) لأداء فريضة الحج والعمرة.",
    descEn: "Issue the health fitness certificate and required vaccinations (meningococcal, yellow fever) for Hajj and Umrah.",
  },
  {
    key: "sick-leave",
    category: "records",
    icon: FileClock,
    titleAr: "طلب واعتماد الإجازة المرضية",
    titleEn: "Sick Leave Request & Verification",
    descAr: "اطلب إجازة مرضية إلكترونية بعد الاستشارة الطبية أو تحقّق من صحة إجازة سابقة عبر رمز QR الرسمي.",
    descEn: "Request an electronic sick leave after a medical consultation, or verify a previous leave via the official QR code.",
  },
  {
    key: "dependent-vaccinations",
    category: "family",
    icon: ShieldPlus,
    titleAr: "سجل تطعيمات الأبناء",
    titleEn: "Children's Vaccination Record",
    descAr: "استعرض سجل تطعيمات أبنائك المرتبطين بحسابك وحمّل شهادة التطعيم الرسمية لأغراض المدرسة والسفر.",
    descEn: "View the vaccination record of your linked children and download the official certificate for school and travel.",
  },
  {
    key: "chronic-care",
    category: "appointments",
    icon: HeartHandshake,
    titleAr: "متابعة الأمراض المزمنة",
    titleEn: "Chronic Disease Follow-up",
    descAr: "برنامج متابعة إلكتروني للأمراض المزمنة كالسكري وارتفاع ضغط الدم يشمل قياسات دورية وتذكيرات علاجية.",
    descEn: "An electronic follow-up program for chronic conditions like diabetes and hypertension with regular readings and treatment reminders.",
  },
  {
    key: "mental-health",
    category: "appointments",
    icon: Brain,
    titleAr: "خدمات الصحة النفسية والدعم",
    titleEn: "Mental Health & Support Services",
    descAr: "احجز جلسة استشارية مع مختصي الصحة النفسية أو تواصل مع خط الدعم النفسي في مؤسسة حمد الطبية.",
    descEn: "Book a session with mental-health specialists or reach the psychological support line at HMC.",
  },
  {
    key: "health-awareness",
    category: "records",
    icon: Sparkles,
    titleAr: "النصائح والتوعية الصحية",
    titleEn: "Health Tips & Awareness",
    descAr: "محتوى توعوي مخصص حسب عمرك وحالتك الصحية يشمل التغذية والنشاط البدني والوقاية من الأمراض.",
    descEn: "Personalized awareness content based on your age and health status, covering nutrition, physical activity and disease prevention.",
  },
];