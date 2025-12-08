import { takeEvery, put } from "redux-saga/effects";
import { unauthorized, setGlobalError } from "../slices/appSlice";

// Action triggered by failed API requests (you will manually dispatch this)
export const API_REQUEST_FAILED = "api/requestFailed";

function* requestFailedWorker(action: any) {
    const { status, message } = action.payload;

    if (status === 401) {
        yield put(unauthorized());
    } else {
        yield put(setGlobalError(message));
    }
}

export default function* requestWatcherSaga() {
    yield takeEvery(API_REQUEST_FAILED, requestFailedWorker);
}
