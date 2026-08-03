import { Link, useParams } from "wouter";
import { navigateToPage } from "@/lib/store";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Clock,
  Phone,
  Mail,
  Globe,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";

type InfoKey = "app" | "support" | "faq";

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
  app: {
    icon: Smartphone,
    tagAr: "التطبيق",
    tagEn: "Application",
    titleAr: "تطبيق صحتي للجوال",
    titleEn: "My Health Mobile App",
    descAr: "الوصول لملفك الطبي والمواعيد والأدوية من خلال تطبيق مجاني على iOS و Android.",
    descEn: "Access your medical file, appointments and medications via a free iOS and Android app.",
  },
  support: {
    icon: Phone,
    tagAr: "الدعم",
    tagEn: "Support",
    titleAr: "قنوات التواصل والدعم",
    titleEn: "Contact & Support Channels",
    descAr: "قنوات الدعم الرسمية لخدمة صحتي في مؤسسة حمد الطبية ومؤسسة الرعاية الصحية الأولية.",
    descEn: "Official support channels for the My Health service at HMC and PHCC.",
  },
  faq: {
    icon: HelpCircle,
    tagAr: "المساعدة",
    tagEn: "Help",
    titleAr: "الأسئلة الشائعة",
    titleEn: "Frequently Asked Questions",
    descAr: "أكثر الأسئلة التي يطرحها المستخدمون حول خدمة صحتي.",
    descEn: "The most common questions users ask about the My Health service.",
  },
};

type Pick = (ar: string, en: string) => string;

const AppBody = ({ pick }: { pick: Pick }) => (
  <div className="flex flex-col gap-3">
    <div className="p-4 rounded-xl border border-border/60 bg-secondary/30">
      <h3 className="text-sm font-extrabold text-foreground mb-1">
        {pick("مزايا التطبيق", "App Features")}
      </h3>
      <ul className="text-[12px] text-muted-foreground leading-relaxed list-disc ps-5 space-y-1">
        <li>{pick("عرض المواعيد القادمة والسابقة", "View upcoming and past appointments")}</li>
        <li>{pick("الاطلاع على نتائج الفحوصات المخبرية", "Check laboratory results")}</li>
        <li>{pick("قائمة الأدوية وطلب تجديد الوصفات", "Medications list and prescription refills")}</li>
        <li>{pick("سجل التطعيمات والحساسية", "Immunizations and allergies record")}</li>
        <li>{pick("إشعارات مباشرة عند وصول نتيجة أو تحديث موعد", "Instant notifications for results and appointment updates")}</li>
      </ul>
    </div>
    <div className="p-4 rounded-xl border border-border/60 bg-secondary/30">
      <h3 className="text-sm font-extrabold text-foreground mb-1">
        {pick("كيفية التحميل", "How to Download")}
      </h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        {pick(
          "ابحث عن «My Health Qatar» في متجر App Store أو Google Play، ثم قم بتثبيت التطبيق وتسجيل الدخول برقم الهوية القطرية.",
          "Search for “My Health Qatar” on the App Store or Google Play, install it, and sign in using your Qatari ID."
        )}
      </p>
    </div>
  </div>
);

