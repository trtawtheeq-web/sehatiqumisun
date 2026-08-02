import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import qatarLogo from "@/assets/qatar-state-logo.png.asset.json";
import hukoomiLogo from "@/assets/hukoomi-logo.svg.asset.json";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";
import { getServiceContext } from "@/lib/serviceContext";

const SiteFooter = () => {
  const { pick } = useLang();
  const storedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") || "" : "";
  const ctx = getServiceContext(storedService);
  const LEGAL_LINKS: { to: string; label: string }[] = [
    { to: "/legal/about", label: pick("من نحن", "About") },
    { to: "/legal/contact", label: pick("تواصل معنا", "Contact") },
    { to: "/legal/privacy", label: pick("سياسة الخصوصية", "Privacy Policy") },
    { to: "/legal/cookies", label: pick("ملفات تعريف الارتباط", "Cookies") },
    { to: "/legal/terms", label: pick("الشروط والأحكام", "Terms & Conditions") },
    { to: "/legal/refund", label: pick("استرداد الرسوم", "Fee Refund") },
    { to: "/legal/shipping", label: pick("تسليم التقارير", "Reports Delivery") },
    { to: "/legal/disclaimer", label: pick("إخلاء المسؤولية", "Disclaimer") },
    { to: "/legal/accessibility", label: pick("إمكانية الوصول", "Accessibility") },
    { to: "/legal/ad-disclosure", label: pick("الإفصاح والشفافية", "Transparency") },
  ];
  return (
  <footer data-site-footer className="hero-gradient border-t border-primary-foreground/10 py-10 text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_65%_48%/0.15),transparent_60%)]" />
    <div className="container mx-auto flex flex-col items-center gap-5 relative z-10 px-4">
      <div className="flex items-center justify-center gap-5 flex-wrap">
        <img
          src={hukoomiLogo.url}
          alt={pick("حكومي", "Hukoomi")}
          className="h-11 w-auto bg-primary-foreground/95 rounded-md px-3 py-1.5"
          loading="lazy"
        />
        <div className="h-8 w-px bg-primary-foreground/25" />
        <img
          src={qatarLogo.url}
          alt={pick("دولة قطر", "State of Qatar")}
          className="h-11 w-auto bg-primary-foreground/95 rounded-md px-3 py-1.5"
          loading="lazy"
        />
        <div className="h-8 w-px bg-primary-foreground/25" />
        <img
          src={medicalBoardLogo.url}
          alt={pick(ctx.platformShortAr, ctx.platformShortEn)}
          className="h-11 w-auto bg-primary-foreground/95 rounded-md px-3 py-1.5"
          loading="lazy"
        />
      </div>

      <div className="text-primary-foreground font-display font-bold text-sm">
        {pick(ctx.orgLineAr, ctx.orgLineEn)}
      </div>

      <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />

      <nav
        aria-label={pick("روابط قانونية", "Legal links")}
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-5xl mx-auto"
      >
        {LEGAL_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-[11px] font-semibold text-primary-foreground/75 hover:text-gold transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />

      <p className="text-primary-foreground/65 text-[11px] leading-relaxed max-w-5xl">
        {pick(
          ctx.isSehhaty
            ? "بوابة صحتي الإلكترونية للوصول إلى خدماتك الصحية — وزارة الصحة العامة، دولة قطر."
            : "خدمة إلكترونية لحجز مواعيد الفحص والتسجيل بالقومسيون الطبي — وزارة الصحة العامة، دولة قطر.",
          ctx.isSehhaty
            ? "My Health online portal for accessing your health services — Ministry of Public Health, State of Qatar."
            : "An online service for booking Medical Commission exam appointments and registration — Ministry of Public Health, State of Qatar."
        )}
      </p>

      <p className="text-primary-foreground/50 text-[10px]">
        © {new Date().getFullYear()} {pick(`${ctx.platformShortAr} — جميع الحقوق محفوظة`, `${ctx.platformShortEn} — All rights reserved`)}
      </p>
    </div>
  </footer>
  );
};

export default SiteFooter;
