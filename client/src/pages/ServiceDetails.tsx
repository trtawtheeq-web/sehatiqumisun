import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrintDoc from "@/components/PrintDoc";
import PdfPreview from "@/components/PdfPreview";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "@/hooks/use-toast";
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
  Send,
  CalendarCheck,
  UserPlus,
  Search,
  PlayCircle,
  X,
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
} from "lucide-react";
import howToRegisterVideo from "@/assets/how-to-register.mp4.asset.json";

type ServiceContent = {
  key: string;
  icon: typeof CalendarCheck;
  title: string;
  publishedAt: string;
  description: string;
  steps: React.ReactNode[];
  fees: string;
  info: React.ReactNode[];
};

// Compact list used by the Home page (title only). The full data lives below.
export const SERVICE_KEYS = [
  "booking",
  "register",
  "results",
  "residency-exam",
  "visit-to-residency",
  "visit-extension",
  "return-visa",
  "sponsor-change",
  "fitness-certificate",
  "food-workers",
  "healthcare-practitioners",
  "citizenship-exam",
  "premarital",
  "domestic-workers",
  "driving-eye-test",
] as const;

const ServiceDetails = () => {
  const [, navigate] = useLocation();
  const { lang, pick, dir } = useLang();
  const params = useParams();
  const goStart = (service?: string) => navigate(`/medical-login${service ? `?service=${service}` : ""}`);
  const handleStart = () => goStart(activeKey);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const SERVICES: ServiceContent[] = [
    {
      key: "booking",
      icon: CalendarCheck,
      title: pick("حجز موعد للفحص بالقومسيون الطبي", "Book a Medical Commission Exam Appointment"),
      publishedAt: pick("11 يناير 2021", "11 January 2021"),
      description: pick(
        "يمكن للأفراد حجز مواعيد إلكترونيًا للخضوع للفحص بالقومسيون الطبي، كما يمكن للمنشآت تسجيل مواعيد الفحص الطبي لعمالها وموظفيها إلكترونيًا قبل توجههم إلى القومسيون الطبي، وذلك من أجل إصدار الشهادات الصحية التي تستخدم لأغراض مختلفة.",
        "Individuals can book appointments online to undergo the Medical Commission exam. Establishments can also register medical exam appointments for their workers and employees online before visiting the Medical Commission, in order to issue health certificates used for various purposes."
      ),
      steps: pick(
        [
          <>الدخول إلى نظام حجز المواعيد الإلكتروني بالقومسيون الطبي.</>,
          "اختيار نوع المستخدم (شخصي/منشأة).",
          "إدخال الرقم الشخصي/رقم المنشأة وكلمة المرور، ثم الضغط على \"دخول\".",
          "إدخال البيانات المطلوبة وإرفاق كافة المستندات المطلوبة.",
          "دفع الرسوم المقررة إلكترونيًا، ثم طباعة الإيصال.",
          "في حال عدم وجود حساب مسجّل، اضغط على \"مستخدم جديد\"، ثم اختر نوع الحساب، وأدخل البيانات المطلوبة، ثم اضغط على \"تأكيد\" واتّباع التعليمات.",
        ] as React.ReactNode[],
        [
          <>Log in to the Medical Commission online appointment booking system.</>,
          "Select the user type (Personal / Establishment).",
          "Enter your Personal ID / Establishment number and password, then click \"Login\".",
          "Enter the required data and attach all required documents.",
          "Pay the applicable fees electronically, then print the receipt.",
          "If you do not have a registered account, click \"New User\", choose the account type, enter the required data, click \"Confirm\", and follow the instructions.",
        ] as React.ReactNode[]
      ),
      fees: pick("25 ريال قطري.", "25 Qatari Riyals."),
      info: pick(
        [
          "يمكنك أيضًا حجز موعد مباشرة عن طريق زيارة إدارة القومسيون الطبي.",
          <>
            للحصول على المزيد من التوضيح بشأن عملية التسجيل، يرجى الاطلاع على كتيب{" "}
            <Link to="/legal/about" className="text-primary font-bold hover:underline">إرشادات المستخدم</Link>.
          </>,
          <>
            للاستفسار أو طلب المساعدة، يمكنك التواصل على الهاتف رقم{" "}
            <a href="tel:44073933" className="text-primary font-bold" dir="ltr">44073933</a>{" "}
            أو عبر البريد الإلكتروني{" "}
            <a href="mailto:online-support@moph.gov.qa" className="text-primary font-bold hover:underline">online-support@moph.gov.qa</a>
          </>,
        ] as React.ReactNode[],
        [
          "You can also book an appointment directly by visiting the Medical Commission office.",
          <>
            For further clarification about the registration process, please refer to the{" "}
            <Link to="/legal/about" className="text-primary font-bold hover:underline">User Guide</Link> booklet.
          </>,
          <>
            For inquiries or assistance, please contact us on{" "}
            <a href="tel:44073933" className="text-primary font-bold" dir="ltr">44073933</a>{" "}
            or by email at{" "}
            <a href="mailto:online-support@moph.gov.qa" className="text-primary font-bold hover:underline">online-support@moph.gov.qa</a>
          </>,
        ] as React.ReactNode[]
      ),
    },
    {
      key: "register",
      icon: UserPlus,
      title: pick("طلب التسجيل الإلكتروني في القومسيون الطبي", "Request Online Registration with the Medical Commission"),
      publishedAt: pick("27 ديسمبر 2020", "27 December 2020"),
      description: pick(
        "تتيح هذه الخدمة للأفراد والشركات التسجيل إلكترونيًا في القومسيون الطبي.",
        "This service allows individuals and companies to register online with the Medical Commission."
      ),
      steps: pick(
        [
          "الضغط على \"مستخدم جديد\" لإنشاء حساب مستخدم جديد.",
          "اختيار نوع المستخدم (شخصي/ منشأة).",
          "في حال اختيار حساب شخصي، يتم إدخال الرقم الشخصي.",
          "في حال اختيار حساب منشأة، يتم إدخال رقم المنشأة والرقم الشخصي.",
          "الضغط على \"بحث\" ليتم سحب البيانات الخاصة بالرقم الشخصي من قاعدة البيانات الخاصة بوزارة الداخلية.",
        ] as React.ReactNode[],
        [
          "Click \"New User\" to create a new user account.",
          "Select the user type (Personal / Establishment).",
          "If a personal account is selected, enter the Personal ID.",
          "If an establishment account is selected, enter the Establishment number and Personal ID.",
          "Click \"Search\" to retrieve the data associated with the Personal ID from the Ministry of Interior database.",
        ] as React.ReactNode[]
      ),
      fees: pick("15 ريال قطري.", "15 Qatari Riyals."),
      info: pick(
        [
          "يُسمح بإنشاء حساب واحد فقط للأشخاص والمنشآت. وعند محاولة إنشاء حساب آخر باستعمال نفس الرقم الشخصي أو رقم المنشأة، سيتم الرفض تلقائياً من قبل النظام.",
        ] as React.ReactNode[],
        [
          "Only one account is allowed for individuals and establishments. If you try to create another account with the same Personal ID or Establishment number, the system will automatically reject it.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "results",
      icon: Search,
      title: pick("الاطلاع على نتائج الفحص بالقومسيون الطبي", "Check Medical Commission Examination Results"),
      publishedAt: pick("11 يناير 2021", "11 January 2021"),
      description: pick(
        "تتيح هذه الخدمة للأفراد والشركات الاطلاع على نتائج الفحص الطبي بالقومسيون الطبي إلكترونيًا.",
        "This service allows individuals and companies to view medical examination results from the Medical Commission online."
      ),
      steps: pick(
        [
          "زيارة بوابة حكومي الإلكترونية.",
          "إدخال البيانات المطلوبة (رقم البطاقة الشخصية/رقم المنشأة).",
          "الاطلاع على نتيجة الفحص الطبي.",
        ] as React.ReactNode[],
        [
          "Visit the Hukoomi e-portal.",
          "Enter the required data (Personal ID / Establishment number).",
          "View the medical examination result.",
        ] as React.ReactNode[]
      ),
      fees: pick("10 ريال قطري.", "10 Qatari Riyals."),
      info: pick(
        [
          "يتم الربط مع النظام الإلكتروني لحكومة قطر (حكومي).",
          "في حال وجود أي استفسارات، يمكن التواصل مع مركز الاتصال.",
        ] as React.ReactNode[],
        [
          "This service is linked with the Qatar e-Government portal (Hukoomi).",
          "For any inquiries, please contact the call center.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "residency-exam",
      icon: Stethoscope,
      title: pick("الفحص الطبي لإصدار الإقامة والعمل", "Medical Fitness Examination for Residency & Employment"),
      publishedAt: pick("15 مارس 2021", "15 March 2021"),
      description: pick(
        "خدمة تُتيح للأفراد والشركات إجراء الفحص الطبي الإلزامي للحصول على تصريح الإقامة والعمل في دولة قطر، وذلك بموجب متطلبات وزارة الداخلية والصحة العامة.",
        "This service allows individuals and companies to complete the mandatory medical examination required to obtain a residency and work permit in Qatar, in line with the Ministry of Interior and MOPH requirements."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي وتسجيل الدخول عبر النظام الوطني للتوثيق.",
          "اختيار نوع المستخدم (فردي / منشأة) وإدخال بيانات الشخص المطلوب فحصه.",
          "رفع صورة شخصية حديثة وإرفاق نسخة جواز السفر والتأشيرة.",
          "دفع الرسوم إلكترونياً وحجز الموعد وطباعة الإيصال.",
          "الحضور في الموعد المحدد لإجراء الفحوصات (تحليل الدم والأشعة).",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal via the National Authentication System.",
          "Choose the user type (Individual / Establishment) and enter the applicant's data.",
          "Upload a recent personal photo along with the passport and visa copies.",
          "Pay the fees online, book the appointment and print the receipt.",
          "Attend on the scheduled date to complete blood tests and chest X-ray.",
        ] as React.ReactNode[]
      ),
      fees: pick("40 ريال قطري.", "40 Qatari Riyals."),
      info: pick(
        [
          "تُرسل النتائج إلكترونياً إلى نظام الإقامة بوزارة الداخلية خلال 24–72 ساعة.",
          "شهادة الفحص صالحة لمدة 6 أشهر من تاريخ الإصدار.",
        ] as React.ReactNode[],
        [
          "Results are sent electronically to the Ministry of Interior residency system within 24–72 hours.",
          "The medical certificate is valid for 6 months from the date of issue.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "visit-to-residency",
      icon: RefreshCw,
      title: pick("تحويل تأشيرة الزيارة إلى إقامة", "Convert Visit Visa to Residency"),
      publishedAt: pick("20 فبراير 2021", "20 February 2021"),
      description: pick(
        "خدمة إجراء الفحص الطبي المطلوب لتحويل وضع الزائر من تأشيرة زيارة إلى تصريح إقامة داخل دولة قطر.",
        "A medical examination service required to change a visitor's status from a visit visa to a resident permit inside the State of Qatar."
      ),
      steps: pick(
        [
          "تسجيل الدخول إلى بوابة القومسيون الطبي.",
          "اختيار خدمة \"تحويل الزيارة إلى إقامة\" وإدخال بيانات جواز السفر.",
          "إرفاق نسخة من تأشيرة الإقامة الجديدة ورقم هاتف للتواصل.",
          "دفع الرسوم إلكترونياً وحجز الموعد.",
          "الحضور لإجراء الفحص الطبي في الموعد المحدد.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select \"Convert Visit to Residency\" and enter the passport details.",
          "Attach a copy of the new residency visa and a contact phone number.",
          "Pay the fees online and book the appointment.",
          "Attend the medical examination on the scheduled date.",
        ] as React.ReactNode[]
      ),
      fees: pick("30 ريال قطري (تُدفع ببطاقات الدفع المعتمدة فقط).", "30 Qatari Riyals (payable only by approved payment cards)."),
      info: pick(
        [
          "بعض الجنسيات مطالبة بإرفاق شهادة فحص طبي من مركز معتمد في بلد الإقامة.",
        ] as React.ReactNode[],
        [
          "Some nationalities are required to attach a medical certificate from an approved center in the country of origin.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "visit-extension",
      icon: CalendarPlus,
      title: pick("الفحص الطبي لتمديد تأشيرة الزيارة", "Medical Examination for Visit Visa Extension"),
      publishedAt: pick("5 أبريل 2021", "5 April 2021"),
      description: pick(
        "خدمة تُتيح للزوار الراغبين في تمديد تأشيرة الزيارة لأكثر من شهر إجراء الفحص الطبي المطلوب من قبل الجهات المختصة.",
        "This service allows visitors wishing to extend their visit visa for more than one month to complete the required medical examination."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي.",
          "اختيار خدمة تمديد الزيارة وإدخال بيانات جواز السفر والتأشيرة.",
          "دفع الرسوم وحجز الموعد.",
          "الحضور لإجراء الفحص وطباعة النتيجة.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select the visit extension service and enter passport and visa details.",
          "Pay the fees and book the appointment.",
          "Attend the examination and print the result.",
        ] as React.ReactNode[]
      ),
      fees: pick("40 ريال قطري.", "40 Qatari Riyals."),
      info: pick(
        [
          "يجب إتمام الفحص قبل انتهاء التأشيرة الحالية بمدة كافية.",
        ] as React.ReactNode[],
        [
          "The examination must be completed with enough time before the current visa expires.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "return-visa",
      icon: Plane,
      title: pick("الفحص الطبي لتأشيرة العودة (بعد غياب أكثر من 6 أشهر)", "Medical Examination for Return Visa (Absence Over 6 Months)"),
      publishedAt: pick("12 مايو 2021", "12 May 2021"),
      description: pick(
        "خدمة موجهة للمقيمين الذين مكثوا خارج دولة قطر لمدة تزيد عن ستة أشهر، ويلزمهم إجراء فحص طبي لتفعيل تأشيرة العودة وتصريح الإقامة.",
        "This service is for residents who stayed outside Qatar for more than six months and are required to undergo a medical examination to reactivate their return visa and residency permit."
      ),
      steps: pick(
        [
          "تسجيل الدخول إلى بوابة القومسيون الطبي.",
          "اختيار خدمة تأشيرة العودة وإدخال بيانات جواز السفر وتأشيرة العودة.",
          "دفع الرسوم وحجز الموعد.",
          "الحضور لإجراء الفحص في الموعد المحدد.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select the return visa service and enter passport and return visa details.",
          "Pay the fees and book the appointment.",
          "Attend the examination on the scheduled date.",
        ] as React.ReactNode[]
      ),
      fees: pick("35 ريال قطري.", "35 Qatari Riyals."),
      info: pick(
        [
          "يُشترط الحضور بجواز السفر الأصلي موضحاً فيه تأشيرة العودة السارية.",
        ] as React.ReactNode[],
        [
          "The applicant must attend with the original passport showing a valid return visa.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "sponsor-change",
      icon: Users,
      title: pick("الفحص الطبي لتغيير الكفالة", "Medical Examination for Sponsor Change"),
      publishedAt: pick("18 يونيو 2021", "18 June 2021"),
      description: pick(
        "خدمة تُتيح للعمالة والموظفين إجراء الفحص الطبي المطلوب لنقل الكفالة من جهة عمل إلى أخرى قبل موافقة وزارة الداخلية على تصريح الإقامة الجديد.",
        "This service allows workers and employees to complete the medical examination required for transferring sponsorship from one employer to another before the Ministry of Interior approves the new residency permit."
      ),
      steps: pick(
        [
          "تسجيل الدخول إلى بوابة القومسيون الطبي.",
          "اختيار خدمة تغيير الكفالة وإدخال البيانات المطلوبة.",
          "دفع الرسوم وحجز الموعد.",
          "الحضور لإجراء الفحص.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select the sponsor change service and enter the required data.",
          "Pay the fees and book the appointment.",
          "Attend the examination.",
        ] as React.ReactNode[]
      ),
      fees: pick("25 ريال قطري.", "25 Qatari Riyals."),
      info: pick(
        [
          "يجب إتمام الفحص قبل رفع طلب نقل الكفالة إلى وزارة الداخلية.",
        ] as React.ReactNode[],
        [
          "The examination must be completed before submitting the sponsor transfer request to the Ministry of Interior.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "fitness-certificate",
      icon: FileCheck,
      title: pick("إصدار شهادة اللياقة الطبية", "Issuing Medical Fitness Certificate"),
      publishedAt: pick("3 يوليو 2021", "3 July 2021"),
      description: pick(
        "خدمة إصدار شهادة اللياقة الطبية للمتقدمين للوظائف الحكومية وشبه الحكومية، وطلاب الجامعات داخل وخارج قطر، والسفارات، والمتقدمين للحصول على الجنسية القطرية.",
        "Service for issuing a medical fitness certificate for applicants to governmental and semi-governmental jobs, university students inside and outside Qatar, embassies, and applicants for Qatari nationality."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي.",
          "اختيار نوع الشهادة (وظيفة / دراسة / سفارة / جنسية).",
          "تعبئة النموذج وإرفاق المستندات المطلوبة.",
          "دفع الرسوم وحجز موعد الفحص.",
          "استلام الشهادة بعد إتمام الفحوصات.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select the type of certificate (Job / Study / Embassy / Nationality).",
          "Fill in the form and attach the required documents.",
          "Pay the fees and book the examination appointment.",
          "Collect the certificate after completing the examinations.",
        ] as React.ReactNode[]
      ),
      fees: pick("30 ريال قطري.", "30 Qatari Riyals."),
      info: pick(
        [
          "الشهادة تُصدر باللغتين العربية والإنجليزية عند الطلب.",
        ] as React.ReactNode[],
        [
          "The certificate can be issued in both Arabic and English upon request.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "food-workers",
      icon: UtensilsCrossed,
      title: pick("الشهادة الصحية للعاملين في المهن الحساسة", "Health Certificate for Sensitive-Profession Workers"),
      publishedAt: pick("22 أغسطس 2021", "22 August 2021"),
      description: pick(
        "خدمة إصدار الشهادة الصحية للعاملين في المطاعم وتحضير الطعام وصالونات الحلاقة والتجميل والنوادي الصحية والمغاسل، للتأكد من خلوهم من الأمراض المعدية.",
        "Service for issuing a health certificate for workers in restaurants, food preparation, barbershops and beauty salons, health clubs and laundries to ensure they are free from infectious diseases."
      ),
      steps: pick(
        [
          "تعبئة استمارة الطلب إلكترونياً وإرفاق صورتين شخصيتين.",
          "إرفاق نسخة من الإقامة السارية وبطاقة التطعيم.",
          "إرفاق شهادة تسجيل المنشأة (فندق/صالون/نادي صحي).",
          "دفع الرسوم وحجز الموعد.",
          "الحضور لإجراء الفحص وإصدار الشهادة.",
        ] as React.ReactNode[],
        [
          "Fill in the application form electronically and attach two personal photos.",
          "Attach a copy of the valid residency permit and vaccination card.",
          "Attach the establishment registration certificate (hotel/salon/health club).",
          "Pay the fees and book the appointment.",
          "Attend the examination and receive the certificate.",
        ] as React.ReactNode[]
      ),
      fees: pick("15 ريال قطري.", "15 Qatari Riyals."),
      info: pick(
        [
          "تُجدد الشهادة سنوياً بشكل دوري.",
          "الشهادة السابقة مطلوبة عند التجديد.",
        ] as React.ReactNode[],
        [
          "The certificate is renewed annually on a regular basis.",
          "The previous certificate is required upon renewal.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "healthcare-practitioners",
      icon: HeartPulse,
      title: pick("الفحص الطبي لمزاولي المهن الصحية", "Medical Examination for Healthcare Practitioners"),
      publishedAt: pick("9 سبتمبر 2021", "9 September 2021"),
      description: pick(
        "خدمة إجراء الفحص الطبي المطلوب للأطباء والممارسين الصحيين المتقدمين لترخيص أو تجديد مزاولة المهنة في دولة قطر.",
        "A medical examination service required for doctors and healthcare practitioners applying for a new or renewed license to practice the profession in the State of Qatar."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي.",
          "إرفاق شهادة التقييم من إدارة تسجيل وترخيص الممارسين الصحيين.",
          "إرفاق خطاب من جهة العمل عند الاقتضاء.",
          "دفع الرسوم وحجز الموعد.",
          "الحضور لإجراء الفحص.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Attach the assessment certificate from the Healthcare Practitioners Licensing Department.",
          "Attach a letter from the employer when required.",
          "Pay the fees and book the appointment.",
          "Attend the examination.",
        ] as React.ReactNode[]
      ),
      fees: pick("50 ريال قطري.", "50 Qatari Riyals."),
      info: pick(
        [
          "مدة إنجاز الخدمة حوالي 6 أيام عمل.",
        ] as React.ReactNode[],
        [
          "The service is completed within approximately 6 working days.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "citizenship-exam",
      icon: Award,
      title: pick("الفحص الطبي للمتقدمين للحصول على الجنسية القطرية", "Medical Examination for Qatari Nationality Applicants"),
      publishedAt: pick("14 أكتوبر 2021", "14 October 2021"),
      description: pick(
        "خدمة إجراء الفحص الطبي الإلزامي للمتقدمين للحصول على الجنسية القطرية، كأحد شروط استكمال ملف طلب الجنسية.",
        "A mandatory medical examination service for applicants for Qatari nationality, as one of the requirements for completing the nationality application file."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي.",
          "اختيار خدمة فحص المتقدمين للجنسية.",
          "إرفاق المستندات المطلوبة وحجز الموعد.",
          "الحضور لإجراء الفحوصات الطبية.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal.",
          "Select the nationality applicants examination service.",
          "Attach the required documents and book the appointment.",
          "Attend for the medical examinations.",
        ] as React.ReactNode[]
      ),
      fees: pick("35 ريال قطري.", "35 Qatari Riyals."),
      info: pick(
        [
          "تُرسل النتائج مباشرة إلى الجهة المختصة بطلب الجنسية.",
        ] as React.ReactNode[],
        [
          "The results are sent directly to the authority handling the nationality application.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "premarital",
      icon: Heart,
      title: pick("فحص ما قبل الزواج", "Premarital Medical Screening"),
      publishedAt: pick("7 نوفمبر 2021", "7 November 2021"),
      description: pick(
        "خدمة إلزامية بموجب مرسوم أميري صادر عام 2009، تتيح للمقبلين على الزواج (قطريين ومقيمين) إجراء فحص طبي للكشف عن الأمراض الوراثية والمعدية قبل الزواج.",
        "A mandatory service under an Emiri decree issued in 2009, allowing couples about to marry (Qatari and residents) to undergo a medical screening for genetic and infectious diseases before marriage."
      ),
      steps: pick(
        [
          "حجز موعد في عيادة ما قبل الزواج بأحد مراكز الرعاية الصحية الأولية.",
          "الحضور مع البطاقة الشخصية للطرفين.",
          "إجراء الفحوصات المخبرية اللازمة.",
          "استلام شهادة الفحص خلال أيام محددة.",
        ] as React.ReactNode[],
        [
          "Book an appointment at the premarital clinic in one of the Primary Health Care centers.",
          "Attend with the personal ID of both parties.",
          "Complete the required laboratory examinations.",
          "Collect the screening certificate within a specified period.",
        ] as React.ReactNode[]
      ),
      fees: pick("20 ريال قطري.", "20 Qatari Riyals."),
      info: pick(
        [
          "الخدمة تُقدَّم عبر مؤسسة الرعاية الصحية الأولية (PHCC).",
          "شهادة الفحص إلزامية لإتمام إجراءات عقد الزواج.",
        ] as React.ReactNode[],
        [
          "The service is provided through the Primary Health Care Corporation (PHCC).",
          "The screening certificate is required to complete the marriage contract procedures.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "domestic-workers",
      icon: HomeIcon,
      title: pick("الفحص الطبي للعمالة المنزلية الجديدة", "Medical Examination for New Domestic Workers"),
      publishedAt: pick("25 نوفمبر 2021", "25 November 2021"),
      description: pick(
        "خدمة إجراء الفحص الطبي للوافدين الجدد من العمالة المنزلية (خادمات المنزل، سائقو الأسرة) للحصول على تصاريح الإقامة من وزارة الداخلية.",
        "A medical examination service for newly arrived domestic workers (housemaids, family drivers) to obtain residency permits from the Ministry of Interior."
      ),
      steps: pick(
        [
          "الدخول إلى بوابة القومسيون الطبي عبر حساب المنشأة/رب الأسرة.",
          "إدخال بيانات العامل وإرفاق نسخة الجواز والتأشيرة.",
          "دفع الرسوم وحجز الموعد.",
          "اصطحاب العامل إلى المركز في الموعد المحدد لإجراء الفحص.",
        ] as React.ReactNode[],
        [
          "Log in to the Medical Commission portal using the establishment / head of household account.",
          "Enter the worker's data and attach passport and visa copies.",
          "Pay the fees and book the appointment.",
          "Accompany the worker to the center at the scheduled time for the examination.",
        ] as React.ReactNode[]
      ),
      fees: pick("45 ريال قطري.", "45 Qatari Riyals."),
      info: pick(
        [
          "تُنفَّذ الخدمة في مراكز محددة تابعة لمؤسسة الرعاية الصحية الأولية.",
        ] as React.ReactNode[],
        [
          "The service is provided at designated centers of the Primary Health Care Corporation.",
        ] as React.ReactNode[]
      ),
    },
    {
      key: "driving-eye-test",
      icon: Eye,
      title: pick("فحص النظر لتحويل رخصة القيادة الأجنبية إلى قطرية", "Eye Test for Converting Foreign Driving License to Qatari"),
      publishedAt: pick("12 ديسمبر 2021", "12 December 2021"),
      description: pick(
        "خدمة إجراء فحص النظر لحاملي رخص القيادة الأجنبية السارية الراغبين في تحويلها إلى رخصة قيادة قطرية دائمة، كخطوة تسبق مراجعة الإدارة العامة للمرور.",
        "An eye test service for holders of valid foreign driving licenses wishing to convert them into a permanent Qatari driving license, as a step preceding the visit to the General Directorate of Traffic."
      ),
      steps: pick(
        [
          "حجز موعد في أحد مراكز فحص النظر المعتمدة.",
          "الحضور ببطاقة الإقامة الأصلية.",
          "إجراء فحص النظر ودفع الرسوم.",
          "استلام نتيجة الفحص وتقديمها إلى إدارة المرور بالغرافة.",
        ] as React.ReactNode[],
        [
          "Book an appointment at one of the approved eye test centers.",
          "Attend with the original QID.",
          "Complete the eye test and pay the fees.",
          "Collect the result and submit it to the Traffic Department in Al Gharrafa.",
        ] as React.ReactNode[]
      ),
      fees: pick("50 ريال قطري.", "50 Qatari Riyals."),
      info: pick(
        [
          "يُجرى الفحص في مراكز فحص النظر ومدارس تعليم القيادة المعتمدة.",
          "لا يتم الفحص في مبنى القومسيون الطبي الرئيسي.",
        ] as React.ReactNode[],
        [
          "The test is performed at approved eye test centers and driving schools.",
          "It is not conducted at the main Medical Commission building.",
        ] as React.ReactNode[]
      ),
    },
  ];

  const activeKey = params.key ?? "booking";
  const svc = useMemo(
    () => SERVICES.find((s) => s.key === activeKey) ?? SERVICES[0],
    [activeKey, SERVICES]
  );

  const sections = [
    { id: "desc", label: pick("وصف الخدمة", "Service Description") },
    { id: "steps", label: pick("الخطوات", "Steps") },
    { id: "fees", label: pick("الرسوم", "Fees") },
    { id: "info", label: pick("المعلومات الإضافية", "Additional Info") },
    { id: "options", label: pick("خيارات الصفحة", "Page Options") },
  ];

  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <PrintDoc platform="medical" serviceTitle={svc.title} />
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 flex-1 overflow-hidden">
            <a href="/" className="hover:text-primary shrink-0">{pick("الصفحة الرئيسية", "Home")}</a>
            <Chevron className="h-3 w-3 shrink-0" />
            <a href="/" className="hover:text-primary shrink-0">{pick("الخدمات", "Services")}</a>
            <Chevron className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium truncate">{svc.title}</span>
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
          {/* Back to services list */}
          <Link
            to="/"
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
              {svc.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-5">{pick("تقدمها وزارة الصحة العامة", "Provided by the Ministry of Public Health")}</p>

            <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-6 max-w-5xl">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{pick("نوع الخدمة", "Service type")}</p>
                <p className="text-sm font-bold text-foreground">{pick("خدمة إلكترونية", "E-Service")}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">{pick("تم نشره في", "Published on")}</p>
                <p className="text-sm font-bold text-foreground">{svc.publishedAt}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleStart}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 min-w-[140px] font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {activeKey === "results" ? pick("الاطلاع على النتائج", "View Results") : pick("ابدأ الآن", "Start Now")}
                <Arrow className="h-4 w-4" />
              </button>
              {activeKey === "booking" && (
                <button
                  onClick={() => goStart("booking-senior")}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 min-w-[140px] font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  {pick("حجز موعد للفحص بالقومسيون الطبي لفئة كبار الموظفين", "Book an appointment for medical examination at the Medical Commission for Senior Staff")}
                </button>
              )}
              {activeKey === "register" && (
                <button
                  onClick={() => goStart("register-senior")}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 min-w-[140px] font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  {pick("طلب التسجيل الإلكتروني في القومسيون الطبي لفئة كبار الموظفين", "Request Online Registration with the Medical Commission for Senior Staff")}
                </button>
              )}
            </div>
          </section>

          {/* Description card */}
          <section id="desc" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-3">{pick("وصف الخدمة", "Service Description")}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {svc.description}
            </p>

            {/* Video walkthrough — only for the online registration service */}
            {activeKey === "register" && (
            <div className="mt-5 pt-5 border-t border-border/50 flex flex-col sm:flex-row-reverse sm:items-center gap-4">
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 h-11 rounded-xl font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.98] shrink-0"
                aria-label={pick("عرض الفيديو التوضيحي", "Watch the tutorial video")}
              >
                <PlayCircle className="w-5 h-5" />
                {pick("عرض الفيديو التوضيحي", "Watch tutorial video")}
              </button>
              <p className="text-sm text-foreground/75 leading-relaxed flex-1">
                {pick(
                  "شاهد شرحاً مصوراً قصيراً يوضح لك خطوات تقديم طلب التسجيل خطوة بخطوة، مع تعليق صوتي عربي.",
                  "Watch a short guided video that walks you through the registration steps, with Arabic voiceover."
                )}
              </p>
            </div>
            )}
          </section>

          {/* Steps card */}
          <section id="steps" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{pick("الخطوات", "Steps")}</h2>
            <ul className="space-y-1.5 text-sm text-foreground/85 leading-relaxed">
              {svc.steps.map((item, i) => (
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
            <p className="text-sm text-foreground/80 leading-relaxed">
              {svc.fees}
            </p>
          </section>

          {/* Additional info card */}
          <section id="info" className="bg-card border border-border/60 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-foreground mb-4">{pick("المعلومات الإضافية", "Additional Information")}</h2>
            <ul className="space-y-1.5 text-sm text-foreground/85 leading-relaxed">
              {svc.info.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-5 border-t border-border/50 grid gap-2 text-xs text-muted-foreground">
              <Link to="/legal/contact" className="flex items-center gap-2 hover:text-primary">
                <Globe className="h-4 w-4 text-primary" />
                {pick("مركز دعم القومسيون الطبي", "Medical Commission support center")}
              </Link>
              <a href="mailto:online-support@moph.gov.qa" className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                online-support@moph.gov.qa
              </a>
              <a href="tel:44073933" className="flex items-center gap-2 hover:text-primary" dir="ltr">
                <Phone className="h-4 w-4 text-primary" />
                +974 4407 3933
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
        platform="medical"
        serviceTitle={svc.title}
        data={{
          category: pick("الصحة", "Health"),
          serviceType: pick("خدمة إلكترونية", "E-Service"),
          publishedAt: svc.publishedAt,
          description: svc.description,
          steps: svc.steps,
          fees: svc.fees,
          info: svc.info,
          contact: {
            center: pick("مركز دعم القومسيون الطبي", "Medical Commission support center"),
            email: "online-support@moph.gov.qa",
            phone: "+974 4407 3933",
          },
        }}
      />
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        serviceKey={svc.key}
        serviceName={svc.title}
        platform="medical"
      />

      {videoOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setVideoOpen(false)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center sm:p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full sm:h-auto sm:max-w-md bg-black sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label={pick("إغلاق", "Close")}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={howToRegisterVideo.url}
              controls
              autoPlay
              playsInline
              className="w-full h-full sm:h-auto sm:max-h-[85vh] object-contain bg-black"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ServiceDetails;