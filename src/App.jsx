import { useEffect, useMemo, useState } from "react";
import AddTraderModal from "./components/AddTraderModal.jsx";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal.jsx";
import DetailView from "./components/DetailView.jsx";
import Header from "./components/Header.jsx";
import GuideModal from "./components/GuideModal.jsx";
import LoginView from "./components/LoginView.jsx";
import MainNav from "./components/MainNav.jsx";
import TargetsView from "./components/TargetsView.jsx";
import TeamView from "./components/TeamView.jsx";
import { pageStyle } from "./data/theme.js";
import { buildSessionUser, loginWithApi } from "./services/authApi.js";
import { checkAccount } from "./services/checkAccountApi.js";
import { loadOkrState, saveOkrState } from "./services/okrStore.js";
import { buildTraders, createBlankTrader, DEFAULT_POLICY_TEXT, normalizeTrader, rebuildMonth } from "./utils/okr.js";

const YEAR = 2026;
const DEFAULT_MONTH = 7;
const ADMIN_PATH = "/himlamst";
const TRADER_PATH = "/trader";
const SESSION_KEY = "okr-trader-session";
const ADMIN_PREVIEW = import.meta.env.VITE_ADMIN_PREVIEW === "1";

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [traders, setTraders] = useState(() => buildTraders(YEAR, DEFAULT_MONTH));
  const [user, setUser] = useState(() => readStoredSession(normalizePath(window.location.pathname)));
  const [view, setView] = useState(() => readStoredSession(normalizePath(window.location.pathname))?.role === "trader" ? "detail" : "team");
  const [selectedId, setSelectedId] = useState(() => readStoredSession(normalizePath(window.location.pathname))?.traderId || null);
  const [detailTab, setDetailTab] = useState("score");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [storeError, setStoreError] = useState("");

  const selectedTrader = useMemo(() => traders.find((trader) => trader.id === selectedId), [traders, selectedId]);
  const isAdmin = user?.role === "admin";
  const isAdminRoute = path === ADMIN_PATH;
  const isTraderRoute = path === TRADER_PATH;

  useEffect(() => {
    let cancelled = false;

    loadOkrState(YEAR, month)
      .then((state) => {
        if (cancelled) return;
        setTraders(state.traders.map(normalizeTrader));
        setStoreError("");
      })
      .catch((error) => {
        if (!cancelled) setStoreError(error?.message || "Khong tai duoc du lieu DB.");
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
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

    if (path === ADMIN_PATH) {
      await loginAsAdmin(username, sessionUser, true);
      return;
    }

    if (path === TRADER_PATH) {
      loginAsTrader(username, sessionUser);
      return;
    }

    if (sessionUser.role === "admin") {
      await loginAsAdmin(username, sessionUser);
      return;
    }

    loginAsTrader(username, sessionUser);
  }

  async function loginAsAdmin(username, sessionUser, replace = false) {
    const accountInfo = await checkAccount(username);

    if (!hasAdminRights(accountInfo)) {
      throw new Error("Tài khoản không có quyền Admin.");
    }

    const nextUser = { ...sessionUser, role: "admin", initials: sessionUser.initials || "AD", accountInfo };
    storeSession(nextUser);
    setUser(nextUser);
    setView("team");
    setSelectedId(null);
    navigate(ADMIN_PATH, setPath, replace);
  }

  function loginAsTrader(username, sessionUser) {
    if (sessionUser.traderId) {
      const nextUser = { ...sessionUser, role: "trader" };
      storeSession(nextUser);
      setUser(nextUser);
      setSelectedId(sessionUser.traderId);
      setView("detail");
      setDetailTab("score");
      navigate(TRADER_PATH, setPath, true);
      return;
    }

    const newTrader = createBlankTrader(username, YEAR, month);
    const trader = {
      ...newTrader,
      name: sessionUser.name || newTrader.name,
      initials: sessionUser.initials || newTrader.initials,
    };

    const nextTraders = [...traders, trader];
    setTraders(nextTraders);
    persistTraders(nextTraders);

    const nextUser = { ...sessionUser, role: "trader", traderId: trader.id, name: trader.name, initials: trader.initials };
    storeSession(nextUser);
    setUser(nextUser);
    setSelectedId(trader.id);
    setView("detail");
    setDetailTab("score");
    navigate(TRADER_PATH, setPath, true);
  }

  function handleMonth(nextMonth) {
    setMonth(nextMonth);
  }

  function handleLogout() {
    clearStoredSession();
    setUser(null);
    setView("team");
    setSelectedId(null);
    setDetailTab("score");
    setShowModal(false);
    setConfirmDeleteId(null);
    setShowGuide(false);
    navigate("/", setPath);
  }

  function openTrader(id) {
    setSelectedId(id);
    setView("detail");
    setDetailTab("score");
  }

  function updateRate(traderId, key, value) {
    commitTraders((current) => current.map((trader) => {
      if (trader.id !== traderId) return trader;
      const rates = { ...trader.rates, [key]: value };
      return rebuildMonth({ ...trader, rates }, YEAR, month);
    }));
  }

  function updatePolicyText(traderId, value) {
    commitTraders((current) => current.map((trader) => trader.id === traderId ? { ...trader, policyText: value } : trader));
  }

  function updateDay(traderId, rowIndex, key, value) {
    commitTraders((current) => current.map((trader) => {
      if (trader.id !== traderId) return trader;
      const days = trader.days.map((day, index) => index === rowIndex ? { ...day, [key]: value } : day);
      return { ...trader, days };
    }));
  }

  function createTrader(accountInfo) {
    const userName = accountInfo.userName;
    const trader = {
      ...createBlankTrader(userName, YEAR, month),
      name: userName,
      user: userName,
      initials: userName.slice(0, 2).toUpperCase(),
      accountInfo,
    };

    commitTraders((current) => [...current, trader]);
    setShowModal(false);
    setView("team");
  }

  function deleteTrader(id) {
    commitTraders((current) => current.filter((trader) => trader.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setView("team");
      setDetailTab("score");
    }
    setConfirmDeleteId(null);
  }

  function commitTraders(updater) {
    setTraders((current) => {
      const nextTraders = typeof updater === "function" ? updater(current) : updater;
      persistTraders(nextTraders);
      return nextTraders;
    });
  }

  function persistTraders(nextTraders) {
    saveOkrState(YEAR, month, nextTraders)
      .then(() => setStoreError(""))
      .catch((error) => setStoreError(error?.message || "Khong luu duoc du lieu DB."));
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
  const deleteTarget = traders.find((trader) => trader.id === confirmDeleteId);
  return (
    <div style={pageStyle}>
      <Header user={user} month={month} year={YEAR} subtitle={lockedTrader?.policyText || DEFAULT_POLICY_TEXT} canEditSubtitle={isAdmin && isAdminRoute && view === "detail" && !!lockedTrader} onSubtitleSave={(value) => lockedTrader && updatePolicyText(lockedTrader.id, value)} onMonth={handleMonth} onLogout={handleLogout} onHelp={() => setShowGuide(true)} />
      {storeError && <div style={{ maxWidth: 1180, margin: "0 auto 12px", padding: "0 20px", color: "#FF2D55", fontSize: 12 }}>{storeError}</div>}

      {isAdmin && isAdminRoute && (
        <>
          <MainNav view={view} isAdmin={isAdmin} onView={setView} onAddTrader={() => setShowModal(true)} />
          {view === "team" && <TeamView traders={traders} year={YEAR} month={month} onOpen={openTrader} onDelete={setConfirmDeleteId} />}
          {view === "targets" && <TargetsView traders={traders} year={YEAR} month={month} onRate={updateRate} />}
          {view === "detail" && lockedTrader && (
            <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin onBack={() => setView("team")} onTab={setDetailTab} onDay={updateDay} />
          )}
          {showModal && <AddTraderModal traders={traders} onClose={() => setShowModal(false)} onCreate={createTrader} />}
          {confirmDeleteId && <ConfirmDeleteModal trader={deleteTarget} onClose={() => setConfirmDeleteId(null)} onConfirm={() => deleteTrader(confirmDeleteId)} />}
        </>
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {user.role === "trader" && isTraderRoute && lockedTrader && (
        <DetailView trader={lockedTrader} year={YEAR} month={month} tab={detailTab} isAdmin={false} onTab={setDetailTab} onDay={updateDay} />
      )}
    </div>
  );
}

function readStoredSession(path) {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    if (!session?.role) return previewAdminSession(path);
    if (session.role === "admin" && !hasAdminRights(session.accountInfo)) {
      clearStoredSession();
      return previewAdminSession(path);
    }
    if (path === ADMIN_PATH && session.role !== "admin") return previewAdminSession(path);
    if (path === TRADER_PATH && session.role !== "trader") return null;
    return session;
  } catch {
    return previewAdminSession(path);
  }
}

function previewAdminSession(path) {
  if (!ADMIN_PREVIEW || path !== ADMIN_PATH) return null;
  return { role: "admin", name: "Preview Admin", initials: "AD", accountInfo: { rights: "Admin" }, preview: true };
}

function hasAdminRights(accountInfo) {
  return String(accountInfo?.rights || "").trim().toLowerCase() === "admin";
}

function storeSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
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
