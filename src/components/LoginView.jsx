import { useState } from "react";
import { T } from "../data/theme.js";

export default function LoginView({ traders, onLogin }) {
  const [login, setLogin] = useState({ u: "", p: "", err: "" });

  function doLogin() {
    const ok = onLogin(login.u.trim().toLowerCase(), login.p);
    if (!ok) setLogin((current) => ({ ...current, err: "Sai tên đăng nhập hoặc mật khẩu." }));
  }

  return (
    <div style={{ maxWidth: 380, margin: "7vh auto 0", padding: "0 20px" }}>
      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Đăng nhập</div>
        <div className="note" style={{ marginBottom: 16 }}>Tài khoản quyết định bạn thấy gì. Admin xem toàn đội; trader chỉ thấy dữ liệu của chính mình.</div>
        <label className="flab">Tên đăng nhập</label>
        <input
          className="cell finp"
          style={{ width: "100%", margin: "4px 0 12px", textAlign: "left" }}
          autoComplete="off"
          value={login.u}
          onChange={(event) => setLogin({ ...login, u: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && doLogin()}
        />
        <label className="flab">Mật khẩu</label>
        <input
          className="cell finp"
          style={{ width: "100%", margin: "4px 0 4px", textAlign: "left" }}
          type="password"
          value={login.p}
          onChange={(event) => setLogin({ ...login, p: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && doLogin()}
        />
        <div style={{ color: T.red, fontSize: 12, minHeight: 16, margin: "4px 0" }}>{login.err}</div>
        <button className="add" style={{ width: "100%", padding: 10 }} onClick={doLogin} type="button">Đăng nhập</button>
        <div className="note" style={{ marginTop: 14, fontSize: 11 }}>Demo: <b>admin / 123</b> · trader vd <b>{traders[0]?.user} / 123</b></div>
      </div>
    </div>
  );
}
