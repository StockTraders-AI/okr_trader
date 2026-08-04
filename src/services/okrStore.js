export async function loadOkrState(year, month) {
  const response = await fetch(`/api/okr-state?year=${year}&month=${month}`, {
    headers: { Accept: "application/json" },
  });

  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

export async function saveOkrState(year, month, traders) {
  const response = await fetch("/api/okr-state", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ year, month, traders }),
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
