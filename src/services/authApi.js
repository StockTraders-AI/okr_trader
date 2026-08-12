import { slug, initials } from "../utils/format.js";

export async function loginWithApi(username, password) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserLoginRequest: {
        user_name: username,
        password,
      },
    }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  const reply = payload?.UserLoginReply || payload;
  
  const token = reply?.access_token || reply?.accessToken || "";
  const message = reply?.messsage || reply?.message || "Login failed";
  const status = Number(reply?.status);
  const codeName = String(reply?.codeReply?.codeName || "").toUpperCase();
  const codeID = String(reply?.codeReply?.codeID || "").toUpperCase();
  const ok = status === 1 || codeID === "S0000";

  if (!ok || status === 2 || codeName === "ERROR") {
    throw new Error(message || "Login failed");
  }

  return {
    accessToken: token,
    userInfo: parseUserInfo(reply?.userInfo),
    raw: payload,
  };
}

export function buildSessionUser(authResult, username, traders) {
  const info = authResult.userInfo || {};
  const displayName = pickFirst(info, ["full_name", "fullName", "name", "user_name", "username", "userName"]) || username;
  const roleText = String(pickFirst(info, ["role", "roleName", "user_role", "userRole", "type", "user_type", "userType"]) || "").toLowerCase();
  const isAdmin = Boolean(info.isAdmin || info.is_admin || roleText.includes("admin") || roleText.includes("manager") || username.toLowerCase() === "admin");

  if (isAdmin) {
    return {
      role: "admin",
      name: displayName || "Qu\u1ea3n tr\u1ecb",
      initials: "AD",
      accessToken: authResult.accessToken,
      userInfo: info,
    };
  }

  const trader = findTraderForUser(username, displayName, traders);
  return {
    role: "trader",
    traderId: trader?.id || null,
    name: trader?.name || displayName,
    initials: trader?.initials || initials(displayName || username),
    accessToken: authResult.accessToken,
    userInfo: info,
  };
}

export function findTraderForUser(username, displayName, traders) {
  const normalizedUsername = username.toLowerCase();
  const normalizedName = slug(displayName || "");

  return traders.find((trader) => {
    return trader.user === normalizedUsername || slug(trader.name) === normalizedUsername || (normalizedName && slug(trader.name) === normalizedName);
  });
}

function parseUserInfo(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  if (typeof value !== "string") return {};

  const trimmed = value.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed);
  } catch {
    return { value: trimmed };
  }
}

function pickFirst(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}