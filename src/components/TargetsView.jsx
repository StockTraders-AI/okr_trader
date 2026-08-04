import { RATE_COLUMNS as RATE_COLS } from "../data/okrConfig.js";
import { T } from "../data/theme.js";
import { numberFormatter as nf } from "../utils/format.js";
import { monthlyTarget as mTarget } from "../utils/okr.js";

export default function TargetsView({ traders, year, month, onRate }) {
  return (
    <div className="card">
      <div className="note">Đặt <b>nhịp chỉ tiêu riêng</b> cho từng trader (theo ngày hoặc tuần). Hệ thống tự quy ra chỉ tiêu tháng (<span style={{ fontFamily: T.mono }}>=.../th</span>) theo ngày công. Report tính tự động - không cần đặt.</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ minWidth: 820 }}>
          <thead><tr><th className="l">Trader</th>{RATE_COLS.map((column) => <th key={column.key}>{column.label}<div style={{ fontWeight: 400, color: T.dim, fontSize: 10 }}>{column.unit}</div></th>)}</tr></thead>
          <tbody>
            {traders.map((trader) => (
              <tr key={trader.id}>
                <td className="l"><span className="tname"><span className="avatar">{trader.initials}</span>{trader.name}</span></td>
                {RATE_COLS.map((column) => (
                  <td key={column.key}>
                    <input className="cell" type="number" value={trader.rates[column.key]} onChange={(event) => onRate(trader.id, column.key, Number(event.target.value) || 0)} />
                    <div className="mini2">={nf.format(mTarget(trader, column.key, year, month))}/th</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
