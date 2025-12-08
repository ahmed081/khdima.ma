import { call, put, takeLatest } from "redux-saga/effects";
import { setUser } from "../slices/authSlice";

function* loadUserWorker() {
    try {
        const res: Response = yield call(fetch, "/api/auth/me", {
            credentials: "include",
        });

        // 🔥 If unauthorized → user = null
        if (res.status === 401) {
            yield put(setUser(null));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const data = yield res.json();

        // 🔥 Your API returns the user directly (not { user: ... })
        if (!data || !data.id) {
            yield put(setUser(null));
            return;
        }

        // Success → save user in Redux
        yield put(setUser(data));

    } catch (e) {
        // Any network/server error → logout user
        yield put(setUser(null));
    }
}

export function* loadUserSaga() {
    yield takeLatest("auth/loadUser", loadUserWorker);
}
