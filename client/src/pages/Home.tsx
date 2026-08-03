import { useState, useEffect} from "react";
import { navigateToPage } from "@/lib/store";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Clock,
  MapPin,
  Phone,
  HelpCircle,
  ShieldCheck,
  FileText,
  Globe,
  Mail,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";
import {
  SERVICE_INDEX,
  SERVICE_CATEGORIES,
  type ServiceCategoryKey,
  type ServiceIndexEntry,
} from "@/data/serviceIndex";

type FilterKey = "all" | ServiceCategoryKey;

const Home = () => {
  const { lang, pick, dir } = useLang();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;
  const [filter, setFilter] = useState<FilterKey>("all");

  const renderServiceRow = (s: ServiceIndexEntry) => {
    const Icon = s.icon;
    const title = pick(s.titleAr, s.titleEn);
    return (
      <Link
        key={s.key}
        to={`/services/${s.key}`}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-card text-foreground hover:bg-secondary/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className={`text-sm font-bold leading-snug break-words ${lang === "ar" ? "text-right" : "text-left"}`}>
            {title}
          </span>
        </div>
        <Chevron className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      </Link>
    );
  };

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: pick("جميع الخدمات", "All Services") },
    ...SERVICE_CATEGORIES.map((c) => ({
      key: c.key as FilterKey,
      label: pick(c.labelAr, c.labelEn),
    })),
  ];

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('medical-commission')) {
      navigateToPage("خدمات القومسيون الطبي");
    } else {
      navigateToPage("الصفحة الرئيسية");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <a href="/" className="hover:text-primary">{pick("الصفحة الرئيسية", "Home")}</a>
          <Chevron className="h-3 w-3" />
          <span className="text-foreground font-medium">{pick("الخدمات", "Services")}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
        {/* Page title */}
        <section className="mb-6">
          <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-md mb-3">
            {pick("الصحة", "Health")}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-2">
            {pick("خدمات القومسيون الطبي", "Medical Commission Services")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pick(
              "تقدمها وزارة الصحة العامة — اختر الخدمة المطلوبة لعرض تفاصيلها وطريقة تقديمها.",
              "Provided by the Ministry of Public Health — select a service to view its details and how to apply."
            )}
          </p>
        </section>

        {/* Category filter tabs */}
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

        {/* Services */}
        {filter === "all" ? (
          <div className="flex flex-col gap-6">
            {SERVICE_CATEGORIES.map((cat) => {
              const items = SERVICE_INDEX.filter((s) => s.category === cat.key);
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
                    <div className="flex flex-col gap-1">{items.map(renderServiceRow)}</div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-2xl p-2 shadow-sm">
            <div className="flex flex-col gap-1">
              {SERVICE_INDEX.filter((s) => s.category === filter).map(renderServiceRow)}
            </div>
          </div>
        )}

        {/* Useful information section */}
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
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("أوقات العمل", "Working Hours")}
                </h3>
              </div>
              <ul className="text-[12px] text-muted-foreground leading-relaxed space-y-0.5">
                <li>{pick("الأحد – الخميس: 7:00 ص – 2:00 م", "Sunday – Thursday: 7:00 AM – 2:00 PM")}</li>
                <li>{pick("الجمعة والسبت: مغلق", "Friday & Saturday: Closed")}</li>
                <li className="flex items-center gap-1.5 text-primary font-bold pt-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {pick("الخدمات الإلكترونية: متاحة 24/7", "Online services: available 24/7")}
                </li>
              </ul>
              <Link
                to="/info/hours"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
              >
                {pick("عرض التفاصيل", "View details")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("مراكز القومسيون الطبي", "Medical Commission Centers")}
                </h3>
              </div>
              <ul className="text-[12px] text-muted-foreground leading-relaxed space-y-0.5">
                <li>{pick("• مركز الرميلة – الدوحة", "• Rumaila Center – Doha")}</li>
                <li>{pick("• مركز أم صلال", "• Umm Salal Center")}</li>
                <li>{pick("• مركز الوكرة", "• Al Wakra Center")}</li>
                <li>{pick("• مركز الخور", "• Al Khor Center")}</li>
              </ul>
              <Link
                to="/info/centers"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
              >
                {pick("عرض جميع المراكز", "View all centers")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">
                  {pick("التواصل والدعم", "Contact & Support")}
                </h3>
              </div>
              <ul className="text-[12px] text-muted-foreground leading-relaxed space-y-1">
                <li className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-primary" />
                  <span dir="ltr">16000</span>
                  <span>— {pick("خط حكومي", "Hukoomi Line")}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-primary" />
                  <span dir="ltr">info@moph.gov.qa</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span dir="ltr">www.moph.gov.qa</span>
                </li>
              </ul>
              <Link
                to="/info/contact"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
              >
                {pick("قنوات التواصل", "Support channels")}
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
                    <span>{pick("ما المستندات المطلوبة للفحص؟", "What documents are required?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "البطاقة الشخصية القطرية أو جواز السفر ساري المفعول، صورة شخصية حديثة، ونسخة من التأشيرة أو عقد العمل عند الحاجة.",
                      "Valid Qatari ID or passport, a recent personal photo, and a copy of your visa or employment contract when required."
                    )}
                  </p>
                </details>
                <details className="group rounded-lg border border-border/60 bg-background/40 open:bg-secondary/40 transition-colors">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-2.5 text-[12px] font-bold text-foreground">
                    <span>{pick("كيف أعرف نتيجة الفحص؟", "How do I check my result?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "تظهر النتيجة خلال 3 إلى 5 أيام عمل، ويمكن الاطلاع عليها من خلال خدمة «الاطلاع على نتائج الفحص» في الأعلى باستخدام الرقم الشخصي.",
                      "Results are usually ready within 3–5 business days and can be viewed via the “Check Examination Results” service above using your Qatari ID."
                    )}
                  </p>
                </details>
                <details className="group rounded-lg border border-border/60 bg-background/40 open:bg-secondary/40 transition-colors">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 p-2.5 text-[12px] font-bold text-foreground">
                    <span>{pick("هل يمكن تغيير الموعد؟", "Can I reschedule my appointment?")}</span>
                    <Chevron className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-2.5 pb-2.5 text-[12px] text-muted-foreground leading-relaxed">
                    {pick(
                      "نعم، يمكن إعادة جدولة الموعد قبل 24 ساعة على الأقل من خلال خدمة «حجز موعد» أو بالاتصال بخط حكومي 16000.",
                      "Yes, you can reschedule at least 24 hours in advance via the “Book an Appointment” service or by calling Hukoomi at 16000."
                    )}
                  </p>
                </details>
              </div>
              <Link
                to="/info/faq"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline"
              >
                {pick("جميع الأسئلة الشائعة", "All FAQs")}
                <Chevron className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust / disclaimer strip */}
        <section className="mt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-foreground mb-1">
                {pick("منصة رسمية آمنة", "Official Secure Platform")}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {pick(
                  "جميع الخدمات مقدَّمة من وزارة الصحة العامة عبر بوابة حكومي الرسمية، ومعلوماتك محميّة ومشفّرة وفق أعلى معايير الأمان.",
                  "All services are provided by the Ministry of Public Health via the official Hukoomi portal. Your data is encrypted and protected to the highest security standards."
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

export default Home;