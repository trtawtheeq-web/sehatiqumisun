import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X, FileDown } from "lucide-react";
import hukoomiLogo from "@/assets/hukoomi-logo.svg";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";
import sehhatyLogo from "@/assets/sehhaty-header.png.asset.json";
import { useLang } from "@/i18n/LanguageContext";

type Platform = "sehhaty" | "medical";

export type PdfPreviewData = {
  category: string;          // e.g. "الصحة / Health"
  serviceType: string;       // e.g. "خدمة إلكترونية"
  publishedAt: string;
  description: string;
  steps: React.ReactNode[];
  requirements?: React.ReactNode[];
  fees: string;
  info: React.ReactNode[];
  contact?: { email?: string; phone?: string; center?: string };
};

type Props = {
  open: boolean;
  onClose: () => void;
  platform: Platform;
  serviceTitle: string;
  data: PdfPreviewData;
};

function fmtNow(lang: "ar" | "en") {
  const locale = lang === "ar" ? "ar-QA" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date());
}

function makeRef() {
  const d = new Date();
  const y = d.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 899999);
  return `MOPH-${y}-${rand}`;
}

export default function PdfPreview({ open, onClose, platform, serviceTitle, data }: Props) {
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

  if (!open) return null;

  const handlePrint = () => {
    // Slight delay so the modal is fully painted before the print dialog opens.
    setTimeout(() => window.print(), 50);
  };

  return createPortal(
    <div className="pdf-preview-portal" role="dialog" aria-modal="true" dir={dir}>
      {/* Backdrop */}
      <div className="pdf-preview-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Toolbar */}
      <div className="pdf-preview-toolbar">
        <div className="pdf-preview-toolbar-title">
          <FileDown className="h-4 w-4" />
          <span>{pick("معاينة المستند قبل الحفظ / الطباعة", "Preview document before Save / Print")}</span>
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

      {/* Scrollable stage that contains the printed paper */}
      <div className="pdf-preview-stage">
        <article className="pdf-paper" dir={dir}>
          {/* Header */}
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

          {/* Document title */}
          <section className="pdf-paper-doctitle">
            <span className="pdf-badge">{data.category}</span>
            <h1>{serviceTitle}</h1>
            <p>{pick("وثيقة معلومات رسمية عن الخدمة", "Official service information document")}</p>
          </section>

          {/* Meta grid */}
          <section className="pdf-paper-meta">
            <MetaRow label={pick("نوع الخدمة", "Service type")} value={data.serviceType} />
            <MetaRow label={pick("تم نشره في", "Published on")} value={data.publishedAt} />
            <MetaRow label={pick("تاريخ الإصدار", "Issued on")} value={issued} />
            <MetaRow label={pick("الرقم المرجعي", "Reference No.")} value={ref} />
          </section>

          {/* Description */}
          <Block title={pick("وصف الخدمة", "Service Description")}>
            <p>{data.description}</p>
          </Block>

          {/* Steps */}
          <Block title={pick("خطوات الاستخدام", "Steps")}>
            <ol className="pdf-list pdf-list-ordered">
              {data.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Block>

          {/* Requirements */}
          {data.requirements && data.requirements.length > 0 && (
            <Block title={pick("المتطلبات", "Requirements")}>
              <ul className="pdf-list">
                {data.requirements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Block>
          )}

          {/* Fees */}
          <Block title={pick("الرسوم", "Fees")}>
            <p>{data.fees}</p>
          </Block>

          {/* Additional info */}
          {data.info.length > 0 && (
            <Block title={pick("المعلومات الإضافية", "Additional Information")}>
              <ul className="pdf-list">
                {data.info.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Block>
          )}

          {/* Contact */}
          {data.contact && (data.contact.email || data.contact.phone || data.contact.center) && (
            <Block title={pick("قنوات التواصل والدعم", "Support & Contact")}>
              <div className="pdf-contact">
                {data.contact.center && <div><b>{pick("مركز الدعم:", "Support center:")}</b> {data.contact.center}</div>}
                {data.contact.email && <div><b>{pick("البريد الإلكتروني:", "Email:")}</b> <span dir="ltr">{data.contact.email}</span></div>}
                {data.contact.phone && <div><b>{pick("الهاتف:", "Phone:")}</b> <span dir="ltr">{data.contact.phone}</span></div>}
              </div>
            </Block>
          )}

          {/* Signature strip */}
          <section className="pdf-signature">
            <div>
              <div className="pdf-signature-label">{pick("الجهة المُصدرة", "Issuing Authority")}</div>
              <div className="pdf-signature-value">{authority}</div>
            </div>
            <div className="pdf-signature-stamp">{platformName}</div>
          </section>

          {/* Footer */}
          <footer className="pdf-paper-footer">
            <div className="pdf-paper-rule" />
            <div className="pdf-paper-footer-inner">
              <span>{pick("تاريخ الإصدار:", "Issued:")} {issued}</span>
              <span>{pick("مرجع:", "Ref:")} {ref}</span>
              <span className="pdf-url">{url}</span>
            </div>
            <p className="pdf-disclaimer">
              {pick(
                "هذه الوثيقة تُصدر إلكترونياً لأغراض معلوماتية ولا تُغني عن السجلات الرسمية الصادرة من وزارة الصحة العامة.",
                "This document is issued electronically for informational purposes and does not replace official records issued by the Ministry of Public Health."
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pdf-block">
      <h2>{title}</h2>
      <div className="pdf-block-body">{children}</div>
    </section>
  );
}