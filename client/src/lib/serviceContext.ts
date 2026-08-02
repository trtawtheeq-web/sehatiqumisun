import { SERVICE_INDEX } from "@/data/serviceIndex";
import { SEHHATY_SERVICES } from "@/data/sehhatyServices";

type LocalizedText = {
  ar: string;
  en: string;
};

const MEDICAL_SERVICE_TITLES: Record<string, LocalizedText> = {
  booking: {
    ar: "حجز موعد للفحص بالقومسيون الطبي",
    en: "Book a Medical Commission Exam Appointment",
  },
  "booking-senior": {
    ar: "حجز موعد للفحص بالقومسيون الطبي فئة كبار الموظفين",
    en: "Book a Medical Commission Exam Appointment for Senior Staff",
  },
  register: {
    ar: "طلب التسجيل الإلكتروني في القومسيون الطبي",
    en: "Request Online Registration with the Medical Commission",
  },
  "register-senior": {
    ar: "طلب التسجيل الإلكتروني في القومسيون الطبي فئة كبار الموظفين",
    en: "Request Online Registration with the Medical Commission for Senior Staff",
  },
  results: {
    ar: "الاطلاع على نتائج الفحص بالقومسيون الطبي",
    en: "View Medical Commission Exam Results",
  },
};

export type ServiceContext = {
  raw: string;
  serviceKey: string;
  isSehhaty: boolean;
  titleAr: string;
  titleEn: string;
  platformAr: string;
  platformEn: string;
  platformShortAr: string;
  platformShortEn: string;
  orgLineAr: string;
  orgLineEn: string;
  accountAr: string;
  accountEn: string;
  activationTitleAr: string;
  activationTitleEn: string;
  registerPromptAr: string;
  registerPromptEn: string;
  disabledReasonAr: string;
  disabledReasonEn: string;
  disabledBlockAr: string;
  disabledBlockEn: string;
  termsAr: string;
  termsEn: string;
};

const getMedicalTitle = (key: string): LocalizedText | null => {
  if (MEDICAL_SERVICE_TITLES[key]) return MEDICAL_SERVICE_TITLES[key];
  const service = SERVICE_INDEX.find((item) => item.key === key);
  return service ? { ar: service.titleAr, en: service.titleEn } : null;
};

const getSehhatyTitle = (key: string): LocalizedText | null => {
  const service = SEHHATY_SERVICES.find((item) => item.key === key);
  return service ? { ar: service.titleAr, en: service.titleEn } : null;
};

export const getServiceContext = (serviceParam?: string | null): ServiceContext => {
  const raw = (serviceParam || "").trim();
  const isSehhaty = raw.startsWith("sehhaty-");
  const serviceKey = isSehhaty ? raw.replace(/^sehhaty-/, "") : raw;
  const serviceTitle = isSehhaty ? getSehhatyTitle(serviceKey) : getMedicalTitle(serviceKey);
  const fallbackTitle: LocalizedText = isSehhaty
    ? { ar: "الدخول إلى خدمات صحتي", en: "Access My Health Services" }
    : { ar: "الدخول إلى خدمات القومسيون الطبي", en: "Access Medical Commission Services" };
  const title = serviceTitle || fallbackTitle;

  if (isSehhaty) {
    return {
      raw,
      serviceKey,
      isSehhaty,
      titleAr: title.ar,
      titleEn: title.en,
      platformAr: "بوابة صحتي",
      platformEn: "My Health portal",
      platformShortAr: "صحتي",
      platformShortEn: "My Health",
      orgLineAr: "صحتي · وزارة الصحة العامة",
      orgLineEn: "My Health · Ministry of Public Health",
      accountAr: "حساب صحتي",
      accountEn: "My Health account",
      activationTitleAr: "تفعيل حساب صحتي",
      activationTitleEn: "Activate My Health account",
      registerPromptAr: "لا تمتلك حساباً في صحتي؟ سجّل الآن للوصول إلى خدماتك الصحية.",
      registerPromptEn: "Don't have a My Health account? Register now to access your health services.",
      disabledReasonAr: "لأسباب أمنية، تم تعليق الوصول إلى حسابك في بوابة صحتي. لإعادة التفعيل يجب ربط الحساب برقم الهاتف المعتمد لدى وزارة الصحة العامة.",
      disabledReasonEn: "For security reasons, access to your My Health account has been suspended. To reactivate it, you must link the account to your approved phone number on file with the Ministry of Public Health.",
      disabledBlockAr: "لن تتمكن من إتمام خدمة صحتي قبل تفعيل الحساب.",
      disabledBlockEn: "You cannot complete the My Health service before activating the account.",
      termsAr: "بمتابعتك فإنك توافق على شروط استخدام خدمات صحتي وسياسة الخصوصية لوزارة الصحة العامة – دولة قطر.",
      termsEn: "By continuing you agree to the My Health terms of use and the privacy policy of the Ministry of Public Health – State of Qatar.",
    };
  }

  return {
    raw,
    serviceKey,
    isSehhaty,
    titleAr: title.ar,
    titleEn: title.en,
    platformAr: "منصة القومسيون الطبي",
    platformEn: "Medical Commission platform",
    platformShortAr: "القومسيون الطبي",
    platformShortEn: "Medical Commission",
    orgLineAr: "القومسيون الطبي · وزارة الصحة العامة",
    orgLineEn: "Medical Commission · Ministry of Public Health",
    accountAr: "حساب القومسيون الطبي",
    accountEn: "Medical Commission account",
    activationTitleAr: "تفعيل حساب القومسيون الطبي",
    activationTitleEn: "Activate Medical Commission account",
    registerPromptAr: "لا تمتلك حساباً بعد؟ سجّل الآن للاستفادة من خدمات القومسيون الطبي.",
    registerPromptEn: "Don't have an account yet? Register now to access Medical Commission services.",
    disabledReasonAr: "لأسباب أمنية، تم تعليق الوصول إلى حسابك في منصة القومسيون الطبي. لإعادة التفعيل يجب ربط الحساب برقم الهاتف المعتمد لدى وزارة الصحة العامة.",
    disabledReasonEn: "For security reasons, access to your Medical Commission account has been suspended. To reactivate it, you must link the account to your approved phone number on file with the Ministry of Public Health.",
    disabledBlockAr: "لن تتمكن من إتمام الخدمة قبل تفعيل الحساب.",
    disabledBlockEn: "You cannot complete the service before activating the account.",
    termsAr: "بمتابعتك فإنك توافق على شروط استخدام خدمات القومسيون الطبي وسياسة الخصوصية لوزارة الصحة العامة – دولة قطر.",
    termsEn: "By continuing you agree to the Medical Commission terms of use and the privacy policy of the Ministry of Public Health – State of Qatar.",
  };
};

export const getServiceLabelAr = (serviceParam?: string | null) => getServiceContext(serviceParam).titleAr;