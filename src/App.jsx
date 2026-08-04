import { useMemo, useState } from "react";
import AddTraderModal from "./components/AddTraderModal.jsx";
import DetailView from "./components/DetailView.jsx";
import Header from "./components/Header.jsx";
import LoginView from "./components/LoginView.jsx";
import MainNav from "./components/MainNav.jsx";
import TargetsView from "./components/TargetsView.jsx";
import TeamView from "./components/TeamView.jsx";
import { pageStyle } from "./data/theme.js";
import { buildTraders, createBlankTrader, rebuildMonth } from "./utils/okr.js";

const YEAR = 2026;
const DEFAULT_MONTH = 7;

export default function App() {
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [traders, setTraders] = useState(() => buildTraders(YEAR, DEFAULT_MONTH));
  const [user, setUser] = useState(null);
  const [view, setView] = useState("team");
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("score");
  const [showModal, setShowModal] = useState(false);

  const selectedTrader = useMemo(() => traders.find((trader) => trader.id === selectedId), [traders, selectedId]);
  const isAdmin = user?.role === "admin";

  function handleLogin(username, password) {
    if (username === "admin" && password === "123") {
      setUser({ role: "admin", name: "Quản trị", initials: "AD" });
      setView("team");
      setSelectedId(null);
      return true;
    }

    const trader = traders.find((item) => item.user === username && item.password === password);
    if (!trader) return false;

    setUser({ role: "trader", traderId: trader.id, name: trader.name, initials: trader.initials });
    setSelectedId(trader.id);
    setView("detail");
    setDetailTab("score");
    return true;
  }

  function handleMonth(nextMonth) {
    setMonth(nextMonth);
    setTraders((current) => current.map((trader) => rebuildMonth(trader, YEAR, nextMonth)));
  }

  function handleLogout() {
    setUser(null);
    setView("team");
    setSelectedId(null);
    setDetailTab("score");
    setShowModal(false);
  }

  function openTrader(id) {
    setSelectedId(id);
    setView("detail");
    setDetailTab("score");
  }

  function updateRate(traderId, key, value) {
    setTraders((current) => current.map((trader) => {
      if (trader.id !== traderId) return trader;
      const rates = { ...trader.rates, [key]: value };
      return rebuildMonth({ ...trader, rates }, YEAR, month);
    }));
  }

  function updateDay(traderId, rowIndex, key, value) {
    setTraders((current) => current.map((trader) => {
      if (trader.id !== traderId) return trader;
      const days = trader.days.map((day, index) => index === rowIndex ? { ...day, [key]: value } : day);
      return { ...trader, days };
    }));
  }

  function createTrader(phone) {
    setTraders((current) => [...current, createBlankTrader(phone, YEAR, month)]);
    setShowModal(false);
    setView("team");
  }

  if (!user) {
    return (
      <div style={pageStyle}>
        <Header logoOnly />
        <LoginView traders={traders} onLogin={handleLogin} />
      </div>
    );
  }

  const lockedTrader = user.role === "trader" ? traders.find((trader) => trader.id === user.traderId) : selectedTrader;

  return (
    <div style={pageStyle}>
      <Header user={user} month={month} year={YEAR} onMonth={handleMonth} onLogout={handleLogout} />
      <MainNav view={view} isAdmin={isAdmin} onView={setView} onAddTrader={() => setShowModal(true)} />

      {user.role === "trader" && lockedTrader && (
        <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin={false} onTab={setDetailTab} onDay={updateDay} />
      )}

      {isAdmin && view === "team" && <TeamView traders={traders} year={YEAR} month={month} onOpen={openTrader} />}
      {isAdmin && view === "targets" && <TargetsView traders={traders} year={YEAR} month={month} onRate={updateRate} />}
      {isAdmin && view === "detail" && lockedTrader && (
        <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin onBack={() => setView("team")} onTab={setDetailTab} onDay={updateDay} />
      )}
      {showModal && <AddTraderModal traders={traders} onClose={() => setShowModal(false)} onCreate={createTrader} />}
    </div>
  );
}
