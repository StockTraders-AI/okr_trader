import { bigNum, T } from "../data/theme.js";
import { money, numberFormatter as nf } from "../utils/format.js";
import { actualFor, fineOf, monthlyTarget as mTarget, overall, reportDone, statusOf, totals, workingDays } from "../utils/okr.js";

export default function TeamView({ traders, year, month, onOpen }) {
  const list = [...traders].sort((a, b) => overall(b, year, month) - overall(a, year, month));
  const teamAvg = traders.reduce((a, trader) => a + overall(trader, year, month), 0) / traders.length;
  const teamFine = traders.reduce((a, trader) => a + fineOf(trader, year, month), 0);
  const achieved = traders.filter((trader) => overall(trader, year, month) >= 1).length;
  const teamStatus = statusOf(teamAvg);
  const workDays = workingDays(year, month);

  const cell = (trader, key, cachedTotals) => {
    const actual = actualFor(trader, key, cachedTotals);
    const target = mTarget(trader, key, year, month);
    const status = statusOf(target > 0 ? actual / target : 0);
    return (
      <td key={key}>
        <span style={{ fontFamily: T.mono, color: status.c, fontWeight: 700 }}>{nf.format(actual)}</span>
        <span style={{ fontFamily: T.mono, color: T.dim, fontSize: 11 }}>/{nf.format(target)}</span>
      </td>
    );
  };

  return (
    <>
      <div className="strip" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        <div className="card"><div className="clabel">Số trader</div><div style={bigNum}>{traders.length}</div></div>
        <div className="card"><div className="clabel">Điểm OKR TB đội</div><div style={{ ...bigNum, color: teamStatus.c }}>{(teamAvg * 100).toFixed(0)}%</div></div>
        <div className="card"><div className="clabel">Đạt 100%</div><div style={bigNum}>{achieved}/{traders.length}</div></div>
        <div className="card" style={{ borderColor: teamFine ? "rgba(255,45,85,.35)" : T.border }}><div className="clabel">Tổng phạt report</div><div style={{ ...bigNum, color: teamFine ? T.red : T.green }}>{money(teamFine)}</div></div>
      </div>
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: 820 }}>
            <thead><tr>{["Trader", "Điểm OKR", "Lời mời", "Kết bạn", "Cộng đồng", "Gr riêng", "Report", "Phạt", ""].map((column, index) => <th key={column || index} className={index === 0 ? "l" : ""}>{column}</th>)}</tr></thead>
            <tbody>
              {list.map((trader) => {
                const cachedTotals = totals(trader);
                const score = overall(trader, year, month);
                const status = statusOf(score);
                const reports = reportDone(trader);
                const fine = fineOf(trader, year, month);
                return (
                  <tr key={trader.id} className="trow" onClick={() => onOpen(trader.id)}>
                    <td className="l"><span className="tname"><span className="avatar">{trader.initials}</span>{trader.name}</span></td>
                    <td><span className="sbar"><i style={{ width: `${Math.min(100, score * 100)}%`, background: status.c }} /></span><span style={{ fontFamily: T.mono, color: status.c, fontWeight: 700 }}>{(score * 100).toFixed(0)}%</span></td>
                    {cell(trader, "invite", cachedTotals)}{cell(trader, "friend", cachedTotals)}{cell(trader, "comm", cachedTotals)}{cell(trader, "priv", cachedTotals)}
                    <td><span style={{ fontFamily: T.mono, color: reports >= workDays ? T.green : reports >= workDays * 0.9 ? T.purpleLt : T.red, fontWeight: 600 }}>{reports}/{workDays}</span></td>
                    <td><span style={{ fontFamily: T.mono, color: fine ? T.red : T.dim }}>{fine ? money(fine) : "-"}</span></td>
                    <td className="chev">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="note" style={{ margin: "14px 0 0" }}>Bấm vào 1 trader để xem chi tiết OKR &amp; nhật ký hằng ngày.</div>
      </div>
    </>
  );
}
