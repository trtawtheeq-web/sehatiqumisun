import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X, FileDown } from "lucide-react";
import hukoomiLogo from "@/assets/hukoomi-logo.svg";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";
import sehhatyLogo from "@/assets/sehhaty-header.png.asset.json";
import { useLang } from "@/i18n/LanguageContext";

export type SummaryRow = { label: string; value: string; missing?: boolean };
export type SummarySection = { title: string; rows: SummaryRow[] };

type Props = {
  open: boolean;
  onClose: () => void;
  platform: "sehhaty" | "medical";
  serviceTitle: string;
  sections: SummarySection[];
  fee: string;
  accepted: boolean;
  autoPrint?: boolean;
};

function fmtNow(lang: "ar" | "en") {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-QA" : "en-GB", {
    year: "numeric", month: "long", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date());
}

function makeRef() {
  return `REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
}

export default function RequestSummaryPreview({
  open, onClose, platform, serviceTitle, sections, fee, accepted, autoPrint,
}: Props) {
  const { lang } = useLang();
  const pick = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const platformLogo = platform === "sehhaty" ? sehhatyLogo.url : medicalBoardLogo.url;
  const platformName = platform === "sehhaty"
    ? pick("منصّة صحّتي", "My Health Platform")
    : pick("القومسيون الطبي", "Medical Commission");
  const authority = pick("وزارة الصحة العامة — دولة قطر", "Ministry of Public Health — State of Qatar");
  const issued = useMemo(() => (open ? fmtNow(lang) : ""), [open, lang]);
  const ref = useMemo(() => (open ? makeRef() : ""), [open]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setUrl(window.location.href);
    document.body.classList.add("pdf-preview-open");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("pdf-preview-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && autoPrint) {
      const id = window.setTimeout(() => window.print(), 350);
      return () => window.clearTimeout(id);
    }
  }, [open, autoPrint]);

  if (!open) return null;

  const handlePrint = () => { setTimeout(() => window.print(), 50); };
  const missingTotal = sections.reduce((n, s) => n + s.rows.filter(r => r.missing).length, 0);

  return createPortal(
    <div className="pdf-preview-portal" role="dialog" aria-modal="true" dir={dir}>
      <div className="pdf-preview-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="pdf-preview-toolbar">
        <div className="pdf-preview-toolbar-title">
          <FileDown className="h-4 w-4" />
          <span>{pick("معاينة ملخص الطلب قبل الدفع", "Preview request summary before payment")}</span>
        </div>
        <div className="pdf-preview-toolbar-actions">
          <button onClick={handlePrint} className="pdf-btn pdf-btn-primary">
            <Printer className="h-4 w-4" />
            {pick("حفظ بصيغة PDF / طباعة", "Save as PDF / Print")}
          </button>
          <button onClick={onClose} className="pdf-btn pdf-btn-ghost" aria-label={pick("إغلاق", "Close")}>
            <X className="h-4 w-4" />
            {pick("إغلاق", "Close")}
          </button>
        </div>
      </div>

      <div className="pdf-preview-stage">
        <article className="pdf-paper" dir={dir}>
          <header className="pdf-paper-header">
            <div className="pdf-paper-logos">
              <img src={hukoomiLogo} alt="Hukoomi" />
              <img src={platformLogo} alt={platformName} />
            </div>
            <div className="pdf-paper-titleblock">
              <div className="pdf-paper-platform">{platformName}</div>
              <div className="pdf-paper-authority">{authority}</div>
            </div>
          </header>

          <div className="pdf-paper-rule" />

          <section className="pdf-paper-doctitle">
            <span className="pdf-badge">{pick("ملخص الطلب", "Request summary")}</span>
            <h1>{serviceTitle}</h1>
            <p>{pick("مراجعة نهائية لبيانات الطلب قبل إتمام الدفع", "Final review of request data before payment")}</p>
          </section>

          <section className="pdf-paper-meta">
            <MetaRow label={pick("الرقم المرجعي", "Reference No.")} value={ref} />
            <MetaRow label={pick("تاريخ الإصدار", "Issued on")} value={issued} />
            <MetaRow label={pick("المنصة", "Platform")} value={platformName} />
            <MetaRow label={pick("حالة الطلب", "Status")}
              value={missingTotal > 0
                ? pick(`غير مكتمل (${missingTotal} حقل ناقص)`, `Incomplete (${missingTotal} missing)`)
                : pick("جاهز للدفع", "Ready for payment")} />
          </section>

          {sections.map((sec) => (
            <section key={sec.title} className="pdf-block">
              <h2>{sec.title}</h2>
              <div className="pdf-block-body">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
                  <tbody>
                    {sec.rows.map((r, i) => (
                      <tr key={r.label} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                        <td style={{ padding: "2mm 3mm", color: "#555", width: "45%", verticalAlign: "top" }}>{r.label}</td>
                        <td style={{ padding: "2mm 3mm", fontWeight: 700, color: r.missing ? "#b91c1c" : "#111", direction: "ltr", textAlign: dir === "rtl" ? "left" : "right" }}>
                          {r.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="pdf-block">
            <h2>{pick("الرسوم والإقرار", "Fees & Acknowledgement")}</h2>
            <div className="pdf-block-body">
              <p><b>{pick("رسوم الخدمة:", "Service fee:")}</b> {fee}</p>
              <p><b>{pick("إقرار المتقدم:", "Applicant acknowledgement:")}</b> {
                accepted
                  ? pick("تم قبول الشروط والأحكام وسياسة الخصوصية.", "Terms & Privacy Policy accepted.")
                  : pick("لم يتم قبول الشروط والأحكام بعد.", "Terms & Privacy Policy not yet accepted.")
              }</p>
            </div>
          </section>

          <section className="pdf-signature">
            <div>
              <div className="pdf-signature-label">{pick("الجهة المُصدرة", "Issuing Authority")}</div>
              <div className="pdf-signature-value">{authority}</div>
            </div>
            <div className="pdf-signature-stamp">{platformName}</div>
          </section>

          <footer className="pdf-paper-footer">
            <div className="pdf-paper-rule" />
            <div className="pdf-paper-footer-inner">
              <span>{pick("تاريخ الإصدار:", "Issued:")} {issued}</span>
              <span>{pick("مرجع:", "Ref:")} {ref}</span>
              <span className="pdf-url">{url}</span>
            </div>
            <p className="pdf-disclaimer">
              {pick(
                "هذه الوثيقة تُصدر إلكترونياً كسجل معاينة لملخص الطلب قبل الدفع، ولا تُعدّ إيصالاً رسمياً للدفع.",
                "This document is issued electronically as a pre-payment summary preview and does not constitute an official payment receipt."
              )}
            </p>
          </footer>
        </article>
      </div>
    </div>,
    document.body
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pdf-meta-row">
      <span className="pdf-meta-label">{label}</span>
      <span className="pdf-meta-value">{value}</span>
    </div>
  );
}