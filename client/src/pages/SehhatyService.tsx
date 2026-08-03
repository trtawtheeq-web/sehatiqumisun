import { useMemo, useState, useEffect} from "react";
import { navigateToPage } from "@/lib/store";
import { Link, useLocation, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrintDoc from "@/components/PrintDoc";
import PdfPreview from "@/components/PdfPreview";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useLang } from "@/i18n/LanguageContext";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  FileDown,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { SEHHATY_SERVICES } from "@/data/sehhatyServices";
import { toast } from "@/hooks/use-toast";

type Detail = {
  publishedAt: { ar: string; en: string };
  steps: { ar: string[]; en: string[] };
  fees: { ar: string; en: string };
  info: { ar: string[]; en: string[] };
};

const fee = (n: number) => ({ ar: `${n} ريال قطري لكل طلب.`, en: `QAR ${n} per request.` });
const PUB = { ar: "10 مارس 2022", en: "10 March 2022" };

// Requirements — kept in a separate map so we don't have to touch every
// service block above. Any service without an explicit entry falls back to
// the common baseline (Qatari ID + active My Health account + verified phone).
const REQ_COMMON = {
  ar: [
    "رقم الهوية القطرية ساري المفعول.",
    "حساب مفعّل في بوابة صحتي.",
    "رقم هاتف مسجّل في وزارة الصحة العامة لاستقبال رمز التحقق (OTP).",
    "اتصال إنترنت مستقر ومتصفح حديث أو تطبيق صحتي الرسمي.",
  ],
  en: [
    "A valid Qatari ID.",
    "An active account on the My Health portal.",
    "A phone number registered with MOPH to receive the OTP.",
    "A stable internet connection and a modern browser or the official My Health app.",
  ],
};

const REQUIREMENTS: Record<string, { ar: string[]; en: string[] }> = {
  register: {
    ar: [
      "رقم الهوية القطرية ساري المفعول.",
      "تاريخ الميلاد كما هو مسجّل في البطاقة الشخصية.",
      "رقم هاتف مسجّل مسبقاً في مؤسسة حمد الطبية أو مراكز الرعاية الصحية الأولية.",
      "بريد إلكتروني فعّال (اختياري) لاستلام إشعارات الحساب.",
    ],
    en: [
      "A valid Qatari ID.",
      "Date of birth as recorded on the ID card.",
      "A phone number previously registered with HMC or PHCC.",
      "An active email address (optional) to receive account notifications.",
    ],
  },
  login: {
    ar: [
      "رقم الهوية القطرية ساري المفعول.",
      "كلمة مرور صحتي المفعّلة.",
      "الهاتف المسجّل قريب لاستقبال رمز التحقق.",
    ],
    en: [
      "A valid Qatari ID.",
      "Your active My Health password.",
      "Access to the registered phone to receive the OTP.",
    ],
  },
  app: {
    ar: [
      "جهاز يعمل بنظام iOS 13 فأعلى أو Android 8 فأعلى.",
      "مساحة تخزين لا تقل عن 150 ميغابايت.",
      "حساب في متجر التطبيقات لتحميل تطبيق صحتي الرسمي.",
    ],
    en: [
      "A device running iOS 13+ or Android 8+.",
      "At least 150 MB of free storage.",
      "An App Store / Google Play account to download the official My Health app.",
    ],
  },
  "prescription-refill": {
    ar: [
      ...REQ_COMMON.ar,
      "أن يكون الدواء ضمن قائمة الأدوية المزمنة المعتمدة من الطبيب المعالج.",
      "تحديد الصيدلية المفضّلة لاستلام الوصفة.",
    ],
    en: [
      ...REQ_COMMON.en,
      "The medication must be on the approved chronic list from the treating physician.",
      "Selecting a preferred pharmacy for collection.",
    ],
  },
  teleconsultation: {
    ar: [
      ...REQ_COMMON.ar,
      "كاميرا وميكروفون يعملان على الجهاز.",
      "بيئة هادئة وإضاءة مناسبة لضمان جودة الاستشارة.",
      "الخدمة غير مخصصة للحالات الطارئة — للطوارئ يُرجى الاتصال بـ 999.",
    ],
    en: [
      ...REQ_COMMON.en,
      "A working camera and microphone on your device.",
      "A quiet environment with good lighting for a quality consultation.",
      "Not for emergencies — call 999 in urgent cases.",
    ],
  },
  "vaccination-booking": {
    ar: [
      ...REQ_COMMON.ar,
      "تحديد نوع التطعيم المطلوب (طفولة، إنفلونزا موسمية، سفر…).",
      "بالنسبة للأطفال: ربط ملف الطفل بحساب ولي الأمر مسبقاً.",
    ],
    en: [
      ...REQ_COMMON.en,
      "Selecting the required vaccine type (childhood, seasonal flu, travel…).",
      "For children: link the child's file to a guardian account beforehand.",
    ],
  },
  "hajj-clearance": {
    ar: [
      ...REQ_COMMON.ar,
      "إتمام التطعيمات المطلوبة للحج والعمرة (السحائي الرباعي…).",
      "جواز سفر ساري المفعول لتضمين البيانات في الشهادة.",
    ],
    en: [
      ...REQ_COMMON.en,
      "Completing the required Hajj/Umrah vaccinations (quadrivalent meningococcal…).",
      "A valid passport so its data can appear on the certificate.",
    ],
  },
  "sick-leave": {
    ar: [
      ...REQ_COMMON.ar,
      "زيارة طبية موثّقة في مؤسسة حكومية خلال الفترة المطلوبة.",
      "تصديق الطبيب المعالج على الإجازة إلكترونياً.",
    ],
    en: [
      ...REQ_COMMON.en,
      "A documented medical visit at a government facility within the requested period.",
      "Electronic certification of the sick leave by the treating physician.",
    ],
  },
  "family-access": {
    ar: [
      ...REQ_COMMON.ar,
      "رقم الهوية القطرية للطفل وتاريخ ميلاده.",
      "ولي الأمر مسجّل رسمياً في وثيقة الحالة العائلية.",
    ],
    en: [
      ...REQ_COMMON.en,
      "The child's Qatari ID and date of birth.",
      "The guardian must be officially registered in the family record.",
    ],
  },
  "proxy-access": {
    ar: [
      ...REQ_COMMON.ar,
      "بيانات الشخص المُفوَّض (رقم الهوية ورقم الهاتف).",
      "موافقة الطرفين إلكترونياً على شروط التفويض.",
    ],
    en: [
      ...REQ_COMMON.en,
      "The delegate's details (Qatari ID and phone number).",
      "Electronic acceptance of the delegation terms by both parties.",
    ],
  },
  "mental-health": {
    ar: [
      ...REQ_COMMON.ar,
      "الخدمة سرّية بالكامل — لا تُشارك النتائج مع أي جهة دون إذن المستخدم.",
      "في الحالات الحرجة يُرجى التواصل مع خط الدعم النفسي 16000 مباشرة.",
    ],
    en: [
      ...REQ_COMMON.en,
      "The service is fully confidential — results are never shared without your consent.",
      "In critical cases, contact the mental-health hotline 16000 directly.",
    ],
  },
};

