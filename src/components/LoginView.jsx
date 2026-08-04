import { useState } from "react";
import { T } from "../data/theme.js";

export default function LoginView({ onLogin }) {
  const [login, setLogin] = useState({ u: "", p: "", err: "" });
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (loading) return;
    setLoading(true);
    setLogin((current) => ({ ...current, err: "" }));

    try {
      await onLogin(login.u.trim(), login.p);
    } catch (error) {
      setLogin((current) => ({ ...current, err: error?.message || "Sai t\u00ean \u0111\u0103ng nh\u1eadp ho\u1eb7c m\u1eadt kh\u1ea9u." }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "7vh auto 0", padding: "0 20px" }}>
      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{`\u0110\u0103ng nh\u1eadp`}</div>
        <div className="note" style={{ marginBottom: 16 }}>{`T\u00e0i kho\u1ea3n \u0111\u01b0\u1ee3c x\u00e1c th\u1ef1c qua API StockTraders.`}</div>
        <label className="flab">{`T\u00ean \u0111\u0103ng nh\u1eadp`}</label>
        <input
          className="cell finp"
          style={{ width: "100%", margin: "4px 0 12px", textAlign: "left" }}
          autoComplete="username"
          value={login.u}
          disabled={loading}
          onChange={(event) => setLogin({ ...login, u: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && doLogin()}
        />
        <label className="flab">{`M\u1eadt kh\u1ea9u`}</label>
        <input
          className="cell finp"
          style={{ width: "100%", margin: "4px 0 4px", textAlign: "left" }}
          type="password"
          autoComplete="current-password"
          value={login.p}
          disabled={loading}
          onChange={(event) => setLogin({ ...login, p: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && doLogin()}
        />
        <div style={{ color: T.red, fontSize: 12, minHeight: 16, margin: "4px 0" }}>{login.err}</div>
        <button className="add" style={{ width: "100%", padding: 10 }} onClick={doLogin} disabled={loading} type="button">
          {loading ? `\u0110ang \u0111\u0103ng nh\u1eadp...` : `\u0110\u0103ng nh\u1eadp`}
        </button>
      </div>
    </div>
  );
}