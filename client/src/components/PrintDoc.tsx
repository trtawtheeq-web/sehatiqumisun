import hukoomiLogo from "@/assets/hukoomi-logo.svg";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";
import sehhatyLogo from "@/assets/sehhaty-header.png.asset.json";
import { useLang } from "@/i18n/LanguageContext";

type Platform = "sehhaty" | "medical";

type Props = {
  platform: Platform;
  serviceTitle: string;
};

function fmtNow(lang: "ar" | "en") {
  const d = new Date();
  const locale = lang === "ar" ? "ar-QA" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Print-only header + footer.
 * Hidden on screen, shown only when the page is printed / saved as PDF.
 * Displays the platform logo, service name, issue time, and page URL.
 */
export default function PrintDoc({ platform, serviceTitle }: Props) {
  const { lang } = useLang();
  const pick = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const platformLogo = platform === "sehhaty" ? sehhatyLogo.url : medicalBoardLogo.url;
  const platformName =
    platform === "sehhaty"
      ? pick("منصّة صحّتي", "My Health Platform")
      : pick("القومسيون الطبي", "Medical Commission");
  const authority = pick("وزارة الصحة العامة — دولة قطر", "Ministry of Public Health — State of Qatar");
  const issued = fmtNow(lang);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* Header — repeated at top of the printed area */}
      <div className="print-only print-header" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="print-header-inner">
          <div className="print-logos">
            <img src={hukoomiLogo} alt="Hukoomi" className="print-logo" />
            <img src={platformLogo} alt={platformName} className="print-logo" />
          </div>
          <div className="print-title">
            <div className="print-platform">{platformName}</div>
            <div className="print-service">{serviceTitle}</div>
            <div className="print-authority">{authority}</div>
          </div>
        </div>
        <div className="print-rule" />
      </div>

      {/* Footer — repeated at bottom of the printed area */}
      <div className="print-only print-footer" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="print-rule" />
        <div className="print-footer-inner">
          <span>{pick("تاريخ الإصدار:", "Issued:")} {issued}</span>
          <span className="print-url">{url}</span>
        </div>
      </div>
    </>
  );
}