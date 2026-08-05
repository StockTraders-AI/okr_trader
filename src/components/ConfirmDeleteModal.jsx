import { T } from "../data/theme.js";

export default function ConfirmDeleteModal({ trader, onClose, onConfirm }) {
  if (!trader) return null;

  return (
    <div className="overlay" onClick={(event) => event.target.classList.contains("overlay") && onClose()}>
      <div className="modal">
        <div className="mhead">
          <div className="micon" style={{ background: "linear-gradient(135deg,#FF2D55,#ff6a86)", boxShadow: "0 6px 16px rgba(255,45,85,.4)" }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </div>
          <div><div className="mtitle">Xoá trader</div><div className="msub">Hành động không thể hoàn tác</div></div>
        </div>
        <div className="note" style={{ marginBottom: 16 }}>Xoá <b style={{ color: T.text }}>{trader.name}</b> khỏi hệ thống? Toàn bộ nhật ký &amp; chỉ tiêu của trader này sẽ mất.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose} type="button">Huỷ</button>
          <button className="btn-danger" style={{ flex: 1.4 }} onClick={onConfirm} type="button">Xoá trader</button>
        </div>
      </div>
    </div>
  );
}