const DETAILS: Record<string, Detail> = {
  register: {
    publishedAt: PUB,
    steps: {
      ar: [
        "زيارة بوابة صحتي الإلكترونية أو تحميل تطبيق صحتي.",
        "الضغط على «تسجيل مستخدم جديد».",
        "إدخال رقم الهوية القطرية وتاريخ الميلاد ورقم الهاتف المسجّل في وزارة الصحة.",
        "إدخال رمز التحقق (OTP) المُرسل إلى رقم الهاتف.",
        "إنشاء كلمة مرور آمنة وتأكيد الحساب.",
      ],
      en: [
        "Visit the My Health portal or download the My Health app.",
        "Click on \"Register New User\".",
        "Enter your Qatari ID, date of birth and the phone number registered with MOPH.",
        "Enter the OTP sent to your phone number.",
        "Create a secure password and confirm the account.",
      ],
    },
    fees: fee(5),
    info: {
      ar: [
        "يجب أن يكون رقم الهاتف مطابقاً للرقم المسجّل في مؤسسة حمد الطبية أو الرعاية الصحية الأولية.",
        "في حال عدم استلام رمز التحقق يمكن تحديث رقم الهاتف من أقرب مركز صحي.",
      ],
      en: [
        "Your phone number must match the one registered with HMC or PHCC.",
        "If you do not receive the OTP, update your phone number at the nearest health center.",
      ],
    },
  },
  login: {
    publishedAt: PUB,
    steps: {
      ar: [
        "فتح بوابة صحتي أو تطبيق صحتي.",
        "إدخال رقم الهوية القطرية وكلمة المرور.",
        "إدخال رمز التحقق المُرسل إلى الهاتف عند الطلب.",
        "الوصول إلى الملف الصحي والخدمات المتاحة.",
      ],
      en: [
        "Open the My Health portal or app.",
        "Enter your Qatari ID and password.",
        "Enter the OTP sent to your phone if requested.",
        "Access your health record and available services.",
      ],
    },
    fees: fee(8),
    info: {
      ar: [
        "في حال نسيان كلمة المرور اضغط «نسيت كلمة المرور» لإعادة تعيينها عبر رمز التحقق.",
        "لأسباب الأمان يتم قفل الحساب مؤقتاً بعد عدة محاولات دخول فاشلة.",
      ],
      en: [
        "If you forget your password, click \"Forgot Password\" to reset it via OTP.",
        "For security, the account is temporarily locked after several failed attempts.",
      ],
    },
  },
  app: {
    publishedAt: PUB,
    steps: {
      ar: [
        "فتح متجر التطبيقات (App Store أو Google Play).",
        "البحث عن «Sehhaty» أو «صحتي».",
        "تحميل التطبيق الرسمي الصادر عن وزارة الصحة العامة.",
        "تسجيل الدخول بحساب صحتي أو إنشاء حساب جديد.",
      ],
      en: [
        "Open the App Store or Google Play.",
        "Search for \"Sehhaty\".",
        "Download the official app published by MOPH.",
        "Log in with your My Health account or create a new one.",
      ],
    },
    fees: fee(10),
    info: {
      ar: [
        "التطبيق متوفر لأجهزة iOS 13 فأعلى وأجهزة Android 8 فأعلى.",
        "يدعم التطبيق تسجيل الدخول ببصمة الإصبع أو التعرف على الوجه.",
      ],
      en: [
        "The app supports iOS 13+ and Android 8+.",
        "It supports login via fingerprint or face recognition.",
      ],
    },
  },
  appointments: {
    publishedAt: PUB,
    steps: {
      ar: [
        "تسجيل الدخول إلى بوابة صحتي.",
        "اختيار قسم «المواعيد» من القائمة الجانبية.",
        "استعراض المواعيد القادمة والسابقة.",
        "الضغط على «إلغاء» أو «إعادة جدولة» عند الحاجة.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Select \"Appointments\" from the sidebar.",
        "Browse upcoming and past appointments.",
        "Click \"Cancel\" or \"Reschedule\" as needed.",
      ],
    },
    fees: fee(12),
    info: {
      ar: [
        "يمكن إلغاء الموعد أو إعادة جدولته حتى 24 ساعة قبل الميعاد.",
        "تصلك رسالة نصية تذكيرية قبل الموعد بيوم واحد.",
      ],
      en: [
        "Appointments can be cancelled or rescheduled up to 24 hours in advance.",
        "You will receive an SMS reminder one day before the appointment.",
      ],
    },
  },
  "lab-results": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى بوابة صحتي.",
        "الانتقال إلى «السجل الطبي» ثم «نتائج الفحوصات».",
        "اختيار الفحص المطلوب لعرض نتائجه.",
        "تحميل النتيجة بصيغة PDF عند الحاجة.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Go to \"Medical Record\" then \"Lab Results\".",
        "Select the test to view its results.",
        "Download the result as PDF if needed.",
      ],
    },
    fees: fee(15),
    info: {
      ar: [
        "تظهر النتائج فور اعتمادها من الطبيب المختص.",
        "بعض الفحوصات الحساسة تُسلَّم عبر الطبيب مباشرة.",
      ],
      en: [
        "Results appear as soon as they are approved by the specialist.",
        "Some sensitive results are shared through the physician directly.",
      ],
    },
  },
  medications: {
    publishedAt: PUB,
    steps: {
      ar: [
        "تسجيل الدخول إلى صحتي.",
        "اختيار قسم «الأدوية».",
        "استعراض قائمة الأدوية الحالية والسابقة والجرعات.",
      ],
      en: [
        "Log in to My Health.",
        "Select the \"Medications\" section.",
        "Browse the list of current and past medications with dosages.",
      ],
    },
    fees: fee(18),
    info: {
      ar: ["تُحدَّث القائمة تلقائياً بعد كل زيارة يصف فيها الطبيب دواءً جديداً."],
      en: ["The list updates automatically after every visit where a new medication is prescribed."],
    },
  },
  "prescription-refill": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي واختيار قسم «الأدوية».",
        "اختيار الدواء المطلوب تجديده والضغط على «طلب تجديد».",
        "اختيار الصيدلية المناسبة لاستلام الوصفة.",
        "استلام إشعار عند جهوزية الوصفة.",
      ],
      en: [
        "Log in to My Health and open the \"Medications\" section.",
        "Select the medication to refill and click \"Request Refill\".",
        "Choose the pharmacy to collect the prescription.",
        "Receive a notification when the prescription is ready.",
      ],
    },
    fees: fee(20),
    info: {
      ar: [
        "الخدمة متاحة للأدوية المزمنة المعتمدة من الطبيب المعالج.",
        "لا يمكن تجديد الأدوية المخدرة أو المؤثرات النفسية إلكترونياً.",
      ],
      en: [
        "The service is available for chronic medications approved by the treating physician.",
        "Narcotic and psychotropic medications cannot be refilled online.",
      ],
    },
  },
  reports: {
    publishedAt: PUB,
    steps: {
      ar: [
        "تسجيل الدخول إلى بوابة صحتي.",
        "اختيار قسم «التقارير والملخصات».",
        "اختيار الزيارة أو التقرير المطلوب.",
        "تحميل الملف بصيغة PDF أو إرساله بالبريد الإلكتروني.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Select \"Reports & Summaries\".",
        "Choose the visit or report needed.",
        "Download the file as PDF or send it by email.",
      ],
    },
    fees: fee(22),
    info: {
      ar: ["التقارير الرسمية المختومة تُصدر من المستشفى مباشرة عند طلبها لأغراض قانونية."],
      en: ["Officially stamped reports are issued directly from the hospital when required for legal purposes."],
    },
  },
  immunizations: {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "فتح قسم «التطعيمات».",
        "استعراض السجل الكامل للتطعيمات والتواريخ.",
        "تحميل شهادة التطعيم بصيغة PDF.",
      ],
      en: [
        "Log in to My Health.",
        "Open the \"Immunizations\" section.",
        "View the full record of vaccinations and dates.",
        "Download the vaccination certificate as PDF.",
      ],
    },
    fees: fee(25),
    info: {
      ar: ["تشمل السجلات تطعيمات الطفولة والتطعيمات الموسمية وتطعيمات السفر."],
      en: ["Records include childhood, seasonal and travel vaccinations."],
    },
  },
  vitals: {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار قسم «المؤشرات الحيوية».",
        "استعراض القياسات (الضغط، السكر، الوزن، الطول…).",
        "متابعة الرسوم البيانية للتغيرات مع الوقت.",
      ],
      en: [
        "Log in to My Health.",
        "Select \"Vitals & Measurements\".",
        "Review readings (BP, glucose, weight, height…).",
        "Track charts of changes over time.",
      ],
    },
    fees: fee(28),
    info: {
      ar: ["يمكن ربط بعض الأجهزة الذكية لإرسال القياسات تلقائياً إلى الملف الصحي."],
      en: ["Some smart devices can be linked to send measurements automatically to your record."],
    },
  },
  allergies: {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار قسم «الحساسية والتنبيهات».",
        "استعراض قائمة الحساسية والتنبيهات المسجّلة.",
      ],
      en: [
        "Log in to My Health.",
        "Open \"Allergies & Alerts\".",
        "Review the recorded allergies and alerts.",
      ],
    },
    fees: fee(30),
    info: {
      ar: ["لإضافة نوع حساسية جديد يجب مراجعة الطبيب لتوثيقه رسمياً في الملف الصحي."],
      en: ["To add a new allergy, visit your physician for it to be officially recorded."],
    },
  },
  history: {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار قسم «التاريخ المرضي».",
        "استعراض الحالات المزمنة والعمليات السابقة.",
      ],
      en: [
        "Log in to My Health.",
        "Select the \"Medical History\" section.",
        "Review chronic conditions and past surgeries.",
      ],
    },
    fees: fee(32),
    info: {
      ar: ["يمكن مشاركة التاريخ المرضي مع الطبيب أثناء الزيارة عبر رمز QR داخل التطبيق."],
      en: ["You can share your medical history with the physician during the visit via a QR code in the app."],
    },
  },
  "family-access": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار «إدارة العائلة» ثم «إضافة طفل».",
        "إدخال رقم الهوية القطرية للطفل وتاريخ ميلاده.",
        "تأكيد الربط عبر رمز التحقق.",
      ],
      en: [
        "Log in to My Health.",
        "Choose \"Family Management\" then \"Add Child\".",
        "Enter the child's Qatari ID and date of birth.",
        "Confirm the link via the OTP code.",
      ],
    },
    fees: fee(35),
    info: {
      ar: [
        "الخدمة متاحة تلقائياً للأبناء دون سن 12 سنة.",
        "بعد سن 12 يتم إيقاف الربط تلقائياً حفاظاً على الخصوصية.",
      ],
      en: [
        "Available automatically for children under 12.",
        "After age 12, the link is disabled automatically to protect privacy.",
      ],
    },
  },
  "proxy-access": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار «التفويضات» ثم «تفويض فرد من العائلة».",
        "إدخال بيانات الشخص المُفوَّض والموافقة على الشروط.",
        "تأكيد التفويض عبر رمز التحقق.",
      ],
      en: [
        "Log in to My Health.",
        "Select \"Proxies\" then \"Delegate a Family Member\".",
        "Enter the delegate's details and accept the terms.",
        "Confirm the proxy via the OTP code.",
      ],
    },
    fees: fee(38),
    info: {
      ar: [
        "يمكن سحب التفويض في أي وقت من قسم «التفويضات».",
        "الشخص المُفوَّض يرى فقط المعلومات التي تسمح بها الإعدادات.",
      ],
      en: [
        "The proxy can be revoked at any time from the \"Proxies\" section.",
        "The delegate only sees the information you allow through settings.",
      ],
    },
  },
  teleconsultation: {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى تطبيق أو بوابة صحتي.",
        "اختيار «الاستشارة عن بُعد» ثم تحديد التخصص المطلوب.",
        "اختيار الموعد المناسب من القائمة المتاحة.",
        "الانضمام إلى مكالمة الفيديو مع الطبيب في الوقت المحدد.",
        "استلام الوصفة الطبية والتقرير في ملفك الصحي.",
      ],
      en: [
        "Log in to the My Health app or portal.",
        "Choose \"Remote Consultation\" and select the required specialty.",
        "Pick a suitable slot from the available list.",
        "Join the video call with the physician at the scheduled time.",
        "Receive the prescription and report in your health file.",
      ],
    },
    fees: fee(40),
    info: {
      ar: [
        "الخدمة متاحة لخدمات الطب العام والمتابعة والوصفات المزمنة.",
        "لا تُستخدم الخدمة في الحالات الطارئة — يُرجى الاتصال بـ 999.",
        "يجب توفر اتصال إنترنت مستقر وكاميرا وميكروفون.",
      ],
      en: [
        "The service covers general practice, follow-ups and chronic prescriptions.",
        "Not for emergencies — call 999 in urgent cases.",
        "A stable internet connection, camera and microphone are required.",
      ],
    },
  },
  "vaccination-booking": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى بوابة صحتي.",
        "اختيار «التطعيمات» ثم «حجز موعد جديد».",
        "تحديد نوع التطعيم (طفولة، إنفلونزا موسمية، سفر…).",
        "اختيار المركز الصحي والموعد المناسب.",
        "استلام رسالة تأكيد الحجز عبر SMS.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Select \"Vaccinations\" then \"Book New Appointment\".",
        "Choose the vaccine type (childhood, seasonal flu, travel…).",
        "Pick the health center and slot that suits you.",
        "Receive the SMS booking confirmation.",
      ],
    },
    fees: fee(42),
    info: {
      ar: [
        "التطعيمات الأساسية والموسمية مجانية لجميع سكان قطر.",
        "بعض تطعيمات السفر (كالحمى الصفراء) قد تتطلب رسوماً في العيادات الخاصة.",
      ],
      en: [
        "Core and seasonal vaccinations are free for all residents of Qatar.",
        "Certain travel vaccines (e.g. yellow fever) may involve fees at private clinics.",
      ],
    },
  },
  "hajj-clearance": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى بوابة صحتي.",
        "اختيار «الشهادة الصحية للحج والعمرة».",
        "إتمام حجز موعد التطعيمات المطلوبة (الحمى الشوكية بشكل إلزامي).",
        "إجراء الفحص الطبي وأخذ التطعيمات في المركز الصحي المحدد.",
        "تحميل الشهادة الصحية الرسمية بصيغة PDF مع رمز QR.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Select \"Hajj & Umrah Health Clearance\".",
        "Book the required vaccination appointment (meningococcal is mandatory).",
        "Complete the medical check and vaccinations at the designated health center.",
        "Download the official health certificate as PDF with a QR code.",
      ],
    },
    fees: fee(45),
    info: {
      ar: [
        "الشهادة صالحة لمدة 3 سنوات لتطعيم الحمى الشوكية.",
        "يُنصح بالحصول على الشهادة قبل السفر بـ 10 أيام على الأقل لضمان فعالية التطعيم.",
      ],
      en: [
        "The certificate is valid for 3 years for the meningococcal vaccine.",
        "It is recommended to obtain the certificate at least 10 days before travel to ensure vaccine effectiveness.",
      ],
    },
  },
  "sick-leave": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى بوابة صحتي.",
        "اختيار «الإجازات المرضية».",
        "لطلب إجازة جديدة: إتمام الاستشارة الطبية أولاً.",
        "لاعتماد إجازة سابقة: إدخال الرقم المرجعي أو مسح رمز QR.",
        "تحميل الإجازة بصيغة PDF لإرسالها إلى جهة العمل.",
      ],
      en: [
        "Log in to the My Health portal.",
        "Choose the \"Sick Leaves\" section.",
        "To request a new leave: complete the medical consultation first.",
        "To verify a past leave: enter the reference number or scan the QR code.",
        "Download the leave as PDF to submit to your employer.",
      ],
    },
    fees: fee(48),
    info: {
      ar: [
        "تُصدر الإجازة المرضية فقط بعد تشخيص طبي رسمي من طبيب معتمد.",
        "يمكن لجهة العمل التحقق من صحة الإجازة عبر رمز QR أو الرقم المرجعي.",
      ],
      en: [
        "A sick leave is issued only after an official diagnosis by a certified physician.",
        "Employers can verify the leave via the QR code or reference number.",
      ],
    },
  },
  "dependent-vaccinations": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار «إدارة العائلة» ثم الطفل المطلوب.",
        "فتح قسم «سجل التطعيمات» الخاص به.",
        "استعراض التطعيمات المكتملة والقادمة.",
        "تحميل شهادة التطعيم الرسمية بصيغة PDF.",
      ],
      en: [
        "Log in to My Health.",
        "Open \"Family Management\" and pick the child.",
        "Open their \"Vaccination Record\" section.",
        "Review completed and upcoming vaccinations.",
        "Download the official vaccination certificate as PDF.",
      ],
    },
    fees: fee(15),
    info: {
      ar: [
        "تظهر جميع تطعيمات الطفل من الولادة حتى سن 12 سنة تلقائياً.",
        "الشهادة معتمدة رسمياً من وزارة الصحة العامة لأغراض المدرسة والسفر.",
      ],
      en: [
        "All vaccinations from birth to age 12 appear automatically.",
        "The certificate is officially recognized by MOPH for school and travel purposes.",
      ],
    },
  },
  "chronic-care": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار «الأمراض المزمنة» ثم تحديد الحالة (سكري، ضغط…).",
        "تسجيل القياسات الدورية (سكر الدم، ضغط الدم…) يدوياً أو من جهاز مرتبط.",
        "الاطلاع على تذكيرات الأدوية والزيارات القادمة.",
        "التواصل مع فريق الرعاية عند تجاوز أي قياس الحدود الطبيعية.",
      ],
      en: [
        "Log in to My Health.",
        "Choose \"Chronic Diseases\" and select the condition (diabetes, hypertension…).",
        "Log periodic measurements (glucose, blood pressure…) manually or from a linked device.",
        "Review medication reminders and upcoming visits.",
        "Contact the care team when any reading exceeds normal ranges.",
      ],
    },
    fees: fee(20),
    info: {
      ar: [
        "البرنامج متاح للمرضى المسجّلين في عيادات الأمراض المزمنة بمؤسسة الرعاية الأولية.",
        "يمكن ربط أجهزة قياس السكر والضغط الذكية المعتمدة لإرسال البيانات تلقائياً.",
      ],
      en: [
        "The program is available for patients registered in PHCC chronic disease clinics.",
        "Approved smart glucose and BP devices can be linked to send readings automatically.",
      ],
    },
  },
  "mental-health": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "اختيار «الصحة النفسية والدعم».",
        "اختيار نوع الخدمة: استشارة، جلسة متابعة، أو خط دعم فوري.",
        "حجز الموعد مع أحد المختصين بسرية تامة.",
        "حضور الجلسة عبر الفيديو أو زيارة العيادة المحددة.",
      ],
      en: [
        "Log in to My Health.",
        "Select \"Mental Health & Support\".",
        "Choose the service type: consultation, follow-up, or immediate support line.",
        "Book an appointment with a specialist in full confidentiality.",
        "Attend the session via video or visit the designated clinic.",
      ],
    },
    fees: fee(25),
    info: {
      ar: [
        "تُعامَل جميع الجلسات بسرية تامة ولا تُشارَك مع جهة العمل أو العائلة دون إذن.",
        "خط الدعم النفسي متاح على الرقم 16000 على مدار الساعة.",
      ],
      en: [
        "All sessions are fully confidential and are not shared with employers or family without consent.",
        "The psychological support hotline 16000 is available 24/7.",
      ],
    },
  },
  "health-awareness": {
    publishedAt: PUB,
    steps: {
      ar: [
        "الدخول إلى صحتي.",
        "فتح قسم «النصائح والتوعية».",
        "استعراض المحتوى المخصص حسب الفئة العمرية والحالة الصحية.",
        "الاشتراك في الحملات والتذكيرات الموسمية (تطعيم الإنفلونزا، فحوصات الكشف المبكر…).",
      ],
      en: [
        "Log in to My Health.",
        "Open the \"Tips & Awareness\" section.",
        "Browse personalized content by age and health status.",
        "Subscribe to seasonal campaigns and reminders (flu vaccination, early screening…).",
      ],
    },
    fees: fee(30),
    info: {
      ar: [
        "جميع المحتويات مُراجَعة من قِبل أطباء ومختصي التغذية في وزارة الصحة العامة.",
        "يمكن تفعيل أو إيقاف الإشعارات من إعدادات الحساب في أي وقت.",
      ],
      en: [
        "All content is reviewed by MOPH physicians and nutrition specialists.",
        "You can enable or disable notifications from account settings at any time.",
      ],
    },
  },
};

