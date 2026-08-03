import { Link, useLocation, useParams } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Cookie,
  Accessibility,
  ChevronLeft,
  ChevronRight,
  Mail,
  Truck,
  RotateCcw,
  Info,
  Megaphone,
  Building2,
} from "lucide-react";
import CIBLogo from "@/components/CIBLogo";
import { useLang } from "@/i18n/LanguageContext";

type Slug =
  | "privacy"
  | "terms"
  | "cookies"
  | "accessibility"
  | "contact"
  | "shipping"
  | "refund"
  | "about"
  | "disclaimer"
  | "ad-disclosure";

type Bi = { ar: string; en: string };
type Section = { h: Bi; p: Bi };
type Entry = { title: Bi; icon: any; intro: Bi; sections: Section[] };

const CONTENT: Record<Slug, Entry> = {
  privacy: {
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    icon: ShieldCheck,
    intro: {
      ar: "يحترم القومسيون الطبي — وزارة الصحة العامة خصوصيتك ويلتزم بحماية بياناتك الصحية والشخصية وفق أعلى المعايير المعتمدة في دولة قطر.",
      en: "The Medical Commission — Ministry of Public Health respects your privacy and is committed to protecting your health and personal data per the highest standards in the State of Qatar.",
    },
    sections: [
      {
        h: { ar: "البيانات التي نجمعها", en: "Data we collect" },
        p: {
          ar: "نجمع المعلومات الضرورية فقط لتقديم خدمات القومسيون الطبي: الاسم الكامل، رقم الهوية القطرية، رقم الهاتف المسجّل لدى مشغّل الاتصالات، العنوان، ونوع الفحص أو الخدمة المطلوبة.",
          en: "We collect only the information required to provide Medical Commission services: full name, Qatar ID number, telecom-registered phone number, address, and the requested examination or service type.",
        },
      },
      {
        h: { ar: "كيف نستخدم بياناتك", en: "How we use your data" },
        p: {
          ar: "تُستخدم بياناتك حصراً لحجز مواعيد الفحص، تفعيل حسابك في القومسيون الطبي، إرسال إشعارات المواعيد ونتائج الفحوصات، وتحسين جودة الخدمة والامتثال للمتطلبات التنظيمية.",
          en: "Your data is used exclusively to book examination appointments, activate your Medical Commission account, deliver appointment and result notifications, and improve service quality in compliance with regulations.",
        },
      },
      {
        h: { ar: "ملفات تعريف الارتباط", en: "Cookies" },
        p: {
          ar: "نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع وتأمين جلستك، وملفات تحليلية لقياس أداء الخدمة وتحسينها. لا نستخدم بياناتك لأي أغراض إعلانية تجارية.",
          en: "We use essential cookies to run the site and secure your session, and analytics cookies to measure and improve service performance. Your data is not used for any commercial advertising purposes.",
        },
      },
      {
        h: { ar: "مشاركة البيانات", en: "Data sharing" },
        p: {
          ar: "لا نبيع بياناتك. قد تُشارك عند الضرورة مع المراكز الصحية المعتمدة داخل وزارة الصحة العامة، أو مع مشغّلي الاتصالات المرخّصين للتحقق من ملكية رقم الهاتف، أو مع الجهات التنظيمية عند طلبها قانونياً.",
          en: "We do not sell your data. It may be shared when necessary with accredited health centers within the Ministry of Public Health, with licensed telecom operators to verify phone-number ownership, or with regulators when legally required.",
        },
      },
      {
        h: { ar: "حماية البيانات", en: "Data protection" },
        p: {
          ar: "تُحفظ البيانات على خوادم آمنة بتشفير قوي، ويقتصر الوصول إليها على الموظفين المخوّلين فقط.",
          en: "Data is stored on secure servers with strong encryption, accessible only to authorized personnel.",
        },
      },
      {
        h: { ar: "حقوقك", en: "Your rights" },
        p: {
          ar: "يحق لك طلب الاطلاع على بياناتك أو تعديلها أو حذفها أو سحب موافقتك في أي وقت بمراسلتنا على البريد الموضح في صفحة التواصل.",
          en: "You have the right to access, modify or delete your data, or withdraw your consent at any time by contacting us at the email shown on the Contact page.",
        },
      },
      {
        h: { ar: "الأطفال", en: "Children" },
        p: {
          ar: "خدمات الحجز والتفعيل الرقمي مخصّصة للبالغين. تُدار بيانات القاصرين من قِبل ولي الأمر وفق الأنظمة المعمول بها في وزارة الصحة العامة.",
          en: "Digital booking and activation services are intended for adults. Minors' data is managed by a legal guardian per the Ministry of Public Health regulations.",
        },
      },
    ],
  },
  terms: {
    title: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
    icon: FileText,
    intro: {
      ar: "باستخدامك لخدمات القومسيون الطبي الإلكترونية، فإنك توافق على الشروط والأحكام التالية.",
      en: "By using the Medical Commission online services, you agree to the following terms and conditions.",
    },
    sections: [
      { h: { ar: "الأهلية", en: "Eligibility" }, p: { ar: "الخدمة متاحة للمقيمين داخل دولة قطر الحاملين لهوية قطرية سارية، ويتعيّن تقديم بيانات صحيحة ومحدّثة.", en: "The service is available to residents of Qatar holding a valid Qatar ID, and requires accurate, up-to-date information." } },
      { h: { ar: "طبيعة الخدمة", en: "Nature of the service" }, p: { ar: "يقدّم القومسيون الطبي خدمات حجز مواعيد الفحوصات وتفعيل الحساب وإصدار التقارير رقمياً، ويشترط ربط رقم هاتف موثّق لدى مشغّل الاتصالات لاستكمال أي طلب.", en: "The Medical Commission provides appointment booking, account activation, and digital report issuance. Linking a phone number verified with your telecom operator is required to complete any request." } },
      { h: { ar: "الرسوم الحكومية", en: "Government fees" }, p: { ar: "تُطبّق الرسوم الرسمية المعتمدة من وزارة الصحة العامة على بعض الخدمات (مثل رسم تفعيل الحساب)، وتُدفع إلكترونياً عبر وسائل الدفع المعتمدة في دولة قطر (Visa · Mastercard · NAPS).", en: "Official fees approved by the Ministry of Public Health apply to some services (such as the account activation fee) and are paid electronically via payment methods accepted in Qatar (Visa · Mastercard · NAPS)." } },
      { h: { ar: "صحة البيانات", en: "Data accuracy" }, p: { ar: "يتحمّل المستخدم كامل المسؤولية عن دقة البيانات المُدخلة. أي بيانات خاطئة قد تؤدي إلى رفض الطلب أو تأجيل الموعد.", en: "The user bears full responsibility for the accuracy of submitted data. Incorrect data may result in request rejection or appointment delay." } },
      { h: { ar: "حدود المسؤولية", en: "Liability limits" }, p: { ar: "لا يتحمّل القومسيون الطبي أي ضرر ناتج عن سوء استخدام الخدمة، أو تعطّل الخدمات لدى أطراف ثالثة (مشغّلي الاتصالات أو البنوك)، أو إدخال بيانات غير صحيحة.", en: "The Medical Commission is not liable for damages caused by misuse of the service, third-party service outages (telecom operators or banks), or the entry of incorrect data." } },
      { h: { ar: "الملكية الفكرية", en: "Intellectual property" }, p: { ar: "جميع الشعارات والعلامات الرسمية والمحتوى الظاهر على الموقع مملوكة لوزارة الصحة العامة والجهات الحكومية المعنية في دولة قطر، ولا يجوز إعادة استخدامها دون إذن.", en: "All official logos and content on the site are owned by the Ministry of Public Health and relevant Qatari government entities and may not be reused without permission." } },
      { h: { ar: "القانون المعمول به", en: "Governing law" }, p: { ar: "تخضع هذه الشروط لقوانين دولة قطر، وتختص محاكم قطر بالنظر في أي نزاع ينشأ عنها.", en: "These terms are governed by the laws of the State of Qatar, and Qatar courts have jurisdiction over any dispute arising from them." } },
    ],
  },
  cookies: {
    title: { ar: "سياسة ملفات تعريف الارتباط", en: "Cookies Policy" },
    icon: Cookie,
    intro: { ar: "نستخدم ملفات تعريف الارتباط (الكوكيز) لتشغيل الخدمة وتأمين جلستك وتحسين تجربتك على منصة القومسيون الطبي الإلكترونية.", en: "We use cookies to run the service, secure your session, and improve your experience on the Medical Commission online platform." },
    sections: [
      { h: { ar: "ما هي الكوكيز؟", en: "What are cookies?" }, p: { ar: "ملفات صغيرة تُحفظ في متصفحك لتذكّر تفضيلاتك، تأمين جلستك، وقياس أداء الموقع.", en: "Small files stored in your browser to remember your preferences, secure your session, and measure site performance." } },
      { h: { ar: "أنواع الكوكيز التي نستخدمها", en: "Types of cookies we use" }, p: { ar: "كوكيز ضرورية لتشغيل الموقع وتأمين الجلسات، وكوكيز تحليلية لقياس أداء الخدمة وتحسينها. لا نستخدم كوكيز إعلانية تجارية.", en: "Essential cookies to run the site and secure sessions, and analytics cookies to measure and improve service performance. We do not use commercial advertising cookies." } },
      { h: { ar: "لا نستخدم إعلانات موجّهة", en: "No targeted advertising" }, p: { ar: "بصفتنا خدمة حكومية، لا نُشغّل حملات إعلانية تجارية ولا نُشارك بياناتك مع منصات إعلانات خارجية.", en: "As a government service, we do not run commercial ad campaigns and do not share your data with external advertising platforms." } },
      { h: { ar: "إدارة الكوكيز", en: "Managing cookies" }, p: { ar: "يمكنك إدارة أو حذف الكوكيز عبر إعدادات متصفحك في أي وقت. قد يؤدي تعطيل الكوكيز الضرورية إلى تعطّل بعض الخدمات.", en: "You can manage or delete cookies via your browser settings at any time. Disabling essential cookies may break some features." } },
    ],
  },
  accessibility: {
    title: { ar: "إمكانية الوصول", en: "Accessibility" },
    icon: Accessibility,
    intro: { ar: "يلتزم القومسيون الطبي — وزارة الصحة العامة بإتاحة خدماته الرقمية لجميع المستخدمين بمن فيهم ذوو الاحتياجات الخاصة.", en: "The Medical Commission — Ministry of Public Health is committed to making its digital services available to all users, including those with special needs." },
    sections: [
      { h: { ar: "معاييرنا", en: "Our standards" }, p: { ar: "نسعى للالتزام بإرشادات WCAG 2.1 المستوى AA لضمان تجربة شاملة وميسّرة.", en: "We aim to follow WCAG 2.1 Level AA guidelines to ensure an inclusive, accessible experience." } },
      { h: { ar: "الميزات المتوفرة", en: "Available features" }, p: { ar: "تباين عالٍ بين النصوص والخلفية، أحجام نصوص قابلة للتكبير، تنقّل عبر لوحة المفاتيح، ودعم قارئات الشاشة.", en: "High text/background contrast, scalable text sizes, keyboard navigation, and screen-reader support." } },
      { h: { ar: "تواصل معنا", en: "Contact us" }, p: { ar: "إذا واجهت أي صعوبة في الوصول للمحتوى، يسعدنا تلقّي ملاحظاتك عبر صفحة التواصل لتحسين الخدمة.", en: "If you have any difficulty accessing content, we welcome your feedback via the Contact page so we can improve the service." } },
    ],
  },
  contact: {
    title: { ar: "تواصل معنا", en: "Contact Us" },
    icon: Mail,
    intro: { ar: "نحن هنا لمساعدتك في أي استفسار يتعلق بخدمات القومسيون الطبي، مواعيد الفحوصات، أو بياناتك الشخصية.", en: "We are here to help with any questions about Medical Commission services, examination appointments, or your personal data." },
    sections: [
      { h: { ar: "الدعم الإلكتروني", en: "Online support" }, p: { ar: "البريد الإلكتروني: online-support@moph.gov.qa — متاح على مدار الساعة.", en: "Email: online-support@moph.gov.qa — available around the clock." } },
      { h: { ar: "هاتف الدعم", en: "Support phone" }, p: { ar: "للاستفسارات: 44073933 داخل قطر، من الأحد إلى الخميس، 7 صباحاً – 3 مساءً.", en: "Inquiries: 44073933 inside Qatar, Sunday to Thursday, 7 AM – 3 PM." } },
      { h: { ar: "العنوان", en: "Address" }, p: { ar: "وزارة الصحة العامة — إدارة القومسيون الطبي، الدوحة، دولة قطر.", en: "Ministry of Public Health — Medical Commission Department, Doha, State of Qatar." } },
      { h: { ar: "طلبات الخصوصية", en: "Privacy requests" }, p: { ar: "لطلبات حذف أو تعديل بياناتك: privacy@moph.gov.qa", en: "For data deletion or modification: privacy@moph.gov.qa" } },
      { h: { ar: "وقت الاستجابة", en: "Response time" }, p: { ar: "نلتزم بالرد على جميع الاستفسارات خلال 24 إلى 48 ساعة عمل.", en: "We commit to responding to all inquiries within 24–48 business hours." } },
    ],
  },
  shipping: {
    title: { ar: "تسليم التقارير الطبية", en: "Medical Reports Delivery" },
    icon: Truck,
    intro: { ar: "تُسلَّم تقارير القومسيون الطبي رقمياً على حسابك، ويمكن استلام النسخة الورقية عند الحاجة من المراكز المعتمدة.", en: "Medical Commission reports are delivered digitally to your account, and paper copies can be collected from accredited centers when needed." },
    sections: [
      { h: { ar: "التسليم الرقمي", en: "Digital delivery" }, p: { ar: "تظهر التقارير على حسابك مباشرة بعد اعتمادها من الطبيب المختص، ويتم إشعارك عبر رسالة SMS على رقم هاتفك المسجّل.", en: "Reports appear directly on your account once approved by the specialist physician, and you are notified by SMS on your registered phone." } },
      { h: { ar: "النسخة الورقية", en: "Paper copy" }, p: { ar: "يمكن استلام النسخة الورقية عند الحاجة من مراكز القومسيون الطبي المعتمدة بعد إبراز الهوية القطرية.", en: "A paper copy may be collected from accredited Medical Commission centers upon presenting your Qatar ID." } },
      { h: { ar: "مدة الاعتماد", en: "Approval time" }, p: { ar: "تتراوح مدة اعتماد التقرير بين 3 و7 أيام عمل من تاريخ إتمام الفحص وفق نوع الخدمة.", en: "Report approval takes between 3 and 7 business days from examination completion, depending on service type." } },
      { h: { ar: "التحقق من الهوية", en: "Identity verification" }, p: { ar: "يُشترط إبراز الهوية القطرية عند استلام أي وثيقة رسمية لضمان تسليمها للمستفيد الصحيح.", en: "The Qatar ID must be presented when collecting any official document to ensure delivery to the correct beneficiary." } },
    ],
  },
  refund: {
    title: { ar: "سياسة استرداد الرسوم", en: "Fee Refund Policy" },
    icon: RotateCcw,
    intro: { ar: "تُطبَّق سياسة استرداد محدودة على الرسوم الحكومية المدفوعة إلكترونياً لخدمات القومسيون الطبي.", en: "A limited refund policy applies to government fees paid electronically for Medical Commission services." },
    sections: [
      { h: { ar: "الرسوم القابلة للاسترداد", en: "Refundable fees" }, p: { ar: "يُمكن استرداد رسم تفعيل الحساب في حال تعذّر تقديم الخدمة لأسباب فنية من طرفنا، خلال 14 يوم عمل من تاريخ الدفع.", en: "The account activation fee may be refunded if the service cannot be provided due to technical reasons on our side, within 14 business days of payment." } },
      { h: { ar: "الرسوم غير القابلة للاسترداد", en: "Non-refundable fees" }, p: { ar: "لا تُسترد الرسوم في حال إدخال بيانات غير صحيحة من قِبل المستخدم أو رفض الطلب لعدم استيفاء الاشتراطات النظامية.", en: "Fees are not refunded if incorrect data was submitted by the user or if the request was rejected for failing to meet regulatory requirements." } },
      { h: { ar: "إجراءات الاسترداد", en: "Refund procedure" }, p: { ar: "لتقديم طلب استرداد، يُرجى التواصل مع الدعم الإلكتروني عبر online-support@moph.gov.qa مع رقم المرجع وتاريخ الدفع.", en: "To request a refund, please contact online support at online-support@moph.gov.qa with your reference number and payment date." } },
      { h: { ar: "مدة المعالجة", en: "Processing time" }, p: { ar: "تُعالَج طلبات الاسترداد المعتمدة خلال 7 إلى 14 يوم عمل عبر نفس وسيلة الدفع الأصلية.", en: "Approved refund requests are processed within 7 to 14 business days via the original payment method." } },
    ],
  },
  about: {
    title: { ar: "من نحن", en: "About Us" },
    icon: Building2,
    intro: { ar: "القومسيون الطبي هو إدارة تابعة لوزارة الصحة العامة في دولة قطر، مسؤولة عن الفحوصات الطبية المعتمدة رسمياً.", en: "The Medical Commission is a department of the Ministry of Public Health in the State of Qatar, responsible for officially accredited medical examinations." },
    sections: [
      { h: { ar: "الجهة الرسمية", en: "Official authority" }, p: { ar: "القومسيون الطبي — وزارة الصحة العامة، دولة قطر: الجهة الرسمية لإصدار التقارير الطبية المعتمدة للعمل والإقامة والزواج والسفر.", en: "The Medical Commission — Ministry of Public Health, State of Qatar: the official authority issuing accredited medical reports for work, residency, marriage, and travel." } },
      { h: { ar: "خدماتنا الرقمية", en: "Our digital services" }, p: { ar: "توفّر منصة حكومي (Hukoomi) قناة إلكترونية موحّدة لحجز مواعيد الفحوصات، تفعيل الحساب، متابعة الطلبات، واستلام النتائج.", en: "The Hukoomi platform provides a unified digital channel for booking exam appointments, activating accounts, tracking requests, and receiving results." } },
      { h: { ar: "الشركاء التقنيون", en: "Technical partners" }, p: { ar: "نتعاون مع مشغّلي الاتصالات المرخّصين في دولة قطر (Ooredoo وVodafone) للتحقق من ملكية أرقام الهواتف وربطها بحسابات المستفيدين.", en: "We work with licensed telecom operators in Qatar (Ooredoo and Vodafone) to verify phone-number ownership and link them to beneficiary accounts." } },
      { h: { ar: "التزامنا", en: "Our commitment" }, p: { ar: "نلتزم بالشفافية، وحماية البيانات الصحية، وتقديم تجربة رقمية آمنة وموثوقة لكل مقيم على أرض قطر.", en: "We are committed to transparency, protection of health data, and providing a safe, trusted digital experience for every resident of Qatar." } },
    ],
  },
  disclaimer: {
    title: { ar: "إخلاء المسؤولية", en: "Disclaimer" },
    icon: Info,
    intro: { ar: "تنطبق المعلومات أدناه على هذا الموقع الرسمي لخدمات القومسيون الطبي الإلكترونية.", en: "The information below applies to this official Medical Commission online-services site." },
    sections: [
      { h: { ar: "طبيعة المحتوى", en: "Nature of content" }, p: { ar: "المعلومات المعروضة على هذا الموقع للأغراض الإرشادية فقط، ولا تُغني عن الاستشارة الطبية الفردية أو التقارير الرسمية الصادرة عن الأطباء المعتمدين.", en: "The information on this site is for guidance only and does not replace individual medical consultation or official reports issued by accredited physicians." } },
      { h: { ar: "دقة البيانات", en: "Data accuracy" }, p: { ar: "نبذل ما بوسعنا للحفاظ على دقّة المحتوى، إلا أن مواعيد الخدمات والرسوم والاشتراطات قد تتغيّر وفق تعليمات وزارة الصحة العامة.", en: "We make every effort to keep content accurate, but service times, fees, and requirements may change per Ministry of Public Health directives." } },
      { h: { ar: "روابط خارجية", en: "External links" }, p: { ar: "لا نتحمّل مسؤولية محتوى أو سياسات مواقع الأطراف الثالثة التي يتم الربط معها (مثل بوابات الدفع أو مشغّلي الاتصالات).", en: "We are not responsible for the content or policies of third-party sites we integrate with (such as payment gateways or telecom operators)." } },
      { h: { ar: "تعديل المحتوى", en: "Content changes" }, p: { ar: "يحق لنا تعديل أو إزالة أي محتوى من الموقع في أي وقت وفقاً للتحديثات الرسمية الصادرة من وزارة الصحة العامة.", en: "We reserve the right to modify or remove any content on the site at any time per official Ministry of Public Health updates." } },
    ],
  },
  "ad-disclosure": {
    title: { ar: "الإفصاح والشفافية", en: "Transparency Notice" },
    icon: Megaphone,
    intro: { ar: "نلتزم بالشفافية الكاملة بشأن طبيعة خدمة القومسيون الطبي الإلكترونية والأطراف المشاركة فيها.", en: "We are committed to full transparency regarding the Medical Commission online service and all parties involved." },
    sections: [
      { h: { ar: "الجهة المشغّلة", en: "Operating authority" }, p: { ar: "هذا الموقع مُشغّل رسمياً من قِبل القومسيون الطبي — وزارة الصحة العامة، دولة قطر، ضمن منظومة خدمات حكومي (Hukoomi).", en: "This site is officially operated by the Medical Commission — Ministry of Public Health, State of Qatar, within the Hukoomi services suite." } },
      { h: { ar: "طبيعة الخدمة", en: "Nature of the service" }, p: { ar: "هذه خدمة حكومية لحجز المواعيد وتفعيل الحسابات، وتُطبَّق رسوم رسمية معتمدة على بعض الخدمات كما هو مذكور في صفحة الشروط والأحكام.", en: "This is a government service for appointment booking and account activation. Approved official fees apply to some services as stated in the Terms & Conditions." } },
      { h: { ar: "الأطراف الثالثة", en: "Third parties" }, p: { ar: "قد تتضمن بعض الخطوات التحقق من رقم الهاتف عبر مشغّلي الاتصالات المرخّصين، أو معالجة الدفع عبر بوابات دفع معتمدة في دولة قطر.", en: "Some steps may involve phone-number verification via licensed telecom operators, or payment processing via payment gateways accredited in Qatar." } },
      { h: { ar: "لا إعلانات تجارية", en: "No commercial ads" }, p: { ar: "بصفتنا خدمة حكومية، لا نعرض إعلانات تجارية ولا نستخدم بكسلات تتبع لأغراض تسويقية.", en: "As a government service, we do not display commercial ads and do not use tracking pixels for marketing purposes." } },
      { h: { ar: "الشكاوى", en: "Complaints" }, p: { ar: "لأي شكوى أو ملاحظة بخصوص الخدمة، يُرجى التواصل على online-support@moph.gov.qa", en: "For any complaint or feedback about the service, please contact online-support@moph.gov.qa" } },
    ],
  },
};

