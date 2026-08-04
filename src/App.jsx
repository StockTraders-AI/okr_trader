import { useEffect, useMemo, useState } from "react";
import AddTraderModal from "./components/AddTraderModal.jsx";
import DetailView from "./components/DetailView.jsx";
import Header from "./components/Header.jsx";
import LoginView from "./components/LoginView.jsx";
import MainNav from "./components/MainNav.jsx";
import TargetsView from "./components/TargetsView.jsx";
import TeamView from "./components/TeamView.jsx";
import { pageStyle } from "./data/theme.js";
import { buildSessionUser, loginWithApi } from "./services/authApi.js";
import { buildTraders, createBlankTrader, rebuildMonth } from "./utils/okr.js";

const YEAR = 2026;
const DEFAULT_MONTH = 7;
const ADMIN_PATH = "/himlams";
const TRADER_PATH = "/trader";

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [traders, setTraders] = useState(() => buildTraders(YEAR, DEFAULT_MONTH));
  const [user, setUser] = useState(null);
  const [view, setView] = useState("team");
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("score");
  const [showModal, setShowModal] = useState(false);

  const selectedTrader = useMemo(() => traders.find((trader) => trader.id === selectedId), [traders, selectedId]);
  const isAdmin = user?.role === "admin";
  const isAdminRoute = path === ADMIN_PATH;
  const isTraderRoute = path === TRADER_PATH;

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);


  useEffect(() => {
    if (!user && path !== "/") {
      navigate("/", setPath, true);
    }
  }, [path, user]);  useEffect(() => {
    if (!user) return;

    if (user.role === "admin" && path !== ADMIN_PATH) {
      navigate(ADMIN_PATH, setPath, true);
      return;
    }

    if (user.role === "trader" && path !== TRADER_PATH) {
      navigate(TRADER_PATH, setPath, true);
    }
  }, [path, user]);

  async function handleLogin(username, password) {
    const authResult = await loginWithApi(username, password);
    const sessionUser = buildSessionUser(authResult, username, traders);

    if (sessionUser.role === "admin") {
      setUser(sessionUser);
      setView("team");
      setSelectedId(null);
      navigate(ADMIN_PATH, setPath);
      return;
    }

    if (sessionUser.traderId) {
      setUser(sessionUser);
      setSelectedId(sessionUser.traderId);
      setView("detail");
      setDetailTab("score");
      navigate(TRADER_PATH, setPath);
      return;
    }

    const newTrader = createBlankTrader(username, YEAR, month);
    const trader = {
      ...newTrader,
      name: sessionUser.name || newTrader.name,
      initials: sessionUser.initials || newTrader.initials,
    };

    setTraders((current) => [...current, trader]);
    setUser({ ...sessionUser, traderId: trader.id, name: trader.name, initials: trader.initials });
    setSelectedId(trader.id);
    setView("detail");
    setDetailTab("score");
    navigate(TRADER_PATH, setPath);
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
    navigate("/", setPath);
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
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  const lockedTrader = user.role === "trader" ? traders.find((trader) => trader.id === user.traderId) : selectedTrader;

  return (
    <div style={pageStyle}>
      <Header user={user} month={month} year={YEAR} onMonth={handleMonth} onLogout={handleLogout} />

      {isAdmin && isAdminRoute && (
        <>
          <MainNav view={view} isAdmin={isAdmin} onView={setView} onAddTrader={() => setShowModal(true)} />
          {view === "team" && <TeamView traders={traders} year={YEAR} month={month} onOpen={openTrader} />}
          {view === "targets" && <TargetsView traders={traders} year={YEAR} month={month} onRate={updateRate} />}
          {view === "detail" && lockedTrader && (
            <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin onBack={() => setView("team")} onTab={setDetailTab} onDay={updateDay} />
          )}
          {showModal && <AddTraderModal traders={traders} onClose={() => setShowModal(false)} onCreate={createTrader} />}
        </>
      )}

      {user.role === "trader" && isTraderRoute && lockedTrader && (
        <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin={false} onTab={setDetailTab} onDay={updateDay} />
      )}
    </div>
  );
}

function normalizePath(pathname) {
  if (pathname === ADMIN_PATH || pathname === TRADER_PATH) return pathname;
  return "/";
}

function navigate(nextPath, setPath, replace = false) {
  if (window.location.pathname === nextPath) {
    setPath(normalizePath(nextPath));
    return;
  }

  const method = replace ? "replaceState" : "pushState";
  window.history[method](null, "", nextPath);
  setPath(normalizePath(nextPath));
}