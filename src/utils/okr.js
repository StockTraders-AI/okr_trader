import {
  ALL_KRS,
  BASE_RATES,
  FINE_PER_MISSED_REPORT,
  PERIOD_BY_KEY,
} from "../data/okrConfig.js";
import { formatPhone, initials, iso, slug } from "./format.js";

export const DEFAULT_POLICY_TEXT = "Ch\u00ednh s\u00e1ch d\u00e0nh cho Trader \u0111\u01b0\u1ee3c ki\u1ec3m so\u00e1t \u0111\u1eb7c bi\u1ec7t";

const CP1252_BYTES = {
  0x20AC: 0x80,
  0x201A: 0x82,
  0x0192: 0x83,
  0x201E: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02C6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8A,
  0x2039: 0x8B,
  0x0152: 0x8C,
  0x017D: 0x8E,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201C: 0x93,
  0x201D: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02DC: 0x98,
  0x2122: 0x99,
  0x0161: 0x9A,
  0x203A: 0x9B,
  0x0153: 0x9C,
  0x017E: 0x9E,
  0x0178: 0x9F,
};
const SEEDED_TRADER_NAMES = {
  t1: "Minh Anh",
  t2: "Thu H\u00e0",
  t3: "Qu\u1ed1c Huy",
  t4: "B\u1ea3o Tr\u00e2n",
  t5: "\u0110\u1ee9c Khoa",
};

const SEEDED_TRADER_NAMES_BY_INITIALS = {
  MA: "Minh Anh",
  TH: "Thu H\u00e0",
  QH: "Qu\u1ed1c Huy",
  BT: "B\u1ea3o Tr\u00e2n",
  DK: "\u0110\u1ee9c Khoa",
};
export function cleanText(value) {
  if (typeof value !== "string" || !/(Ã|Ä|Â|Æ|áº|á»|â€)/.test(value)) return value;

  try {
    const bytes = Array.from(value, (char) => {
      const code = char.codePointAt(0);
      if (code <= 0xff) return code;
      if (CP1252_BYTES[code]) return CP1252_BYTES[code];
      throw new Error("Unsupported mojibake byte");
    });
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return value;
  }
}

export function daysOfMonth(year, month) {
  const out = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    const day = date.getDay();
    const type = day === 0 ? "off" : day === 6 ? "half" : "full";
    out.push({ date: new Date(date), type });
    date.setDate(date.getDate() + 1);
  }

  return out;
}

export function workingDays(year, month) {
  return daysOfMonth(year, month).filter((day) => day.type !== "off").length;
}

export function effectiveDays(year, month) {
  return daysOfMonth(year, month).reduce((sum, day) => {
    if (day.type === "full") return sum + 1;
    if (day.type === "half") return sum + 0.5;
    return sum;
  }, 0);
}

export function genDays(year, month, rates, performance = 1, _missedReports = 0) {
  const days = daysOfMonth(year, month);
  const reportableDays = days.filter((day) => day.type !== "off").length;
  const monthlyPosts = Math.round(((rates.post || 0) * performance * effectiveDays(year, month)) / 5);
  let reportIndex = 0;

  return days.map((day, index) => {
    const weight = day.type === "full" ? 1 : day.type === "half" ? 0.5 : 0;
    const row = { date: iso(day.date), type: day.type };

    ["invite", "friend", "comm", "priv", "portrait"].forEach((key) => {
      row[key] = jitter((rates[key] || 0) * performance * weight, index);
    });

    ["port", "nav"].forEach((key) => {
      row[key] = jitter(((rates[key] || 0) * performance * weight) / 5, index);
    });

    if (day.type !== "off") {
      row.post = Math.round(((reportIndex + 1) * monthlyPosts) / reportableDays) > Math.round((reportIndex * monthlyPosts) / reportableDays) ? 1 : 0;
      row.report = 0;
      reportIndex += 1;
    } else {
      row.post = 0;
      row.report = 0;
    }

    return row;
  });
}

export function buildTraders(year, month) {
  const profiles = [
    { name: "Minh Anh", rates: { ...BASE_RATES }, performance: 0.99, missedReports: 0 },
    { name: "Thu H\u00e0", rates: { ...BASE_RATES, comm: 8, priv: 4 }, performance: 0.93, missedReports: 1 },
    { name: "Qu\u1ed1c Huy", rates: { ...BASE_RATES }, performance: 0.74, missedReports: 2 },
    { name: "B\u1ea3o Tr\u00e2n", rates: { ...BASE_RATES, comm: 12 }, performance: 0.55, missedReports: 3 },
    {
      name: "\u0110\u1ee9c Khoa",
      rates: { invite: 40, friend: 4, comm: 6, post: 3, port: 15, nav: 10, priv: 4 },
      performance: 0.66,
      missedReports: 2,
    },
  ];

  return profiles.map((profile, index) => ({
    id: `t${index + 1}`,
    name: profile.name,
    user: slug(profile.name),
    password: "123",
    initials: initials(profile.name),
    rates: profile.rates,
    performance: profile.performance,
    missedReports: profile.missedReports,
    policyText: DEFAULT_POLICY_TEXT,
    days: genDays(year, month, profile.rates, profile.performance, profile.missedReports),
  }));
}

