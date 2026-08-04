import { LOG_COLUMNS as LOG_COLS, VN_DOW } from "../data/okrConfig.js";
import { T } from "../data/theme.js";
import { ddmm, numberFormatter as nf, parseISO } from "../utils/format.js";
import { totals, workingDays } from "../utils/okr.js";

export default function LogView({ trader: tr, year, month, onDay }) {
  const cachedTotals = totals(tr);
  const workDays = workingDays(year, month);

  return (
    <div className="card">
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>Nhật ký hằng ngày</div>
        <div style={{ fontSize: 11.5, color: T.dim, marginTop: 2 }}>Ngày công T2-T7 (T7 nửa ngày) cần report. T7 &amp; CN vẫn nhập được nếu chạy thêm task - phần làm thêm vẫn cộng vào chỉ tiêu.</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: 720 }}>
          <thead><tr><th className="l">Ngày</th>{LOG_COLS.map((column) => <th key={column.key}>{column.label}</th>)}<th>Report</th></tr></thead>
          <tbody>
            {tr.days.map((day, index) => {
              const date = parseISO(day.date);
              const off = day.type === "off";
              const dow = `${VN_DOW[date.getDay()]}${day.type === "half" ? " 1/2" : ""}`;
              return (
                <tr key={day.date} className={`day ${day.type}`}>
                  <td className="l"><span style={{ fontFamily: T.mono, fontWeight: 600 }}>{ddmm(date)}</span><span style={{ fontSize: 11, marginLeft: 6, color: off ? "#586074" : T.dim }}>{dow}</span></td>
                  {LOG_COLS.map((column) => (
                    <td key={column.key}><input className="cell" type="number" value={day[column.key]} onChange={(event) => onDay(tr.id, index, column.key, Number(event.target.value) || 0)} /></td>
                  ))}
                  <td>{off ? <span style={{ color: "#586074", fontSize: 12 }}>nghỉ</span> : (
                    <button
                      className="rep"
                      onClick={() => onDay(tr.id, index, "report", day.report ? 0 : 1)}
                      style={{ background: day.report ? `${T.green}22` : `${T.red}1c`, color: day.report ? T.green : T.red, borderColor: `${day.report ? T.green : T.red}55` }}
                      type="button"
                    >
                      {day.report ? "✓ Đã nộp" : "✕ Chưa"}
                    </button>
                  )}</td>
                </tr>
              );
            })}
            <tr className="total">
              <td className="l" style={{ fontWeight: 600 }}>TỔNG THÁNG</td>
              {LOG_COLS.map((column) => <td key={column.key} className="tv">{nf.format(cachedTotals[column.key] || 0)}</td>)}
              <td className="tv">{tr.days.filter((day) => day.type !== "off" && day.report).length}/{workDays}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
