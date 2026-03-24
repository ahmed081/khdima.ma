import { put, takeLatest, call } from "redux-saga/effects";
import { checkAuth, setUser, authError } from "../slices/authSlice";

function fetchAuthApi() {
    return fetch("/api/auth/me").then((res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
    });
}

function* checkAuthWorker(): any {
    try {
        const data = yield call(fetchAuthApi);
        yield put(setUser(data.user));
    } catch (err: any) {
        yield put(authError(err.message));
    }
}

export default function* authSaga() {
    yield takeLatest(checkAuth.type, checkAuthWorker);
}
