import ScoreView from "./ScoreView.jsx";
import LogView from "./LogView.jsx";
import { overall, statusOf } from "../utils/okr.js";

export default function DetailView({ trader: tr, year, month, tab, isAdmin, onBack, onTab, onDay }) {
  const score = overall(tr, year, month);
  const status = statusOf(score);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "22px auto 18px", maxWidth: 1180, padding: "0 20px" }}>
        {isAdmin && <button className="back" onClick={onBack} type="button">{`\u2190 Danh s\u00e1ch`}</button>}
        <span className="tname" style={{ fontSize: 16 }}><span className="avatar">{tr.initials}</span>{tr.name}</span>
        <span className="pill" style={{ background: `${status.c}22`, color: status.c }}>OKR {(score * 100).toFixed(0)}% &middot; {status.text}</span>
        <span style={{ flex: 1 }} />
        <nav className="tabs" style={{ margin: 0 }}>
          <button className={"tab" + (tab === "score" ? " active" : "")} onClick={() => onTab("score")} type="button">{`B\u1ea3ng ch\u1ea5m OKR`}</button>
          <button className={"tab" + (tab === "log" ? " active" : "")} onClick={() => onTab("log")} type="button">{`Nh\u1eadt k\u00fd h\u1eb1ng ng\u00e0y`}</button>
        </nav>
      </div>
      {tab === "score" ? <ScoreView trader={tr} year={year} month={month} /> : <LogView trader={tr} year={year} month={month} isAdmin={isAdmin} onDay={onDay} />}
    </>
  );
}