import { put, takeLatest, call } from "redux-saga/effects";
import {
  checkAuth,
  loginRequest,
  registerRequest,
  logoutRequest,
  setUser,
  authError,
  logout,
} from "../slices/authSlice";
import { showToast } from "../slices/toastSlice";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLocalePrefix(): string {
  if (typeof window === "undefined") return "/fr";
  const seg = window.location.pathname.split("/")[1];
  return ["fr", "en", "ar"].includes(seg) ? `/${seg}` : "/fr";
}

function redirectTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.href = getLocalePrefix() + path;
  }
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------------------------------------------------------------------------
// Workers
// ---------------------------------------------------------------------------

function* checkAuthWorker(): any {
  try {
    const data = yield call(apiFetch, "/api/auth/me");
    yield put(setUser(data));
  } catch {
    yield put(setUser(null));
  }
}

function* loginWorker(action: ReturnType<typeof loginRequest>): any {
  try {
    yield put(showToast({ message: "Connexion en cours…", type: "success" }));

    yield call(apiFetch, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action.payload),
    });

    const user = yield call(apiFetch, "/api/auth/me");
    yield put(setUser(user));

    const roleMsg =
      user.role === "ADMIN"    ? "Bienvenue, admin !" :
      user.role === "PROVIDER" ? "Bienvenue sur votre tableau de bord !" :
                                 "Bienvenue !";
    yield put(showToast({ message: roleMsg, type: "success" }));
    // Navigation is handled by the login page's useEffect which watches Redux user state
  } catch (err: any) {
    yield put(authError(err.message));
    yield put(showToast({ message: err.message, type: "error" }));
  }
}

function* registerWorker(action: ReturnType<typeof registerRequest>): any {
  try {
    yield put(showToast({ message: "Création du compte…", type: "success" }));

    const data = yield call(apiFetch, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action.payload),
    });

    // Use the user returned directly from the register endpoint — no extra /me call needed
    yield put(setUser(data.user));
    yield put(showToast({ message: "Compte créé avec succès !", type: "success" }));
    // Navigation is handled by the register page's useEffect which watches Redux user state
  } catch (err: any) {
    yield put(authError(err.message));
    yield put(showToast({ message: err.message, type: "error" }));
  }
}

function* logoutWorker(): any {
  try {
    yield call(apiFetch, "/api/auth/logout", { method: "POST" });
  } catch {
    // ignore logout API errors
  }
  yield put(logout());
  yield put(showToast({ message: "Vous êtes déconnecté.", type: "success" }));
  if (typeof window !== "undefined") {
    window.location.href = getLocalePrefix() + "/";
  }
}

// ---------------------------------------------------------------------------
// Watcher
// ---------------------------------------------------------------------------

export default function* authSaga() {
  yield takeLatest(checkAuth.type,      checkAuthWorker);
  yield takeLatest(loginRequest.type,   loginWorker);
  yield takeLatest(registerRequest.type, registerWorker);
  yield takeLatest(logoutRequest.type,  logoutWorker);
}