const SupportBody = ({ pick }: { pick: Pick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <a href="tel:16060" className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><Phone className="h-4 w-4" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">{pick("نسمعك — حمد الطبية", "Nesmauk — HMC")}</h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">16060</p>
      </div>
    </a>
    <a href="tel:107" className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><Phone className="h-4 w-4" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">{pick("حياك — الرعاية الأولية", "Hayyak — PHCC")}</h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">107</p>
      </div>
    </a>
    <a href="mailto:myhealth@hamad.qa" className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><Mail className="h-4 w-4" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">{pick("البريد الإلكتروني", "Email")}</h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">myhealth@hamad.qa</p>
      </div>
    </a>
    <a href="https://myhealth.hamad.qa" target="_blank" rel="noreferrer" className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><Globe className="h-4 w-4" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">{pick("البوابة الرسمية", "Official Portal")}</h3>
        <p className="text-[12px] text-muted-foreground" dir="ltr">myhealth.hamad.qa</p>
      </div>
    </a>
    <div className="p-4 rounded-xl border border-border/60 bg-secondary/30 flex items-start gap-3 sm:col-span-2">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><Clock className="h-4 w-4" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground mb-0.5">{pick("توفر الخدمة", "Service Availability")}</h3>
        <p className="text-[12px] text-muted-foreground">
          {pick("البوابة والتطبيق متاحان على مدار الساعة طوال أيام الأسبوع (24/7).", "The portal and app are available 24/7.")}
        </p>
      </div>
    </div>
  </div>
);

const FAQS: { ar: [string, string]; en: [string, string] }[] = [
  {
    ar: ["من يستطيع التسجيل في صحتي؟", "كل من يحمل رقم مؤسسي (Medical Record) في مؤسسة حمد الطبية أو مؤسسة الرعاية الصحية الأولية ولديه بطاقة شخصية قطرية سارية."],
    en: ["Who can register for My Health?", "Anyone with a Medical Record Number at HMC or PHCC and a valid Qatari ID card."],
  },
  {
    ar: ["هل الخدمة مجانية؟", "نعم، الخدمة مقدَّمة مجاناً لجميع المرضى المسجّلين."],
    en: ["Is the service free?", "Yes, the service is provided free of charge to all registered patients."],
  },
  {
    ar: ["هل يمكنني الاطلاع على ملفات أبنائي؟", "نعم، ملفات الأبناء دون سن 12 سنة تُربط تلقائياً، والأكبر يحتاج تفويضاً رسمياً."],
    en: ["Can I view my children's records?", "Yes, children under 12 are linked automatically; older dependents require formal proxy authorization."],
  },
  {
    ar: ["كيف أتلقى النتائج المخبرية؟", "تظهر النتائج مباشرة في بوابة صحتي فور اعتمادها من قِبَل الطبيب المختص."],
    en: ["How do I receive lab results?", "Results appear in the My Health portal as soon as they are approved by the physician."],
  },
  {
    ar: ["هل يمكنني حجز موعد جديد عبر صحتي؟", "نعم، تتيح الخدمة حجز مواعيد الرعاية الأولية وبعض عيادات حمد الطبية إلكترونياً."],
    en: ["Can I book a new appointment via My Health?", "Yes, the service allows online booking for PHCC clinics and selected HMC clinics."],
  },
];

const FaqBody = ({ pick, Chevron }: { pick: Pick; Chevron: LucideIcon }) => (
  <div className="flex flex-col gap-2">
    {FAQS.map((f, i) => (
      <details key={i} className="group rounded-lg border border-border/60 bg-secondary/30 open:bg-secondary/60 transition-colors">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-3 text-sm font-bold text-foreground">
          <span>{pick(f.ar[0], f.en[0])}</span>
          <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <p className="px-3 pb-3 text-[12px] text-muted-foreground leading-relaxed">{pick(f.ar[1], f.en[1])}</p>
      </details>
    ))}
  </div>
);

const SehhatyInfo = () => {
  const { lang, pick, dir } = useLang();
  const params = useParams<{ slug: InfoKey }>();
  const slug = (params.slug && CONTENT[params.slug] ? params.slug : "app") as InfoKey;
  const c = CONTENT[slug];
  const Icon = c.icon;
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  useEffect(() => {
    navigateToPage("معلومات صحتي");
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SiteHeader />

      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">{pick("الصفحة الرئيسية", "Home")}</Link>
          <Chevron className="h-3 w-3" />
          <Link to="/sehhaty" className="hover:text-primary">{pick("خدمة صحتي", "My Health")}</Link>
          <Chevron className="h-3 w-3" />
          <span className="text-foreground font-medium">{pick(c.titleAr, c.titleEn)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
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

        <section className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          {slug === "app" && <AppBody pick={pick} />}
          {slug === "support" && <SupportBody pick={pick} />}
          {slug === "faq" && <FaqBody pick={pick} Chevron={Chevron} />}
        </section>

        <div className="mt-6">
          <Link to="/sehhaty" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline">
            <Chevron className="h-3.5 w-3.5" />
            {pick("العودة إلى صفحة صحتي", "Back to My Health")}
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SehhatyInfo;