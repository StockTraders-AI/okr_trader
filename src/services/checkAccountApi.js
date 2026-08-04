export async function checkAccount(account) {
  const response = await fetch("/api/check-account", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ account }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  const reply = payload?.CheckAcountReply || payload;
  const codeID = String(reply?.codeReply?.codeID || "").toUpperCase();
  const codeName = String(reply?.codeReply?.codeName || "").toUpperCase();
  const userName = String(reply?.userName || "").trim();
  const status = normalizeText(reply?.status);
  const isSuccess = codeID === "S0000" || codeName === "SUCSESS" || codeName === "SUCCESS";
  const isActive = !status || status.includes("hoat dong") || status.includes("active");

  if (!isSuccess || !userName) {
    throw new Error("Account kh\u00f4ng t\u1ed3n t\u1ea1i ho\u1eb7c ch\u01b0a \u0111\u01b0\u1ee3c active.");
  }

  if (!isActive) {
    throw new Error("Account ch\u01b0a \u1edf tr\u1ea1ng th\u00e1i ho\u1ea1t \u0111\u1ed9ng.");
  }

  return {
    email: reply.email || "",
    fullName: reply.fullName || "",
    mobile: reply.mobile || "",
    rights: reply.rights || "",
    status: reply.status || "",
    userName,
    raw: reply,
  };
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();
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