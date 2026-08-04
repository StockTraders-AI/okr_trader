import Donut from "./Donut.jsx";
import { OBJECTIVES } from "../data/okrConfig.js";
import { T } from "../data/theme.js";
import { money, numberFormatter as nf } from "../utils/format.js";
import { actualFor, effectiveDays as effDays, fineOf, missedReportCount as missReports, monthlyTarget as mTarget, overall, reportDone, statusOf, totals, workingDays } from "../utils/okr.js";

export default function ScoreView({ trader: tr, year, month }) {
  const cachedTotals = totals(tr);
  const score = overall(tr, year, month);
  const overallStatus = statusOf(score);
  const workDays = workingDays(year, month);
  const effective = effDays(year, month);
  const reports = reportDone(tr);
  const missed = missReports(tr, year, month);
  const fine = fineOf(tr, year, month);
  const acceptRate = cachedTotals.invite > 0 ? cachedTotals.friend / cachedTotals.invite : 0;

  return (
    <div className="grid">
      <div className="col">
        <div className="card">
          <div className="clabel">Điểm OKR tháng</div>
          <Donut value={score} color={overallStatus.c} />
          <div style={{ textAlign: "center", marginTop: 4 }}><span className="pill" style={{ background: `${overallStatus.c}22`, color: overallStatus.c }}>{overallStatus.text}</span></div>
          <div style={{ fontSize: 11.5, color: T.dim, textAlign: "center", marginTop: 10 }}>Trung bình % hoàn thành của 8 chỉ số (mỗi chỉ số tối đa 100%).</div>
        </div>
        <div className="card">
          <Mini label="Ngày công (T7 tính 1/2)" value={nf.format(effective)} />
          <Mini label="Report đã nộp (T2-T7)" value={`${reports}/${workDays}`} />
          <Mini label="Tỷ lệ accept kết bạn" value={`${(acceptRate * 100).toFixed(1)}%`} color={acceptRate >= 0.25 ? T.green : T.amber} />
        </div>
        <div className="card" style={{ borderColor: missed ? "rgba(255,45,85,.35)" : T.border }}>
          <div className="clabel">Phạt report</div>
          <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: fine ? T.red : T.green }}>{money(fine)}</div>
          <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{missed > 0 ? `Thiếu ${missed} ngày x 30.000đ` : "Đủ report - không bị trừ."}</div>
        </div>
      </div>
      <div className="col">
        {OBJECTIVES.map((objective) => (
          <div className="card" key={objective.id}>
            <div className="obj-h"><span className="obj-id">{objective.id}</span><span className="obj-t">{objective.title}</span></div>
            {objective.krs.map((kr) => <KrRow key={kr.key} tr={tr} kr={kr} totals={cachedTotals} year={year} month={month} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value, color }) {
  return (
    <div className="mini">
      <span>{label}</span>
      <b style={{ color }}>{value}</b>
    </div>
  );
}

function KrRow({ tr, kr, totals: cachedTotals, year, month }) {
  const target = mTarget(tr, kr.key, year, month);
  const actual = actualFor(tr, kr.key, cachedTotals);
  const progress = target > 0 ? actual / target : 0;
  const status = statusOf(progress);

  return (
    <div className="kr">
      <div style={{ minWidth: 0 }}><div className="lbl">{kr.label}</div><div className="hint">{kr.hint} → {nf.format(target)}/tháng</div></div>
      <div className="nums">
        <div className="val"><span style={{ color: status.c, fontWeight: 700 }}>{nf.format(actual)}</span><span style={{ color: T.dim }}> / </span><span style={{ color: T.dim }}>{nf.format(target)}</span></div>
        <div className="pctv" style={{ color: status.c }}>{(progress * 100).toFixed(0)}%</div>
      </div>
      <div className="track"><div className="fill" style={{ width: `${Math.min(100, progress * 100)}%`, background: status.c }} /></div>
    </div>
  );
}
