import { LOGO, T, headerStyle } from "../data/theme.js";

export default function Header({ user, month, year, onMonth, onLogout, logoOnly }) {
  return (
    <header style={headerStyle}>
      <img className="sq" src={LOGO} alt="OKR Trader" />
      <div style={{ flex: 1, minWidth: 200 }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>OKR Trader — Chăm sóc và chuyển đổi khách</h1>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 2 }}>Chính sách dành cho Trader được kiểm soát đặc biệt</div>
      </div>
      {!logoOnly && user && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={month} onChange={(event) => onMonth(Number(event.target.value))}>
            {[7, 8, 9, 10, 11].map((value) => (
              <option key={value} value={value}>Tháng {value + 1}/{year}</option>
            ))}
          </select>
          <span className="userchip">
            <span className="avatar" style={{ margin: "0 6px 0 0" }}>{user.initials}</span>
            {user.name}
            <span style={{ color: T.dim, fontWeight: 400 }}>&nbsp;· {user.role === "admin" ? "Admin" : "Trader"}</span>
          </span>
          <button className="back" onClick={onLogout} type="button">Đăng xuất</button>
        </div>
      )}
    </header>
  );
}
