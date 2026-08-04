import { T } from "../data/theme.js";
import { useState } from "react";

export default function AddTraderModal({ traders, onClose, onCreate }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function createTrader() {
    const raw = phone.replace(/\s+/g, "");
    if (!/^0\d{8,10}$/.test(raw)) {
      setError("Số điện thoại không hợp lệ (bắt đầu bằng 0, 9–11 số).");
      return;
    }
    if (traders.some((trader) => trader.user === raw)) {
      setError("Số điện thoại đã tồn tại.");
      return;
    }
    onCreate(raw);
  }

  return (
    <div className="overlay" onClick={(event) => event.target.classList.contains("overlay") && onClose()}>
      <div className="modal">
        <div className="mhead">
          <div className="micon">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
          </div>
          <div><div className="mtitle">Thêm trader mới</div><div className="msub">Tạo tài khoản trader bằng số điện thoại</div></div>
        </div>
        <label className="flab" style={{ margin: "0 0 2px" }}>Số điện thoại</label>
        <div className="field">
          <span className="pre"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" /></svg></span>
          <input
            className="fld"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0912 345 678"
            maxLength={15}
            autoFocus
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && createTrader()}
          />
        </div>
        <div style={{ color: T.red, fontSize: 12, minHeight: 16, margin: "7px 0 2px" }}>{error}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose} type="button">Huỷ</button>
          <button className="btn-primary" style={{ flex: 1.4 }} onClick={createTrader} type="button">Tạo trader</button>
        </div>
        <div className="note" style={{ margin: "16px 0 0", fontSize: 11, lineHeight: 1.6 }}>Đăng nhập &amp; xác thực qua API (OTP theo số điện thoại). Chỉ tiêu mặc định = nhịp chuẩn — chỉnh ở «Đặt chỉ tiêu». Nhật ký bắt đầu trống.</div>
      </div>
    </div>
  );
}
