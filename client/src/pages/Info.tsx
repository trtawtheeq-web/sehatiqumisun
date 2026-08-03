import { Link, useParams } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  HelpCircle,
  Building2,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";

type InfoKey = "hours" | "centers" | "contact" | "faq";

type InfoContent = {
  icon: LucideIcon;
  tagAr: string;
  tagEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

const CONTENT: Record<InfoKey, InfoContent> = {
  hours: {
    icon: Clock,
    tagAr: "المواعيد",
    tagEn: "Schedule",
    titleAr: "أوقات العمل الرسمية",
    titleEn: "Official Working Hours",
    descAr: "ساعات استقبال المراجعين في جميع مراكز القومسيون الطبي التابعة لوزارة الصحة العامة.",
    descEn: "Reception hours across all Medical Commission centers of the Ministry of Public Health.",
  },
  centers: {
    icon: MapPin,
    tagAr: "المواقع",
    tagEn: "Locations",
    titleAr: "مراكز القومسيون الطبي",
    titleEn: "Medical Commission Centers",
    descAr: "قائمة المراكز المعتمدة في دولة قطر لإجراء الفحوصات الطبية الرسمية.",
    descEn: "Accredited centers in the State of Qatar for official medical examinations.",
  },
  contact: {
    icon: Phone,
    tagAr: "الدعم",
    tagEn: "Support",
    titleAr: "التواصل والدعم",
    titleEn: "Contact & Support",
    descAr: "قنوات التواصل الرسمية للحصول على المساعدة أو الاستفسار عن الخدمات.",
    descEn: "Official channels for assistance and service inquiries.",
  },
  faq: {
    icon: HelpCircle,
    tagAr: "المساعدة",
    tagEn: "Help",
    titleAr: "الأسئلة الشائعة",
    titleEn: "Frequently Asked Questions",
    descAr: "إجابات عن أكثر الأسئلة التي يطرحها المراجعون حول خدمات القومسيون الطبي.",
    descEn: "Answers to the most common questions about Medical Commission services.",
  },
};

const Info = () => {
  const { lang, pick, dir } = useLang();
  const params = useParams<{ slug: InfoKey }>();
  const slug = (params.slug && CONTENT[params.slug] ? params.slug : "hours") as InfoKey;
  const c = CONTENT[slug];
  const Icon = c.icon;
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">{pick("الصفحة الرئيسية", "Home")}</Link>
          <Chevron className="h-3 w-3" />
          <span className="text-foreground font-medium">{pick(c.tagAr, c.tagEn)}</span>
          <Chevron className="h-3 w-3" />
          <span className="text-foreground font-medium">{pick(c.titleAr, c.titleEn)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
        {/* Header */}
        <section className="mb-6">
          <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-md mb-3">
            {pick(c.tagAr, c.tagEn)}
          </span>
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight mb-1">
                {pick(c.titleAr, c.titleEn)}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pick(c.descAr, c.descEn)}
              </p>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          {slug === "hours" && <HoursBody pick={pick} />}
          {slug === "centers" && <CentersBody pick={pick} />}
          {slug === "contact" && <ContactBody pick={pick} />}
          {slug === "faq" && <FaqBody pick={pick} Chevron={Chevron} />}
        </section>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"
          >
            <Chevron className="h-3.5 w-3.5" />
            {pick("العودة إلى الصفحة الرئيسية", "Back to Home")}
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

type Pick = (ar: string, en: string) => string;

const HoursBody = ({ pick }: { pick: Pick }) => (
  <div className="flex flex-col gap-3">
    {[
      { d: pick("الأحد", "Sunday"), t: "7:00 – 14:00" },
      { d: pick("الاثنين", "Monday"), t: "7:00 – 14:00" },
      { d: pick("الثلاثاء", "Tuesday"), t: "7:00 – 14:00" },
      { d: pick("الأربعاء", "Wednesday"), t: "7:00 – 14:00" },
      { d: pick("الخميس", "Thursday"), t: "7:00 – 14:00" },
      { d: pick("الجمعة", "Friday"), t: pick("مغلق", "Closed"), closed: true },
      { d: pick("السبت", "Saturday"), t: pick("مغلق", "Closed"), closed: true },
    ].map((row) => (
      <div
        key={row.d}
        className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          {row.d}
        </div>
        <span
          className={`text-[12px] font-bold ${
            row.closed ? "text-destructive" : "text-foreground"
          }`}
          dir="ltr"
        >
          {row.t}
        </span>
      </div>
    ))}
    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
      <div className="flex items-center gap-2 text-sm font-bold text-primary">
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
        {pick("الخدمات الإلكترونية", "Online services")}
      </div>
      <span className="text-[12px] font-bold text-primary" dir="ltr">
        {pick("متاحة 24/7", "Available 24/7")}
      </span>
    </div>
    <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
      {pick(
        "الأوقات قد تختلف خلال شهر رمضان والإجازات الرسمية — يُرجى مراجعة الإعلانات الرسمية لوزارة الصحة العامة.",
        "Hours may change during Ramadan and official holidays — please check the Ministry of Public Health announcements."
      )}
    </p>
  </div>
);

const CENTERS = [
  {
    ar: "مركز الرميلة الصحي",
    en: "Rumaila Health Center",
    areaAr: "الدوحة – شارع الرميلة",
    areaEn: "Doha – Rumaila Street",
  },
  {
    ar: "مركز أم صلال الصحي",
    en: "Umm Salal Health Center",
    areaAr: "أم صلال محمد",
    areaEn: "Umm Salal Mohammed",
  },
  {
    ar: "مركز الوكرة الصحي",
    en: "Al Wakra Health Center",
    areaAr: "الوكرة",
    areaEn: "Al Wakra",
  },
  {
    ar: "مركز الخور الصحي",
    en: "Al Khor Health Center",
    areaAr: "الخور",
    areaEn: "Al Khor",
  },
  {
    ar: "مركز الشحانية الصحي",
    en: "Al Shahaniya Health Center",
    areaAr: "الشحانية",
    areaEn: "Al Shahaniya",
  },
];

const CentersBody = ({ pick }: { pick: Pick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {CENTERS.map((c) => (
      <div
        key={c.en}
        className="p-4 rounded-xl border border-border/60 bg-secondary/30 flex items-start gap-3"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-foreground mb-0.5">
            {pick(c.ar, c.en)}
          </h3>
          <p className="text-[12px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            {pick(c.areaAr, c.areaEn)}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const ContactBody = ({ pick }: { pick: Pick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <a
      href="tel:16000"
      className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Phone className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">
          {pick("خط حكومي", "Hukoomi Line")}
        </h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">16000</p>
      </div>
    </a>
    <a
      href="mailto:info@moph.gov.qa"
      className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Mail className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">
          {pick("البريد الإلكتروني", "Email")}
        </h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">info@moph.gov.qa</p>
      </div>
    </a>
    <a
      href="https://www.moph.gov.qa"
      target="_blank"
      rel="noreferrer"
      className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Globe className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">
          {pick("الموقع الرسمي", "Official Website")}
        </h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">www.moph.gov.qa</p>
      </div>
    </a>
    <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Clock className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">
          {pick("ساعات الدعم", "Support Hours")}
        </h3>
        <p className="text-[12px] text-muted-foreground">
          {pick("الأحد – الخميس، 7:00 ص – 2:00 م", "Sunday – Thursday, 7:00 AM – 2:00 PM")}
        </p>
      </div>
    </div>
  </div>
);

const FAQS: { ar: [string, string]; en: [string, string] }[] = [
  {
    ar: [
      "ما المستندات المطلوبة للفحص؟",
      "البطاقة الشخصية القطرية أو جواز السفر ساري المفعول، صورة شخصية حديثة، ونسخة من التأشيرة أو عقد العمل عند الحاجة.",
    ],
    en: [
      "What documents are required?",
      "Valid Qatari ID or passport, a recent personal photo, and a copy of your visa or employment contract when required.",
    ],
  },
  {
    ar: [
      "كيف أعرف نتيجة الفحص؟",
      "تظهر النتيجة خلال 3 إلى 5 أيام عمل، ويمكن الاطلاع عليها من خلال خدمة «الاطلاع على نتائج الفحص» باستخدام الرقم الشخصي.",
    ],
    en: [
      "How do I check my result?",
      "Results are usually ready within 3–5 business days and can be viewed via the “Check Examination Results” service using your Qatari ID.",
    ],
  },
  {
    ar: [
      "هل يمكن تغيير الموعد؟",
      "نعم، يمكن إعادة جدولة الموعد قبل 24 ساعة على الأقل من خلال خدمة «حجز موعد» أو بالاتصال بخط حكومي 16000.",
    ],
    en: [
      "Can I reschedule my appointment?",
      "Yes, you can reschedule at least 24 hours in advance via the “Book an Appointment” service or by calling Hukoomi at 16000.",
    ],
  },
  {
    ar: [
      "ما هي رسوم الخدمات؟",
      "تتراوح الرسوم بين 10 و50 ريال قطري حسب نوع الخدمة، وتُدفع إلكترونياً عبر البوابة.",
    ],
    en: [
      "What are the service fees?",
      "Fees range between QAR 10 and QAR 50 depending on the service, paid electronically via the portal.",
    ],
  },
  {
    ar: [
      "هل الخدمة متوفرة للزوار وحاملي التأشيرات؟",
      "نعم، تشمل خدمات القومسيون فحوصات الإقامة، تحويل التأشيرة، تمديد الزيارة، وتأشيرة العودة.",
    ],
    en: [
      "Is the service available for visitors and visa holders?",
      "Yes, Commission services cover residency, visa conversion, visit extension, and return visa examinations.",
    ],
  },
];

const FaqBody = ({ pick, Chevron }: { pick: Pick; Chevron: LucideIcon }) => (
  <div className="flex flex-col gap-2">
    {FAQS.map((f, i) => (
      <details
        key={i}
        className="group rounded-lg border border-border/60 bg-secondary/30 open:bg-secondary/60 transition-colors"
      >
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-3 text-sm font-bold text-foreground">
          <span>{pick(f.ar[0], f.en[0])}</span>
          <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <p className="px-3 pb-3 text-[12px] text-muted-foreground leading-relaxed">
          {pick(f.ar[1], f.en[1])}
        </p>
      </details>
    ))}
  </div>
);

export default Info;