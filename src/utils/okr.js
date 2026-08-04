import {
  ALL_KRS,
  BASE_RATES,
  FINE_PER_MISSED_REPORT,
  PERIOD_BY_KEY,
} from "../data/okrConfig.js";
import { formatPhone, initials, iso, slug } from "./format.js";

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

export function genDays(year, month, rates, performance = 1, missedReports = 0) {
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
      row.report = missedReports > 0 && reportIndex % Math.max(3, Math.round(reportableDays / missedReports)) === 2 ? 0 : 1;
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
    { name: "Thu Hà", rates: { ...BASE_RATES, comm: 8, priv: 4 }, performance: 0.93, missedReports: 1 },
    { name: "Quốc Huy", rates: { ...BASE_RATES }, performance: 0.74, missedReports: 2 },
    { name: "Bảo Trân", rates: { ...BASE_RATES, comm: 12 }, performance: 0.55, missedReports: 3 },
    {
      name: "Đức Khoa",
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
    days: genDays(year, month, BASE_RATES, 0, 0),
  };
}

export function normalizeTrader(trader) {
  return {
    ...trader,
    rates: trader.rates || {},
    days: (trader.days || []).map((day) => {
      const nextDay = { ...day };
      ALL_KRS.forEach((kr) => {
        if (kr.key !== "report" && nextDay[kr.key] == null) nextDay[kr.key] = 0;
      });
      if (nextDay.report == null) nextDay.report = nextDay.type === "off" ? 0 : 1;
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
  if (progress >= 1) return { tone: "good", c: "#3DD68C", text: "Đạt" };
  if (progress >= 0.7) return { tone: "watch", c: "#A78BFA", text: "Gần đạt" };
  return { tone: "bad", c: "#FF2D55", text: "Chưa đạt" };
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

function jitter(value, index) {
  return Math.max(0, Math.round(value * (0.85 + ((index * 13 + 7) % 7) / 20)));
}