export function createBlankTrader(phone, year, month) {
  return {
    id: `t${Date.now().toString(36)}`,
    name: formatPhone(phone),
    user: phone,
    password: "123",
    initials: phone.slice(-2),
    rates: { ...BASE_RATES },
    performance: 0,
    missedReports: 0,
    policyText: DEFAULT_POLICY_TEXT,
    days: genDays(year, month, BASE_RATES, 0, 0),
  };
}

export function normalizeTrader(trader) {
  const name = repairKnownTraderName(trader, cleanText(trader.name));
  const policyText = cleanText(trader.policyText);

  return {
    ...trader,
    name,
    initials: cleanText(trader.initials) || initials(name),
    rates: trader.rates || {},
    policyText: typeof policyText === "string" ? policyText : DEFAULT_POLICY_TEXT,
    days: (trader.days || []).map((day) => {
      const nextDay = { ...day };
      ALL_KRS.forEach((kr) => {
        if (kr.key !== "report" && nextDay[kr.key] == null) nextDay[kr.key] = 0;
      });
      if (nextDay.report == null) nextDay.report = 0;
      return nextDay;
    }),
  };
}

export function totals(trader) {
  const result = {};
  ALL_KRS.forEach((kr) => {
    result[kr.key] = 0;
  });

  trader.days.forEach((day) => {
    ALL_KRS.forEach((kr) => {
      result[kr.key] += Number(day[kr.key]) || 0;
    });
  });

  return result;
}

export function reportDone(trader) {
  return trader.days.filter((day) => day.type !== "off").reduce((sum, day) => sum + (Number(day.report) ? 1 : 0), 0);
}

export function monthlyTarget(trader, key, year, month) {
  if (key === "report") return workingDays(year, month);

  const period = PERIOD_BY_KEY[key];
  const rate = trader.rates[key] || 0;
  return period === "day" ? Math.round(rate * effectiveDays(year, month)) : Math.round((rate * effectiveDays(year, month)) / 5);
}

export function actualFor(trader, key, cachedTotals) {
  return key === "report" ? reportDone(trader) : (cachedTotals || totals(trader))[key] || 0;
}

export function statusOf(progress) {
  if (progress >= 1) return { tone: "good", c: "#3DD68C", text: "\u0110\u1ea1t" };
  if (progress >= 0.7) return { tone: "watch", c: "#A78BFA", text: "G\u1ea7n \u0111\u1ea1t" };
  return { tone: "bad", c: "#FF2D55", text: "Ch\u01b0a \u0111\u1ea1t" };
}

export function overall(trader, year, month) {
  const cachedTotals = totals(trader);
  const scores = ALL_KRS.map((kr) => {
    const target = monthlyTarget(trader, kr.key, year, month);
    return Math.min(1, target > 0 ? actualFor(trader, kr.key, cachedTotals) / target : 0);
  });

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function missedReportCount(trader, year, month) {
  return Math.max(0, workingDays(year, month) - reportDone(trader));
}

export function fineOf(trader, year, month) {
  return missedReportCount(trader, year, month) * FINE_PER_MISSED_REPORT;
}

export function rebuildMonth(trader, year, month) {
  return {
    ...trader,
    days: genDays(year, month, trader.rates, trader.performance, trader.missedReports),
  };
}

function repairKnownTraderName(trader, name) {
  if (SEEDED_TRADER_NAMES[trader.id]) return SEEDED_TRADER_NAMES[trader.id];

  const traderInitials = String(cleanText(trader.initials) || "").toUpperCase();
  if (hasLostCharacters(name) && SEEDED_TRADER_NAMES_BY_INITIALS[traderInitials]) {
    return SEEDED_TRADER_NAMES_BY_INITIALS[traderInitials];
  }

  return name;
}

function hasLostCharacters(value) {
  return typeof value === "string" && /[\uFFFD?]/.test(value);
}
function jitter(value, index) {
  return Math.max(0, Math.round(value * (0.85 + ((index * 13 + 7) % 7) / 20)));
}