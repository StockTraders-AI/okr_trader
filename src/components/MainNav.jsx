import { navRow } from "../data/theme.js";

export default function MainNav({ view, isAdmin, onView, onAddTrader }) {
  if (!isAdmin || view === "detail") return null;

  return (
    <div style={navRow}>
      <nav className="tabs" style={{ margin: 0 }}>
        <button className={"tab" + (view === "team" ? " active" : "")} onClick={() => onView("team")} type="button">Tổng quan đội</button>
        <button className={"tab" + (view === "targets" ? " active" : "")} onClick={() => onView("targets")} type="button">Đặt chỉ tiêu</button>
      </nav>
      <span style={{ flex: 1 }} />
      <button className="add" onClick={onAddTrader} type="button">+ Thêm trader</button>
    </div>
  );
}
