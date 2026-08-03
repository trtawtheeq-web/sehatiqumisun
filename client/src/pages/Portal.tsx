import { useEffect } from "react";
import { Link } from "wouter";
import { navigateToPage } from "@/lib/store";
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Clock,
  Phone,
  Globe,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";
import sehhatyLogo from "@/assets/sehhaty-logo.png.asset.json";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";

const Portal = () => {
  const { lang, pick, dir } = useLang();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  const services = [
    {
      key: "sehhaty",
      to: "/sehhaty",
      icon: HeartPulse,
      logo: sehhatyLogo.url,
      badge: pick("مؤسسة حمد الطبية", "Hamad Medical Corporation"),
      title: pick("صحتي", "My Health"),
      subtitle: pick(
        "بوابة المريض الإلكترونية لإدارة سجلك الصحي ومواعيدك ووصفاتك الطبية.",
        "The patient portal to manage your health record, appointments and prescriptions."
      ),
      features: [
        pick("الاطلاع على السجل الطبي", "View your medical record"),
        pick("حجز وإدارة المواعيد", "Book & manage appointments"),
        pick("طلب تجديد الأدوية", "Request prescription refills"),
        pick("رعاية أفراد العائلة", "Family care access"),
      ],
      cta: pick("الدخول إلى صحتي", "Open My Health"),
    },
    {
      key: "medical",
      to: "/medical-commission",
      icon: Stethoscope,
      logo: medicalBoardLogo.url,
      badge: pick("وزارة الصحة العامة", "Ministry of Public Health"),
      title: pick("القومسيون الطبي", "Medical Commission"),
      subtitle: pick(
        "خدمات الفحص الطبي للإقامة والعمل، وحجز المواعيد والاطلاع على النتائج.",
        "Medical examination services for residency and work, appointments and results."
      ),
      features: [
        pick("حجز موعد الفحص الطبي", "Book a medical exam appointment"),
        pick("الاطلاع على نتيجة الفحص", "Check examination results"),
        pick("تجديد الفحص الطبي", "Renew medical examination"),
        pick("إصدار الشهادات الصحية", "Issue health certificates"),
      ],
      cta: pick("الدخول إلى القومسيون", "Open Medical Commission"),
    },
  ];

  useEffect(() => {
    navigateToPage("البوابة الرئيسية");
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-[hsl(35_45%_92%)] via-[hsl(35_40%_95%)] to-background dark:from-primary/10 dark:via-primary/5 dark:to-background">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background-image:radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_45%),radial-gradient(circle_at_80%_60%,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-5 ring-1 ring-primary/20">
            <Sparkles className="h-3 w-3" />
            {pick("البوابة الحكومية الموحدة", "Unified Government Portal")}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight mb-4">
            {pick(<>مرحبًا بكم في منصّة <span className="text-primary">«حكومي»</span></>, <>Welcome to <span className="text-primary">Hukoomi</span> Platform</>)}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {pick(
              "الجيل الجديد للخدمات الحكومية لدولة قطر — وصول سريع وآمن وموحّد لخدمات صحتي والقومسيون الطبي.",
              "The next generation of Qatar’s government services — fast, secure and unified access to My Health and Medical Commission."
            )}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 bg-card/70 backdrop-blur border border-border/60 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3 w-3 text-primary" />
              {pick("منصّة رسمية", "Official platform")}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-card/70 backdrop-blur border border-border/60 px-3 py-1.5 rounded-full">
              <Clock className="h-3 w-3 text-primary" />
              {pick("متاحة 24/7", "Available 24/7")}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-card/70 backdrop-blur border border-border/60 px-3 py-1.5 rounded-full">
              <Globe className="h-3 w-3 text-primary" />
              {pick("عربي / English", "Arabic / English")}
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
        {/* Two main service cards */}
        <section>
          <div className="flex items-center gap-2 mb-1 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-[13px] font-extrabold text-foreground">
              {pick("الخدمات الصحية", "Health Services")}
            </h2>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-3 px-1">
            {pick(
              "خدمات صحتي والقومسيون الطبي — إحدى خدمات منصّة حكومي الموحّدة لدولة قطر.",
              "My Health and Medical Commission services — part of Qatar’s unified Hukoomi platform."
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.key}
                  to={s.to}
                  className="group relative bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all active:scale-[0.99] flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-white border border-border/60 shadow-sm">
                      <img
                        src={s.logo}
                        alt={s.title}
                        className="h-16 w-16 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary/70" />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground mb-1">
                    {s.badge}
                  </span>
                  <h3 className="text-lg font-extrabold text-foreground mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-3">
                    {s.subtitle}
                  </p>
                  <ul className="text-[12px] text-foreground/80 space-y-1 mb-4">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[12.5px] font-bold py-2.5 rounded-lg group-hover:brightness-110 transition-all">
                    {s.cta}
                    <Chevron className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Why us / features strip */}
        <section className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: ShieldCheck,
                title: pick("منصّة رسمية موثوقة", "Trusted official platform"),
                desc: pick(
                  "مقدَّمة من الجهات الحكومية المعتمدة في دولة قطر.",
                  "Provided by accredited government entities in Qatar."
                ),
              },
              {
                icon: Clock,
                title: pick("خدمات متاحة 24/7", "Available 24/7"),
                desc: pick(
                  "أنجز خدماتك الصحية في أي وقت ومن أي مكان.",
                  "Complete your health tasks anytime, anywhere."
                ),
              },
              {
                icon: Sparkles,
                title: pick("تجربة موحّدة وسهلة", "One simple experience"),
                desc: pick(
                  "واجهة واحدة تجمع لك خدمات صحتي والقومسيون الطبي.",
                  "One interface bringing My Health and Medical Commission together."
                ),
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground">
                      {f.title}
                    </h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact strip */}
        <section className="mt-8">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-foreground mb-1">
                {pick("بحاجة إلى مساعدة؟", "Need help?")}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {pick(
                  "فريق الدعم متاح لمساعدتك على مدار الساعة عبر القنوات الرسمية.",
                  "Our support team is available 24/7 through the official channels."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:16000"
                className="inline-flex items-center gap-1.5 bg-card border border-border/60 hover:border-primary/40 text-foreground text-[12px] font-bold px-3 py-2 rounded-lg"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span dir="ltr">16000</span>
              </a>
              <a
                href="mailto:info@moph.gov.qa"
                className="inline-flex items-center gap-1.5 bg-card border border-border/60 hover:border-primary/40 text-foreground text-[12px] font-bold px-3 py-2 rounded-lg"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span dir="ltr">info@moph.gov.qa</span>
              </a>
              <a
                href="https://www.moph.gov.qa"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-card border border-border/60 hover:border-primary/40 text-foreground text-[12px] font-bold px-3 py-2 rounded-lg"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span dir="ltr">moph.gov.qa</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Portal;