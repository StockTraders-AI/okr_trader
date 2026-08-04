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
  const status = String(reply?.status || "").toLowerCase();
  const isSuccess = codeID === "S0000" || codeName === "SUCSESS" || codeName === "SUCCESS";
  const isActive = !status || status.includes("hoạt động") || status.includes("active");

  if (!isSuccess || !userName) {
    throw new Error("Account không tồn tại hoặc chưa được active.");
  }

  if (!isActive) {
    throw new Error("Account chưa ở trạng thái hoạt động.");
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

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