const Legal = () => {
  const { slug } = useParams<{ slug: Slug }>();
  const [, navigate] = useLocation();
  const { pick, lang, dir } = useLang();
  const data = slug && CONTENT[slug as Slug];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <div className="text-center space-y-3">
          <p className="text-foreground font-bold">{pick("الصفحة غير موجودة", "Page not found")}</p>
          <Link to="/" className="text-primary text-sm font-bold hover:underline">
            {pick("العودة للرئيسية", "Back to Home")}
          </Link>
        </div>
      </div>
    );
  }

  const Icon = data.icon;
  const otherPages = (Object.keys(CONTENT) as Slug[]).filter((s) => s !== slug);
  const BackChevron = lang === "ar" ? ChevronLeft : ChevronRight;
  const ForwardArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <header className="sticky top-0 z-30 bg-neo-deep/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <CIBLogo variant="light" />
          <button
            onClick={() => navigate(-1)}
            className="text-[11px] font-bold bg-white/10 text-primary-foreground border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/20 transition flex items-center gap-1"
          >
            <BackChevron className="h-3.5 w-3.5" />
            {pick("رجوع", "Back")}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-neo-deep mx-auto flex items-center justify-center shadow-lg shadow-primary/30">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{pick(data.title.ar, data.title.en)}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-5xl mx-auto">{pick(data.intro.ar, data.intro.en)}</p>
        </div>

        <div className="space-y-3">
          {data.sections.map((s, i) => (
            <article
              key={s.h.en}
              className="bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h2 className="text-sm font-extrabold text-foreground mb-1.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {pick(s.h.ar, s.h.en)}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{pick(s.p.ar, s.p.en)}</p>
            </article>
          ))}
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-muted-foreground mb-2">{pick("صفحات قانونية أخرى", "Other legal pages")}</p>
          <div className="flex flex-wrap gap-2">
            {otherPages.map((s) => (
              <Link
                key={s}
                to={`/legal/${s}`}
                className="text-[11px] font-bold bg-card border border-border/60 hover:border-primary/40 hover:text-primary text-foreground rounded-full px-3 py-1.5 transition"
              >
                {pick(CONTENT[s].title.ar, CONTENT[s].title.en)}
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
        >
          {pick("العودة للصفحة الرئيسية", "Back to Home")}
          <ForwardArrow className="h-3.5 w-3.5" />
        </Link>

        <p className="text-center text-[10px] text-muted-foreground">
          {pick("آخر تحديث:", "Last updated:")}{" "}
          {new Date().toLocaleDateString(lang === "ar" ? "ar-QA" : "en-GB", { year: "numeric", month: "long" })}
        </p>
      </main>
    </div>
  );
};

export default Legal;