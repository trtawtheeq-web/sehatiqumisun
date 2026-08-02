import {
  CalendarCheck,
  UserPlus,
  Search,
  Stethoscope,
  RefreshCw,
  CalendarPlus,
  Plane,
  Users,
  FileCheck,
  UtensilsCrossed,
  HeartPulse,
  Award,
  Heart,
  Home as HomeIcon,
  Eye,
  type LucideIcon,
} from "lucide-react";

export type ServiceIndexEntry = {
  key: string;
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  category: ServiceCategoryKey;
};

export type ServiceCategoryKey =
  | "registration-appointments"
  | "residency-work"
  | "health-certificates"
  | "special-exams";

export type ServiceCategory = {
  key: ServiceCategoryKey;
  labelAr: string;
  labelEn: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    key: "registration-appointments",
    labelAr: "التسجيل والمواعيد",
    labelEn: "Registration & Appointments",
  },
  {
    key: "residency-work",
    labelAr: "الإقامة والعمل",
    labelEn: "Residency & Employment",
  },
  {
    key: "health-certificates",
    labelAr: "الشهادات الصحية والمهن",
    labelEn: "Health Certificates & Professions",
  },
  {
    key: "special-exams",
    labelAr: "فحوصات خاصة",
    labelEn: "Special Examinations",
  },
];

export const SERVICE_INDEX: ServiceIndexEntry[] = [
  {
    key: "booking",
    category: "registration-appointments",
    icon: CalendarCheck,
    titleAr: "حجز موعد للفحص بالقومسيون الطبي",
    titleEn: "Book a Medical Commission Exam Appointment",
  },
  {
    key: "register",
    category: "registration-appointments",
    icon: UserPlus,
    titleAr: "طلب التسجيل الإلكتروني في القومسيون الطبي",
    titleEn: "Request Online Registration with the Medical Commission",
  },
  {
    key: "results",
    category: "registration-appointments",
    icon: Search,
    titleAr: "الاطلاع على نتائج الفحص بالقومسيون الطبي",
    titleEn: "Check Medical Commission Examination Results",
  },
  {
    key: "residency-exam",
    category: "residency-work",
    icon: Stethoscope,
    titleAr: "الفحص الطبي لإصدار الإقامة والعمل",
    titleEn: "Medical Fitness Examination for Residency & Employment",
  },
  {
    key: "visit-to-residency",
    category: "residency-work",
    icon: RefreshCw,
    titleAr: "تحويل تأشيرة الزيارة إلى إقامة",
    titleEn: "Convert Visit Visa to Residency",
  },
  {
    key: "visit-extension",
    category: "residency-work",
    icon: CalendarPlus,
    titleAr: "الفحص الطبي لتمديد تأشيرة الزيارة",
    titleEn: "Medical Examination for Visit Visa Extension",
  },
  {
    key: "return-visa",
    category: "residency-work",
    icon: Plane,
    titleAr: "الفحص الطبي لتأشيرة العودة (بعد غياب أكثر من 6 أشهر)",
    titleEn: "Medical Examination for Return Visa (Absence Over 6 Months)",
  },
  {
    key: "sponsor-change",
    category: "residency-work",
    icon: Users,
    titleAr: "الفحص الطبي لتغيير الكفالة",
    titleEn: "Medical Examination for Sponsor Change",
  },
  {
    key: "fitness-certificate",
    category: "health-certificates",
    icon: FileCheck,
    titleAr: "إصدار شهادة اللياقة الطبية",
    titleEn: "Issuing Medical Fitness Certificate",
  },
  {
    key: "food-workers",
    category: "health-certificates",
    icon: UtensilsCrossed,
    titleAr: "الشهادة الصحية للعاملين في المهن الحساسة",
    titleEn: "Health Certificate for Sensitive-Profession Workers",
  },
  {
    key: "healthcare-practitioners",
    category: "health-certificates",
    icon: HeartPulse,
    titleAr: "الفحص الطبي لمزاولي المهن الصحية",
    titleEn: "Medical Examination for Healthcare Practitioners",
  },
  {
    key: "citizenship-exam",
    category: "special-exams",
    icon: Award,
    titleAr: "الفحص الطبي للمتقدمين للحصول على الجنسية القطرية",
    titleEn: "Medical Examination for Qatari Nationality Applicants",
  },
  {
    key: "premarital",
    category: "special-exams",
    icon: Heart,
    titleAr: "فحص ما قبل الزواج",
    titleEn: "Premarital Medical Screening",
  },
  {
    key: "domestic-workers",
    category: "residency-work",
    icon: HomeIcon,
    titleAr: "الفحص الطبي للعمالة المنزلية الجديدة",
    titleEn: "Medical Examination for New Domestic Workers",
  },
  {
    key: "driving-eye-test",
    category: "special-exams",
    icon: Eye,
    titleAr: "فحص النظر لتحويل رخصة القيادة الأجنبية إلى قطرية",
    titleEn: "Eye Test for Converting Foreign Driving License to Qatari",
  },
];