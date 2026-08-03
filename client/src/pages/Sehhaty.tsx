import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Clock,
  Phone,
  Mail,
  Globe,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  FileText,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";
import {
  SEHHATY_SERVICES,
  SEHHATY_CATEGORIES,
  type SehhatyCategoryKey,
  type SehhatyService,
} from "@/data/sehhatyServices";

type FilterKey = "all" | SehhatyCategoryKey;

const Sehhaty = () => {
  const { lang, pick, dir } = useLang();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;
  const [filter, setFilter] = useState<FilterKey>("all");

  const renderRow = (s: SehhatyService) => {
    const Icon = s.icon;
    return (
      <Link
        key={s.key}
        to={`/sehhaty/services/${s.key}`}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-card text-foreground hover:bg-secondary/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className={`text-sm font-bold leading-snug break-words ${lang === "ar" ? "text-right" : "text-left"}`}>
            {pick(s.titleAr, s.titleEn)}
          </span>
        </div>
        <Chevron className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      </Link>
    );
  };

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: pick("جميع الخدمات", "All Services") },
    ...SEHHATY_CATEGORIES.map((c) => ({
      key: c.key as FilterKey,
      label: pick(c.labelAr, c.labelEn),
    })),
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SiteHeader />

      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary">{pick("الصفحة الرئيسية", "Home")}</Link>
          <Chevron className="h-3 w-3" />
          <span className="text-foreground font-medium">{pick("خدمة صحتي", "My Health")}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
        <section className="mb-6">
          <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-md mb-3">
            {pick("الصحة", "Health")}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-2">
            {pick("خدمة صحتي — بوابة المرضى الإلكترونية", "My Health — Patient Portal")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pick(
              "خدمة إلكترونية تقدمها مؤسسة حمد الطبية ومؤسسة الرعاية الصحية الأولية تتيح لك الاطلاع على ملفك الطبي ونتائج الفحوصات وتفاصيل الأدوية والمواعيد من أي مكان.",
              "An electronic service by Hamad Medical Corporation and the Primary Health Care Corporation that lets you access your medical file, test results, medications and appointments from anywhere."
            )}
          </p>
        </section>

        <div className="mb-5 -mx-3 sm:mx-0 overflow-x-auto">
          <div className="flex gap-2 px-3 sm:px-0 min-w-max">
            {tabs.map((t) => {
              const active = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`text-[12px] font-bold px-3.5 py-2 rounded-full border transition-all whitespace-nowrap ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border/60 hover:bg-secondary/60"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {filter === "all" ? (
          <div className="flex flex-col gap-6">
            {SEHHATY_CATEGORIES.map((cat) => {
              const items = SEHHATY_SERVICES.filter((s) => s.category === cat.key);
              if (items.length === 0) return null;
              return (
                <section key={cat.key}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                    <h2 className="text-[13px] font-extrabold text-foreground">
                      {pick(cat.labelAr, cat.labelEn)}
                    </h2>
                    <span className="text-[11px] text-muted-foreground">({items.length})</span>
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl p-2 shadow-sm">
                    <div className="flex flex-col gap-1">{items.map(renderRow)}</div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-2xl p-2 shadow-sm">
            <div className="flex flex-col gap-1">
              {SEHHATY_SERVICES.filter((s) => s.category === filter).map(renderRow)}
            </div>
          </div>
        )}

        {/* Useful info */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-3 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-[13px] font-extrabold text-foreground">
              {pick("معلومات تهمّك", "Useful Information")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("تطبيق صحتي", "My Health App")}
                </h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {pick(
                  "متوفر مجاناً على iOS و Android للوصول السريع لملفك الطبي وحجز المواعيد وطلب تجديد الأدوية.",
                  "Available free on iOS and Android for quick access to your medical file, appointments and prescription refills."
                )}
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("توفر الخدمة", "Service Availability")}
                </h3>
              </div>
              <ul className="text-[12px] text-muted-foreground leading-relaxed space-y-0.5">
                <li>{pick("البوابة والتطبيق: متاح 24/7", "Portal & App: available 24/7")}</li>
                <li>{pick("دعم نسمعك: 16060", "Nesmauk Support: 16060")}</li>
                <li>{pick("دعم حياك: 107", "Hayyak Support: 107")}</li>
              </ul>
              <Link to="/sehhaty/info/support" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                {pick("قنوات الدعم", "Support channels")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("التواصل", "Contact")}
                </h3>
              </div>
              <ul className="text-[12px] text-muted-foreground leading-relaxed space-y-1">
                <li className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-primary" />
                  <span dir="ltr">16060</span>
                  <span>— {pick("نسمعك", "Nesmauk")}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-primary" />
                  <span dir="ltr">myhealth@hamad.qa</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span dir="ltr">myhealth.hamad.qa</span>
                </li>
              </ul>
              <Link to="/sehhaty/info/support" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                {pick("قنوات التواصل", "Contact channels")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("أسئلة شائعة", "Frequently Asked")}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <details className="group rounded-lg border border-border/60 bg-background/40 open:bg-secondary/40 transition-colors">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-2.5 text-[12px] font-bold text-foreground">
                    <span>{pick("من يستطيع التسجيل في صحتي؟", "Who can register for My Health?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "كل من يحمل رقم مؤسسي (Medical Record) في مؤسسة حمد الطبية أو مؤسسة الرعاية الصحية الأولية ولديه بطاقة شخصية قطرية سارية.",
                      "Anyone with a Medical Record Number at HMC or PHCC and a valid Qatari ID card."
                    )}
                  </p>
                </details>
                <details className="group rounded-lg border border-border/60 bg-background/40 open:bg-secondary/40 transition-colors">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-2.5 text-[12px] font-bold text-foreground">
                    <span>{pick("هل يمكنني رؤية نتائج فحوصات أبنائي؟", "Can I view my children's results?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "نعم، يمكن ربط ملفات الأبناء دون سن 12 سنة تلقائياً بحسابك، أما من هم أكبر فيتطلب تفويضاً رسمياً.",
                      "Yes, records of children under 12 are linked automatically; older dependents require formal proxy authorization."
                    )}
                  </p>
                </details>
                <details className="group rounded-lg border border-border/60 bg-background/40 open:bg-secondary/40 transition-colors">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-2.5 text-[12px] font-bold text-foreground">
                    <span>{pick("هل الخدمة مجانية؟", "Is the service free?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "نعم، خدمة صحتي مقدَّمة مجاناً لجميع المرضى المسجّلين لدى مؤسسة حمد الطبية ومؤسسة الرعاية الصحية الأولية.",
                      "Yes, My Health is offered free of charge to all patients registered with HMC and PHCC."
                    )}
                  </p>
                </details>
              </div>
              <Link to="/sehhaty/info/faq" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
                {pick("جميع الأسئلة الشائعة", "All FAQs")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-foreground mb-1">
                {pick("خصوصية بياناتك محفوظة", "Your Data Privacy is Protected")}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {pick(
                  "بيانات ملفك الطبي محميّة ومشفّرة وفق أعلى معايير الأمان، ولا يمكن الوصول إليها إلا من خلال حسابك الشخصي في بوابة صحتي.",
                  "Your medical file is encrypted and protected to the highest security standards, accessible only through your personal My Health account."
                )}
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Sehhaty;