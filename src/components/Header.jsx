import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { DEFAULT_POLICY_TEXT } from "../utils/okr.js";
import { LOGO, T, headerStyle } from "../data/theme.js";

export default function Header({ user, month, year, onMonth, onLogout, onHelp, logoOnly, subtitle = DEFAULT_POLICY_TEXT, canEditSubtitle, onSubtitleSave }) {
  const subtitleText = subtitle || DEFAULT_POLICY_TEXT;
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [subtitleDraft, setSubtitleDraft] = useState(subtitleText);

  useEffect(() => {
    setSubtitleDraft(subtitleText);
    setEditingSubtitle(false);
  }, [subtitleText]);

  function saveSubtitle() {
    onSubtitleSave?.(subtitleDraft);
    setEditingSubtitle(false);
  }

  return (
    <header style={headerStyle}>
      <img className="sq" src={LOGO} alt="OKR Trader" />
      <div style={{ flex: 1, minWidth: 200 }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>OKR Trader — Chăm sóc và chuyển đổi khách</h1>
        {!editingSubtitle ? (
          <div className="subtitle-row" style={{ fontSize: 12.5, color: T.dim, marginTop: 2 }}>
            <span>{subtitleText}</span>
            {canEditSubtitle && (
              <button className="subtitle-edit" onClick={() => setEditingSubtitle(true)} title="Sửa dòng chính sách" type="button">
                <Pencil size={13} strokeWidth={2.2} />
              </button>
            )}
          </div>
        ) : (
          <div className="subtitle-inline-edit">
            <input className="subtitle-input" value={subtitleDraft} onChange={(event) => setSubtitleDraft(event.target.value)} autoFocus />
            <button className="subtitle-action" onClick={saveSubtitle} title="Lưu" type="button"><Check size={14} strokeWidth={2.4} /></button>
            <button className="subtitle-action" onClick={() => { setSubtitleDraft(subtitleText); setEditingSubtitle(false); }} title="Hủy" type="button"><X size={14} strokeWidth={2.4} /></button>
          </div>
        )}
      </div>
      {!logoOnly && user && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={month} onChange={(event) => onMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, value) => (
              <option key={value} value={value}>Tháng {value + 1}/{year}</option>
            ))}
          </select>
          <span className="userchip">
            <span className="avatar" style={{ margin: "0 6px 0 0" }}>{user.initials}</span>
            {user.name}
            <span style={{ color: T.dim, fontWeight: 400 }}>&nbsp;· {user.role === "admin" ? "Admin" : "Trader"}</span>
          </span>
          <button className="helpbtn" onClick={onHelp} title="Hướng dẫn sử dụng" type="button">? Hướng dẫn</button>
          <button className="back" onClick={onLogout} type="button">Đăng xuất</button>
        </div>
      )}
    </header>
  );
}