const SehhatyService = () => {
  const [, navigate] = useLocation();
  const { lang, pick, dir } = useLang();
  const { key } = useParams<{ key: string }>();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const activeKey = key ?? "";
  const service = useMemo(
    () => SEHHATY_SERVICES.find((s) => s.key === activeKey),
    [activeKey]
  );
  const detail = DETAILS[activeKey];

  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (!service || !detail) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <SiteHeader />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-extrabold text-foreground mb-3">
            {pick("الخدمة غير موجودة", "Service not found")}
          </h1>
          <Link to="/sehhaty" className="text-primary font-bold hover:underline">
            {pick("العودة إلى صحتي", "Back to My Health")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const title = pick(service.titleAr, service.titleEn);
  const description = pick(service.descAr, service.descEn);
  const steps = pick(detail.steps.ar, detail.steps.en);
  const info = pick(detail.info.ar, detail.info.en);
  const fees = pick(detail.fees.ar, detail.fees.en);
  const publishedAt = pick(detail.publishedAt.ar, detail.publishedAt.en);
  const requirements = pick(
    (REQUIREMENTS[activeKey]?.ar ?? REQ_COMMON.ar),
    (REQUIREMENTS[activeKey]?.en ?? REQ_COMMON.en),
  );

  // CTA text + destination tuned to the specific service so the button
  // always matches the page title / user's intent.
  const cta = useMemo(() => {
    switch (activeKey) {
      case "register":
        return {
          label: pick("التسجيل في صحتي", "Register on My Health"),
          to: "/medical-login?service=sehhaty-register",
        };
      case "login":
        return {
          label: pick("تسجيل الدخول إلى صحتي", "Log in to My Health"),
          to: "/medical-login?service=sehhaty-login",
        };
      default:
        return {
          label: pick("الدخول إلى صحتي", "Access My Health"),
          to: `/medical-login?service=sehhaty-${activeKey}`,
        };
    }
  }, [activeKey, pick]);

  const sections = [
    { id: "desc", label: pick("وصف الخدمة", "Service Description") },
    { id: "steps", label: pick("الخطوات", "Steps") },
    { id: "requirements", label: pick("المتطلبات", "Requirements") },
    { id: "fees", label: pick("الرسوم", "Fees") },
    { id: "info", label: pick("المعلومات الإضافية", "Additional Info") },
    { id: "options", label: pick("خيارات الصفحة", "Page Options") },
  ];

  useEffect(() => {
    navigateToPage("تفاصيل الخدمة");
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <PrintDoc platform="sehhaty" serviceTitle={title} />
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 flex-1 overflow-hidden">
            <Link to="/" className="hover:text-primary shrink-0">{pick("الصفحة الرئيسية", "Home")}</Link>
            <Chevron className="h-3 w-3 shrink-0" />
            <Link to="/sehhaty" className="hover:text-primary shrink-0">{pick("صحتي", "My Health")}</Link>
            <Chevron className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium truncate">{title}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sticky in-page nav */}
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <p className="text-xs font-bold text-muted-foreground mb-3">{pick("في هذه الصفحة", "On this page")}</p>
            <nav className="flex flex-col text-sm">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`py-2.5 border-b border-border/50 text-muted-foreground hover:text-primary transition ${i === 0 ? (lang === "ar" ? "text-primary font-bold border-r-2 border-r-primary pr-3 -mr-px" : "text-primary font-bold border-l-2 border-l-primary pl-3 -ml-px") : ""}`}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content column */}
        <div className="min-w-0 space-y-5">
          <Link
            to="/sehhaty"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <Chevron className="h-4 w-4" />
            {pick("العودة إلى قائمة الخدمات", "Back to services list")}
          </Link>

          {/* Title block */}
          <section>
            <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-md mb-4">
              {pick("الصحة", "Health")}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-3">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mb-5">{pick("تقدمها وزارة الصحة العامة", "Provided by the Ministry of Public Health")}</p>

            <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-6 max-w-5xl">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{pick("نوع الخدمة", "Service type")}</p>
                <p className="text-sm font-bold text-foreground">{pick("خدمة إلكترونية", "E-Service")}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{pick("تم نشره في", "Published on")}</p>
                <p className="text-sm font-bold text-foreground">{publishedAt}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate(cta.to)}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 min-w-[140px] font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {cta.label}
                <Arrow className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Description card */}
          <section id="desc" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-3">{pick("وصف الخدمة", "Service Description")}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{description}</p>
          </section>

          {/* Steps card */}
          <section id="steps" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{pick("الخطوات", "Steps")}</h2>
            <ul className="space-y-1.5 text-sm text-foreground/85 leading-relaxed">
              {steps.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements card */}
          <section id="requirements" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-3">{pick("المتطلبات", "Requirements")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {pick(
                "قبل البدء بهذه الخدمة تأكد من توفر ما يلي:",
                "Before starting this service, make sure the following are ready:"
              )}
            </p>
            <ul className="space-y-1.5 text-sm text-foreground/85 leading-relaxed">
              {requirements.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Fees card */}
          <section id="fees" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-3">{pick("الرسوم", "Fees")}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{fees}</p>
          </section>

          {/* Additional info card */}
          <section id="info" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{pick("المعلومات الإضافية", "Additional Information")}</h2>
            <ul className="space-y-1.5 text-sm text-foreground/85 leading-relaxed">
              {info.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-5 border-t border-border/50 grid gap-2 text-xs text-muted-foreground">
              <Link to="/legal/contact" className="flex items-center gap-2 hover:text-primary">
                <Globe className="h-4 w-4 text-primary" />
                {pick("مركز دعم صحتي", "My Health support center")}
              </Link>
              <a href="mailto:sehhaty-support@moph.gov.qa" className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                sehhaty-support@moph.gov.qa
              </a>
              <a href="tel:16000" className="flex items-center gap-2 hover:text-primary" dir="ltr">
                <Phone className="h-4 w-4 text-primary" />
                16000
              </a>
            </div>
          </section>

          {/* Page options */}
          <section id="options" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{pick("خيارات الصفحة", "Page Options")}</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPdfOpen(true)} className="inline-flex items-center gap-2 text-xs font-bold text-foreground bg-secondary hover:bg-muted px-4 py-2.5 rounded-md">
                <Printer className="h-4 w-4" />
                {pick("طباعة", "Print")}
              </button>
              <button onClick={() => setPdfOpen(true)} className="inline-flex items-center gap-2 text-xs font-bold text-foreground bg-secondary hover:bg-muted px-4 py-2.5 rounded-md">
                <FileDown className="h-4 w-4" />
                {pick("حفظ بصيغة PDF", "Save as PDF")}
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-border/50">
              <p className="text-xs font-bold text-foreground mb-2">{pick("هل كان هذا المحتوى مفيدًا؟", "Was this content helpful?")}</p>
              <button onClick={() => setFeedbackOpen(true)} className="text-[11px] text-primary font-bold hover:underline">{pick("شاركنا رأيك", "Share your feedback")}</button>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
      <PdfPreview
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        platform="sehhaty"
        serviceTitle={title}
        data={{
          category: pick("الصحة", "Health"),
          serviceType: pick("خدمة إلكترونية", "E-Service"),
          publishedAt,
          description,
          steps,
          requirements,
          fees,
          info,
          contact: {
            center: pick("مركز دعم صحتي", "My Health support center"),
            email: "sehhaty-support@moph.gov.qa",
            phone: "16000",
          },
        }}
      />
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        serviceKey={service.key}
        serviceName={title}
        platform="sehhaty"
      />
    </div>
  );
};

export default SehhatyService;