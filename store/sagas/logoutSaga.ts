import { takeLatest, call } from "redux-saga/effects";
import { logout } from "../slices/authSlice";

function* logoutWorker() {
    try {
        // Call backend to clear JWT cookie
        yield call(fetch, "/api/auth/logout", { method: "POST" });

        // Client-side redirect (safe in sagas)
        if (typeof window !== "undefined") {
            window.location.href = "/";   // redirects immediately
        }

    } catch (error) {
        console.error("Logout failed:", error);
    }
}

export function* logoutSaga() {
    yield takeLatest(logout.type, logoutWorker);
}
