export async function loadOkrState(year, month) {
  const response = await fetch(`/api/okr-state?year=${year}&month=${month}`, {
    headers: { Accept: "application/json" },
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function saveOkrDay(year, month, traderId, date, key, value, updatedAt) {
  const response = await fetch("/api/okr-day", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, traderId, date, key, value, updatedAt }),
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function saveTraderRate(year, month, traderId, rateKey, value) {
  const response = await fetch("/api/okr-trader", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, traderId, field: "rate", rateKey, value }),
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function saveTraderField(year, month, traderId, field, value) {
  const response = await fetch("/api/okr-trader", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, traderId, field, value }),
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function createOkrTrader(year, month, trader) {
  const response = await fetch("/api/okr-trader", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, trader }),
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function deleteOkrTrader(year, month, traderId) {
  const response = await fetch("/api/okr-trader", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, traderId }),
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
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