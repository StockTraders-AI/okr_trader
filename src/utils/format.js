export const numberFormatter = new Intl.NumberFormat("vi-VN");

export function money(value) {
  return `${numberFormatter.format(Math.max(0, Math.round(value)))}đ`;
}

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function iso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ddmm(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatPhone(phone) {
  return phone.length === 10 ? phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : phone;
}
