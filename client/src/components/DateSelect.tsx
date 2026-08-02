import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageContext";

type Props = {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  hasError?: boolean;
  minYear?: number;
  maxYear?: number;
  /** newest year first (default true for DOB style) */
  descendingYears?: boolean;
};

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

const daysInMonth = (year: number, month: number) => {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
};

const DateSelect = ({
  value,
  onChange,
  hasError,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
  descendingYears = true,
}: Props) => {
  const { pick } = useLang();
  const t = (ar: string, en: string) => pick(ar, en);

  const parts = (value || "").split("-");
  const [y, setY] = useState(parts[0] || "");
  const [m, setM] = useState(parts[1] || "");
  const [d, setD] = useState(parts[2] || "");

  // sync from external value changes (e.g. reset)
  useEffect(() => {
    const p = (value || "").split("-");
    setY(p[0] || "");
    setM(p[1] || "");
    setD(p[2] || "");
  }, [value]);

  const emit = (yy: string, mm: string, dd: string) => {
    setY(yy); setM(mm); setD(dd);
    if (yy && mm && dd) {
      const maxD = daysInMonth(parseInt(yy, 10), parseInt(mm, 10));
      const safeD = Math.min(parseInt(dd, 10), maxD);
      onChange(`${yy}-${pad(parseInt(mm, 10))}-${pad(safeD)}`);
    } else {
      onChange("");
    }
  };

  const years: number[] = [];
  for (let i = maxYear; i >= minYear; i--) years.push(i);
  if (!descendingYears) years.reverse();

  const monthNum = parseInt(m || "0", 10);
  const yearNum = parseInt(y || "0", 10);
  const maxDay = daysInMonth(yearNum, monthNum);

  const trigger = `h-11 rounded-md text-base bg-white ${hasError ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="grid grid-cols-3 gap-2" dir="ltr">
      {/* Day */}
      <Select
        value={d}
        onValueChange={(v) => emit(y, m, v)}
      >
        <SelectTrigger className={trigger}>
          <SelectValue placeholder={t("اليوم", "Day")} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((n) => (
            <SelectItem key={n} value={pad(n)}>{pad(n)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Month */}
      <Select
        value={m}
        onValueChange={(v) => emit(y, v, d)}
      >
        <SelectTrigger className={trigger}>
          <SelectValue placeholder={t("الشهر", "Month")} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {MONTHS_AR.map((_, idx) => (
            <SelectItem key={idx} value={pad(idx + 1)}>
              {pad(idx + 1)} — {t(MONTHS_AR[idx], MONTHS_EN[idx])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Year */}
      <Select
        value={y}
        onValueChange={(v) => emit(v, m, d)}
      >
        <SelectTrigger className={trigger}>
          <SelectValue placeholder={t("السنة", "Year")} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {years.map((yy) => (
            <SelectItem key={yy} value={String(yy)}>{yy}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DateSelect;