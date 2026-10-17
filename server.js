// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";
import "dotenv/config";
import { createServer as createViteServer } from "vite";

// src/server/smsProvider.ts
var SMS_IR_BASE_URL = "https://api.sms.ir";
function normalizeIranianMobile(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, normalized: "", error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A." };
  }
  const persianDigits = ["\u06F0", "\u06F1", "\u06F2", "\u06F3", "\u06F4", "\u06F5", "\u06F6", "\u06F7", "\u06F8", "\u06F9"];
  const arabicDigits = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
  let cleaned = input.trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(persianDigits[i], String(i));
    cleaned = cleaned.replaceAll(arabicDigits[i], String(i));
  }
  cleaned = cleaned.replace(/[\s\-\(\)\._]/g, "");
  if (cleaned.startsWith("+98")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("0098")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("98") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  } else if (cleaned.startsWith("9") && cleaned.length === 10) {
    cleaned = "0" + cleaned;
  }
  const iranMobileRegex = /^09[0-9]{9}$/;
  if (!iranMobileRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: `\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A (${input}). \u0641\u0631\u0645\u062A \u0635\u062D\u06CC\u062D \u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0627\u06CC\u0631\u0627\u0646: 09xxxxxxxxx \u0645\u06CC\u200C\u0628\u0627\u0634\u062F.`
    };
  }
  return { valid: true, normalized: cleaned };
}
function maskApiKey(key) {
  if (!key || typeof key !== "string") return "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 (Not Configured)";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "****";
  return `${trimmed.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${trimmed.slice(-4)}`;
}
function parseSenderLine(line) {
  if (typeof line === "number") return line;
  const raw = String(line || process.env.SMS_SENDER_LINE || "3000505").trim();
  const digitsOnly = raw.replace(/\D/g, "");
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 3000505 : parsed;
}
async function sendSmsViaProvider(params) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveApiKey = (params.apiKey || process.env.SMS_API_KEY || "").trim();
  const effectiveLineNumber = parseSenderLine(params.lineNumber);
  if (!effectiveApiKey) {
    return {
      success: false,
      status: "failed",
      providerStatus: 0,
      providerMessage: "\u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 SMS.ir \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0634\u062F\u0647 \u0627\u0633\u062A (Missing SMS_API_KEY)",
      error: "\u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 SMS_API_KEY \u062F\u0631 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0633\u0631\u0648\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0644\u0637\u0641\u0627\u064B \u062F\u0631 \u0641\u0627\u06CC\u0644 .env \u06CC\u0627 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u0646\u0644 \u0645\u0642\u062F\u0627\u0631 \u0622\u0646 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
  const phoneValidation = normalizeIranianMobile(params.recipient);
  if (!phoneValidation.valid) {
    return {
      success: false,
      status: "failed",
      providerStatus: 0,
      providerMessage: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A",
      error: phoneValidation.error,
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
  const normalizedPhone = phoneValidation.normalized;
  const trimmedMessage = (params.message || "").trim();
  if (!trimmedMessage) {
    return {
      success: false,
      status: "failed",
      providerStatus: 0,
      providerMessage: "\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645\u06A9 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A",
      error: "\u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645\u06A9 \u0628\u0627 \u0645\u062A\u0646 \u062E\u0627\u0644\u06CC \u0627\u0645\u06A9\u0627\u0646\u200C\u067E\u0630\u06CC\u0631 \u0646\u0645\u06CC\u200C\u0628\u0627\u0634\u062F.",
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
  const endpoint = `${SMS_IR_BASE_URL}/v1/send/bulk`;
  const payload = {
    lineNumber: effectiveLineNumber,
    messageText: trimmedMessage,
    mobiles: [normalizedPhone],
    sendDateTime: null
  };
  const timeoutMs = params.timeoutMs || 1e4;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-KEY": effectiveApiKey,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    let rawBody = "";
    let parsedData = null;
    try {
      rawBody = await response.text();
      parsedData = JSON.parse(rawBody);
    } catch {
      return {
        success: false,
        status: "failed",
        providerStatus: response.status,
        providerMessage: `\u067E\u0627\u0633\u062E \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0632 \u0633\u0631\u0648\u0631 \u067E\u06CC\u0627\u0645\u06A9 (HTTP ${response.status})`,
        error: `\u067E\u0627\u0633\u062E \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F\u0647 \u0627\u0632 SMS.ir \u062F\u0631 \u0642\u0627\u0644\u0628 \u0645\u0639\u062A\u0628\u0631 JSON \u0646\u0645\u06CC\u200C\u0628\u0627\u0634\u062F: ${rawBody.slice(0, 100)}`,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }
    const providerStatus = typeof parsedData.status === "number" ? parsedData.status : response.status;
    const providerMessage = parsedData.message || (response.ok ? "\u0639\u0645\u0644\u06CC\u0627\u062A \u0645\u0648\u0641\u0642" : `\u062E\u0637\u0627\u06CC HTTP ${response.status}`);
    if (response.ok && parsedData.status === 1) {
      const dataObj = parsedData.data || {};
      const packId = dataObj.packId ? String(dataObj.packId) : void 0;
      const messageId = Array.isArray(dataObj.messageIds) && dataObj.messageIds.length > 0 ? Number(dataObj.messageIds[0]) : void 0;
      const cost = typeof dataObj.cost === "number" ? dataObj.cost : void 0;
      return {
        success: true,
        status: "sent",
        // Accepted by provider queue for dispatch
        packId,
        messageId,
        cost,
        providerStatus,
        providerMessage,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }
    let errorExplanation = providerMessage;
    if (providerStatus === 12) {
      errorExplanation = `\u0645\u062D\u062F\u0648\u062F\u06CC\u062A IP \u062F\u0631\u06AF\u0627\u0647 SMS.ir: ${providerMessage}. \u0628\u0627\u06CC\u062F \u0622\u06CC\u200C\u067E\u06CC \u0633\u0631\u0648\u0631 \u0631\u0627 \u062F\u0631 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC SMS.ir \u062F\u0631 \u0644\u06CC\u0633\u062A \u0633\u0641\u06CC\u062F \u0642\u0631\u0627\u0631 \u062F\u0647\u06CC\u062F \u06CC\u0627 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0622\u06CC\u200C\u067E\u06CC \u06A9\u0644\u06CC\u062F \u0631\u0627 \u0628\u0631\u062F\u0627\u0631\u06CC\u062F.`;
    } else if (response.status === 401) {
      errorExplanation = `\u0639\u062F\u0645 \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062F\u0631\u06AF\u0627\u0647 SMS.ir (HTTP 401): ${providerMessage}. \u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u06CC\u0627 \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A.`;
    }
    return {
      success: false,
      status: "failed",
      providerStatus,
      providerMessage,
      error: errorExplanation,
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === "AbortError";
    const errorMessage = isTimeout ? `\u0632\u0645\u0627\u0646 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 SMS.ir \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F (${timeoutMs / 1e3} \u062B\u0627\u0646\u06CC\u0647). \u0627\u062A\u0635\u0627\u0644 \u0634\u0628\u06A9\u0647 \u06CC\u0627 \u0633\u0631\u0648\u0631 \u067E\u06CC\u0627\u0645\u06A9 \u0628\u0627 \u06A9\u0646\u062F\u06CC \u0645\u0648\u0627\u062C\u0647 \u0627\u0633\u062A.` : `\u062E\u0637\u0627\u06CC \u0634\u0628\u06A9\u0647 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 SMS.ir: ${err.message || "Network unreachable"}`;
    return {
      success: false,
      status: "failed",
      providerStatus: isTimeout ? 408 : 503,
      providerMessage: isTimeout ? "Request Timeout" : "Network Failure",
      error: errorMessage,
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
}
async function checkSmsDiagnostics(options) {
  const effectiveApiKey = (options?.apiKey || process.env.SMS_API_KEY || "").trim();
  const senderLine = String(options?.lineNumber || process.env.SMS_SENDER_LINE || "3000505");
  const timeoutMs = options?.timeoutMs || 8e3;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  if (!effectiveApiKey) {
    return {
      isConfigured: false,
      maskedApiKey: maskApiKey(),
      senderLine,
      reachable: false,
      error: "\u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 SMS_API_KEY \u062F\u0631 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0633\u0631\u0648\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.",
      timestamp
    };
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const creditRes = await fetch(`${SMS_IR_BASE_URL}/v1/credit`, {
      method: "GET",
      headers: {
        "X-API-KEY": effectiveApiKey,
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    let creditData = null;
    try {
      creditData = await creditRes.json();
    } catch {
    }
    const providerStatus = creditData?.status ?? creditRes.status;
    const providerMessage = creditData?.message || creditRes.statusText;
    let serverIpHint = null;
    if (providerMessage && typeof providerMessage === "string") {
      const ipMatch = providerMessage.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        serverIpHint = ipMatch[1];
      }
    }
    if (creditRes.ok && creditData?.status === 1) {
      let availableLines = [];
      try {
        const lineRes = await fetch(`${SMS_IR_BASE_URL}/v1/line`, {
          method: "GET",
          headers: { "X-API-KEY": effectiveApiKey, "Accept": "application/json" }
        });
        if (lineRes.ok) {
          const lineData = await lineRes.json();
          if (lineData?.status === 1 && Array.isArray(lineData?.data)) {
            availableLines = lineData.data.map(String);
          }
        }
      } catch {
      }
      return {
        isConfigured: true,
        maskedApiKey: maskApiKey(effectiveApiKey),
        senderLine,
        reachable: true,
        httpStatus: creditRes.status,
        providerStatus: 1,
        providerMessage: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u0631\u06AF\u0627\u0647 SMS.ir \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0627\u0633\u062A",
        credit: creditData?.data ?? null,
        lines: availableLines,
        serverIpHint,
        timestamp
      };
    }
    return {
      isConfigured: true,
      maskedApiKey: maskApiKey(effectiveApiKey),
      senderLine,
      reachable: false,
      httpStatus: creditRes.status,
      providerStatus,
      providerMessage,
      serverIpHint,
      error: providerStatus === 12 ? `\u06A9\u0644\u06CC\u062F \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u0645\u062D\u062F\u0648\u062F \u0628\u0647 IP \u0645\u06CC\u200C\u0628\u0627\u0634\u062F (\u0622\u06CC\u200C\u067E\u06CC \u0633\u0631\u0648\u0631: ${serverIpHint || "\u0645\u0634\u062E\u0635 \u0646\u0634\u062F\u0647"}). \u0644\u0637\u0641\u0627\u064B \u062F\u0631 \u067E\u0646\u0644 SMS.ir \u0627\u06CC\u0646 \u0622\u06CC\u200C\u067E\u06CC \u0631\u0627 \u062B\u0628\u062A \u06CC\u0627 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A IP \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u06CC\u062F.` : `\u067E\u0627\u0633\u062E \u0646\u0627\u0645\u0648\u0641\u0642 \u0627\u0632 SMS.ir: ${providerMessage}`,
      timestamp
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      isConfigured: true,
      maskedApiKey: maskApiKey(effectiveApiKey),
      senderLine,
      reachable: false,
      error: err.name === "AbortError" ? "\u0632\u0645\u0627\u0646 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631 SMS.ir \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F (Timeout)." : `\u062E\u0637\u0627\u06CC \u0634\u0628\u06A9\u0647 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 SMS.ir: ${err.message}`,
      timestamp
    };
  }
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function bootstrap() {
  const app = express();
  const args = process.argv.slice(2);
  let customPort;
  let customHost;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) customPort = args[i + 1];
    if ((args[i] === "--host" || args[i] === "-h") && args[i + 1]) customHost = args[i + 1];
  }
  const PORT = parseInt(customPort || (process.env.PORT === "8080" ? "3000" : process.env.PORT || "3000"), 10);
  const HOST = customHost || process.env.HOST || "0.0.0.0";
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.removeHeader("X-Frame-Options");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  const configuredKey = (process.env.SMS_API_KEY || "").trim();
  const configuredLine = parseSenderLine(process.env.SMS_SENDER_LINE);
  console.log(`[BOOT] SMS Gateway Config: Line=${configuredLine}, Key=${maskApiKey(configuredKey)}`);
  app.get(["/api/v1/health", "/api/v1/health/live", "/api/v1/health/ready"], (req, res) => {
    return res.json({
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "gowarano-b2b",
      database: { status: "up", engine: "PostgreSQL" }
    });
  });
  const ALL_PERMISSIONS = [
    "dashboard.view",
    "users.view",
    "users.create",
    "users.update",
    "users.disable",
    "groups.manage",
    "permissions.assign",
    "products.view",
    "products.manage",
    "inventory.view",
    "inventory.manage",
    "sales.view",
    "sales.create",
    "sales.manage",
    "customers.view",
    "customers.manage",
    "visitors.view",
    "visitors.manage",
    "delivery.view",
    "delivery.manage",
    "accounting.view",
    "accounting.manage",
    "sms.view",
    "sms.manage",
    "reports.view",
    "settings.manage"
  ];
  const INITIAL_USERS = [
    {
      id: "user-001",
      username: "admin",
      displayName: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0644\u0627\u0646 (Admin)",
      role: "admin",
      status: "active",
      email: "admin@gowarano.ir",
      phone: "09121112233",
      groups: ["\u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0631\u0634\u062F"]
    },
    {
      id: "user-002",
      username: "sales_lead",
      displayName: "\u0645\u062D\u0633\u0646 \u0627\u0641\u0634\u0627\u0631 (\u0633\u0631\u067E\u0631\u0633\u062A \u0641\u0631\u0648\u0634)",
      role: "visitor",
      status: "active",
      email: "sales@gowarano.ir",
      phone: "09123456789",
      groups: ["\u062A\u06CC\u0645 \u0641\u0631\u0648\u0634"]
    },
    {
      id: "user-003",
      username: "warehouse_mgr",
      displayName: "\u0642\u0627\u0633\u0645 \u0627\u0646\u0635\u0627\u0631\u06CC (\u0645\u062F\u06CC\u0631 \u0627\u0646\u0628\u0627\u0631)",
      role: "warehouse",
      status: "active",
      email: "warehouse@gowarano.ir",
      phone: "09125556677",
      groups: ["\u0627\u0646\u0628\u0627\u0631\u062F\u0627\u0631\u06CC"]
    }
  ];
  const INITIAL_GROUPS = [
    {
      id: "grp-001",
      name: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0631\u0634\u062F (Super Admin)",
      description: "\u062F\u0633\u062A\u0631\u0633\u06CC \u06A9\u0627\u0645\u0644 \u0628\u0647 \u062A\u0645\u0627\u0645\u06CC \u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0627\u0644\u06CC\u060C \u0627\u0646\u0628\u0627\u0631 \u0648 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646",
      userCount: 1,
      permissions: ALL_PERMISSIONS
    },
    {
      id: "grp-002",
      name: "\u062A\u06CC\u0645 \u0641\u0631\u0648\u0634 \u0648 \u0648\u06CC\u0632\u06CC\u062A\u0648\u0631\u06CC",
      description: "\u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634\u0627\u062A\u060C \u06A9\u0627\u062A\u0627\u0644\u0648\u06AF \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 B2B",
      userCount: 3,
      permissions: ["dashboard.view", "products.view", "sales.view", "sales.create", "customers.view", "visitors.view"]
    },
    {
      id: "grp-003",
      name: "\u0644\u062C\u0633\u062A\u06CC\u06A9 \u0648 \u0627\u0646\u0628\u0627\u0631\u062F\u0627\u0631\u06CC",
      description: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u0645\u0648\u062C\u0648\u062F\u06CC \u0627\u0646\u0628\u0627\u0631\u060C \u062D\u0648\u0627\u0644\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F \u0648 \u062E\u0631\u0648\u062C \u06A9\u0627\u0644\u0627",
      userCount: 2,
      permissions: ["inventory.view", "inventory.manage", "products.view", "delivery.view"]
    }
  ];
  app.post("/api/v1/auth/login", (req, res) => {
    const { username, password } = req.body || {};
    const trimmedUser = (username || "").trim();
    const trimmedPass = (password || "").trim();
    if (trimmedUser === "admin" && trimmedPass === "admin123") {
      const access_token = "gowarano_token_admin_" + Date.now();
      res.setHeader("Set-Cookie", `Authentication=${access_token}; Path=/; HttpOnly; SameSite=Lax`);
      return res.json({
        message: "Logged in successfully",
        access_token,
        user: {
          id: "user-001",
          username: "admin",
          displayName: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0644\u0627\u0646 (Admin)",
          role: "admin",
          access_token,
          permissions: ALL_PERMISSIONS
        }
      });
    }
    return res.status(401).json({
      statusCode: 401,
      message: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A."
    });
  });
  app.post("/api/v1/auth/logout", (req, res) => {
    res.setHeader("Set-Cookie", "Authentication=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly");
    return res.json({ message: "Logged out successfully" });
  });
  app.get("/api/v1/auth/profile", (req, res) => {
    return res.json({
      id: "user-001",
      username: "admin",
      displayName: "\u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0644\u0627\u0646 (Admin)",
      role: "admin",
      permissions: ALL_PERMISSIONS
    });
  });
  app.get("/api/v1/users", (req, res) => {
    return res.json(INITIAL_USERS);
  });
  app.post("/api/v1/users", (req, res) => {
    const newUser = {
      id: `user-${Date.now()}`,
      username: req.body?.username || "user_" + Date.now(),
      displayName: req.body?.displayName || "\u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F",
      role: req.body?.role || "customer",
      status: "active",
      email: req.body?.email || "",
      phone: req.body?.phone || "",
      groups: req.body?.groups || ["\u0645\u0634\u062A\u0631\u06CC\u0627\u0646"]
    };
    INITIAL_USERS.push(newUser);
    return res.status(201).json(newUser);
  });
  app.get("/api/v1/groups", (req, res) => {
    return res.json(INITIAL_GROUPS);
  });
  app.post("/api/v1/groups", (req, res) => {
    const newGroup = {
      id: `grp-${Date.now()}`,
      name: req.body?.name || "\u06AF\u0631\u0648\u0647 \u062C\u062F\u06CC\u062F",
      description: req.body?.description || "",
      userCount: 0,
      permissions: req.body?.permissions || ["dashboard.view"]
    };
    INITIAL_GROUPS.push(newGroup);
    return res.status(201).json(newGroup);
  });
  app.get("/api/v1/repo/status", async (req, res) => {
    try {
      const localShaFull = execSync("git rev-parse HEAD", { cwd: __dirname }).toString().trim();
      const localShaShort = localShaFull.substring(0, 7);
      const localLogRaw = execSync('git log -1 --format="%h|%s|%an|%ad"', { cwd: __dirname }).toString().trim();
      const [lSha, lMsg, lAuthor, lDate] = localLogRaw.split("|");
      let remoteShaFull = localShaFull;
      let hasUpdate = false;
      let commitsBehind = 0;
      let incomingCommits = [];
      let incomingFiles = [];
      let fetchError = null;
      try {
        execSync("git fetch origin main", { cwd: __dirname, timeout: 12e3 });
        remoteShaFull = execSync("git rev-parse origin/main", { cwd: __dirname }).toString().trim();
        if (remoteShaFull !== localShaFull) {
          const countRaw = execSync(`git rev-list --count HEAD..origin/main`, { cwd: __dirname }).toString().trim();
          commitsBehind = parseInt(countRaw, 10) || 0;
          hasUpdate = commitsBehind > 0;
          if (hasUpdate) {
            const rawCommits = execSync(`git log HEAD..origin/main --format="%h|%s|%an|%ad"`, { cwd: __dirname }).toString().trim();
            if (rawCommits) {
              incomingCommits = rawCommits.split("\n").filter(Boolean).map((line) => {
                const [s, m, a, d] = line.split("|");
                return { sha: s, message: m, author: a, date: d };
              });
            }
            const rawFiles = execSync(`git diff --name-only HEAD..origin/main`, { cwd: __dirname }).toString().trim();
            if (rawFiles) {
              incomingFiles = rawFiles.split("\n").filter(Boolean);
            }
          }
        }
      } catch (err) {
        fetchError = err.message;
        console.warn("[REPO STATUS] git fetch error:", err.message);
      }
      return res.json({
        currentCommit: {
          sha: localShaShort,
          fullSha: localShaFull,
          message: lMsg || "\u06A9\u0627\u0645\u06CC\u062A \u062C\u0627\u0631\u06CC \u0633\u06CC\u0633\u062A\u0645",
          author: lAuthor || "arkaadia",
          date: lDate || (/* @__PURE__ */ new Date()).toLocaleString("fa-IR")
        },
        remoteCommit: {
          sha: remoteShaFull.substring(0, 7),
          fullSha: remoteShaFull
        },
        hasUpdate,
        commitsBehind,
        incomingCommits,
        incomingFiles,
        fetchError,
        repoUrl: "https://github.com/arkaadia/water",
        branch: "main",
        checkedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      });
    } catch (err) {
      console.error("[REPO STATUS ERROR]", err);
      return res.status(500).json({
        error: `\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0648\u0636\u0639\u06CC\u062A \u0645\u062E\u0632\u0646 \u06AF\u06CC\u062A: ${err.message}`
      });
    }
  });
  app.post("/api/v1/repo/pull", async (req, res) => {
    const steps = [];
    try {
      const prevShaFull = execSync("git rev-parse HEAD", { cwd: __dirname }).toString().trim();
      steps.push({ step: "fetch", title: "\u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0627\u0632 \u0645\u062E\u0632\u0646 \u06AF\u06CC\u062A\u200C\u0647\u0627\u0628 (git fetch origin main)", status: "running" });
      const fetchOut = execSync("git fetch origin main", { cwd: __dirname, timeout: 15e3 }).toString();
      steps[0].status = "completed";
      steps[0].output = fetchOut || "\u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 origin \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F.";
      let appliedCommits = [];
      try {
        const rawCommits = execSync(`git log HEAD..origin/main --format="%h|%s|%an|%ad"`, { cwd: __dirname }).toString().trim();
        if (rawCommits) {
          appliedCommits = rawCommits.split("\n").filter(Boolean).map((line) => {
            const [s, m, a, d] = line.split("|");
            return { sha: s, message: m, author: a, date: d };
          });
        }
      } catch {
      }
      steps.push({ step: "pull", title: "\u0627\u062F\u063A\u0627\u0645 \u0648 \u0627\u0639\u0645\u0627\u0644 \u06A9\u0627\u0645\u06CC\u062A\u200C\u0647\u0627 \u0631\u0648\u06CC \u0633\u0631\u0648\u0631 (git pull origin main)", status: "running" });
      let pullOut = "";
      try {
        pullOut = execSync("git pull origin main", { cwd: __dirname, timeout: 3e4 }).toString();
      } catch (pullErr) {
        execSync("git stash", { cwd: __dirname });
        pullOut = execSync("git pull origin main", { cwd: __dirname, timeout: 3e4 }).toString();
      }
      steps[1].status = "completed";
      steps[1].output = pullOut;
      const newShaFull = execSync("git rev-parse HEAD", { cwd: __dirname }).toString().trim();
      let changedFiles = [];
      try {
        const diffFiles = execSync(`git diff --name-only ${prevShaFull} ${newShaFull}`, { cwd: __dirname }).toString().trim();
        if (diffFiles) {
          changedFiles = diffFiles.split("\n").filter(Boolean);
        }
      } catch {
      }
      const packageChanged = changedFiles.some((f) => f.includes("package.json"));
      if (packageChanged) {
        steps.push({ step: "deps", title: "\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0627\u0628\u0633\u062A\u06AF\u06CC\u200C\u0647\u0627\u06CC \u067E\u0631\u0648\u0698\u0647 (npm install)", status: "running" });
        const npmOut = execSync("npm install --no-audit", { cwd: __dirname, timeout: 6e4 }).toString();
        steps[steps.length - 1].status = "completed";
        steps[steps.length - 1].output = npmOut;
      } else {
        steps.push({ step: "deps", title: "\u0628\u0631\u0631\u0633\u06CC \u0648\u0627\u0628\u0633\u062A\u06AF\u06CC\u200C\u0647\u0627 \u0648 \u0628\u0633\u062A\u0647\u200C\u0647\u0627", status: "completed", output: "\u067E\u06A9\u06CC\u062C\u200C\u0647\u0627 \u0628\u0647\u200C\u0631\u0648\u0632 \u0647\u0633\u062A\u0646\u062F (\u0646\u06CC\u0627\u0632\u06CC \u0628\u0647 \u0646\u0635\u0628 \u0645\u062C\u062F\u062F npm \u0646\u0628\u0648\u062F)." });
      }
      return res.json({
        success: true,
        previousSha: prevShaFull.substring(0, 7),
        updatedSha: newShaFull.substring(0, 7),
        newShaFull,
        appliedCommits,
        changedFiles,
        steps,
        message: "\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631\u06CC\u0627\u0641\u062A \u0648 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0627\u0639\u0645\u0627\u0644 \u0634\u062F."
      });
    } catch (err) {
      console.error("[REPO PULL ERROR]", err);
      return res.status(500).json({
        success: false,
        error: `\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0648 \u0627\u0639\u0645\u0627\u0644 \u0622\u067E\u062F\u06CC\u062A: ${err.message}`,
        steps
      });
    }
  });
  app.get("/api/sms/diagnostics", async (req, res) => {
    try {
      const apiKeyOverride = req.query.apiKey;
      const lineNumberOverride = req.query.lineNumber;
      const diagnostics = await checkSmsDiagnostics({
        apiKey: apiKeyOverride,
        lineNumber: lineNumberOverride
      });
      return res.json(diagnostics);
    } catch (err) {
      console.error("[SMS DIAGNOSTICS ERROR]", err.message);
      return res.status(500).json({
        isConfigured: false,
        maskedApiKey: maskApiKey(),
        senderLine: "3000505",
        reachable: false,
        error: `\u062E\u0637\u0627\u06CC \u062F\u0627\u062E\u0644\u06CC \u0633\u0631\u0648\u0631 \u062F\u0631 \u0628\u0631\u0631\u0633\u06CC \u0648\u0636\u0639\u06CC\u062A \u067E\u06CC\u0627\u0645\u06A9: ${err.message}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app.post("/api/sms/test", async (req, res) => {
    try {
      const { testRecipient, testMessage, lineNumber, apiKey } = req.body;
      if (!testRecipient) {
        return res.status(400).json({
          success: false,
          error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u0628\u0631\u0627\u06CC \u062A\u0633\u062A \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A."
        });
      }
      const msg = testMessage || "\u062A\u0633\u062A \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0648\u0628\u200C\u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u06A9 \u0633\u0627\u0645\u0627\u0646\u0647 \u067E\u062E\u0634 \u0622\u0628 \u0648 \u0646\u0648\u0634\u06CC\u062F\u0646\u06CC \u06AF\u0648\u0627\u0631\u0627\u0646\u0648";
      console.log(`[SMS TEST] Executing test send to ${testRecipient.slice(0, 4)}***`);
      const result = await sendSmsViaProvider({
        recipient: testRecipient,
        message: msg,
        lineNumber,
        apiKey,
        eventType: "test"
      });
      console.log(`[SMS TEST RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);
      if (!result.success) {
        return res.status(result.providerStatus === 401 ? 401 : 400).json(result);
      }
      return res.json(result);
    } catch (err) {
      console.error("[SMS TEST EXCEPTION]", err.message);
      return res.status(500).json({
        success: false,
        status: "failed",
        error: `\u062E\u0637\u0627\u06CC \u0633\u0631\u0648\u0631 \u0647\u0646\u06AF\u0627\u0645 \u0627\u0631\u0633\u0627\u0644 \u062A\u0633\u062A: ${err.message}`,
        providerStatus: 500,
        providerMessage: "Server Exception",
        recipient: req.body?.testRecipient || "",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app.post("/api/sms/send", async (req, res) => {
    try {
      const { to, message, orderNumber, eventType, lineNumber, apiKey } = req.body;
      if (!to) {
        return res.status(400).json({
          success: false,
          status: "failed",
          error: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A."
        });
      }
      console.log(`[SMS SEND] Dispatching SMS for order="${orderNumber || "-"}" event="${eventType || "-"}" to ${to.slice(0, 4)}***`);
      const result = await sendSmsViaProvider({
        recipient: to,
        message,
        orderNumber,
        eventType,
        lineNumber,
        apiKey
      });
      console.log(`[SMS SEND RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);
      if (!result.success) {
        const httpCode = result.providerStatus === 401 ? 401 : 400;
        return res.status(httpCode).json(result);
      }
      return res.json(result);
    } catch (err) {
      console.error("[SMS SEND EXCEPTION]", err.message);
      return res.status(500).json({
        success: false,
        status: "failed",
        error: `\u062E\u0637\u0627\u06CC \u067E\u0631\u062F\u0627\u0632\u0634 \u067E\u06CC\u0627\u0645\u06A9 \u062F\u0631 \u0633\u0631\u0648\u0631: ${err.message}`,
        providerStatus: 500,
        providerMessage: "Internal Error",
        recipient: req.body?.to || "",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(__dirname, "dist");
  if (isProduction && fs.existsSync(distPath)) {
    console.log(`[SERVER] Serving static production build from ${distPath}`);
    app.use(express.static(distPath, {
      maxAge: "1y",
      etag: true,
      index: "index.html"
    }));
    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/api")) return next();
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", "frame-ancestors *;");
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log(`[SERVER] Mounting Vite in middleware mode (development)`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (req.method !== "GET") {
        return next();
      }
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        res.removeHeader("X-Frame-Options");
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }
  const server = app.listen(PORT, HOST, () => {
    console.log(`
======================================================`);
    console.log(` \u{1F4A7} \u06AF\u0648\u0627\u0631\u0627\u0646\u0648 B2B - \u0633\u0627\u0645\u0627\u0646\u0647 \u062C\u0627\u0645\u0639 \u067E\u062E\u0634 \u0645\u0648\u06CC\u0631\u06AF\u06CC \u0622\u0628 \u0648 \u0646\u0648\u0634\u06CC\u062F\u0646\u06CC`);
    console.log(` Gowarano B2B Platform with Auth & SMS.ir Integration Ready!`);
    console.log(`======================================================`);
    console.log(`  \u279C  Local:       http://localhost:${PORT}/`);
    console.log(`  \u279C  Auth API:    http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`  \u279C  Health:      http://localhost:${PORT}/api/v1/health`);
    console.log(`======================================================
`);
  });
  process.on("SIGTERM", () => {
    console.log("[INFO] SIGTERM signal received. Shutting down gracefully...");
    server.close(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    console.log("\n[INFO] SIGINT signal received. Shutting down gracefully...");
    server.close(() => process.exit(0));
  });
}
bootstrap().catch((err) => {
  console.error("[FATAL SERVER BOOTSTRAP ERROR]", err);
  process.exit(1);
});
