import { takeEvery, put } from "redux-saga/effects";
import { unauthorized, setGlobalError } from "../slices/appSlice";

export const API_REQUEST_FAILED = "api/requestFailed";
export const API_REQUEST_SUCCESS = "api/requestSuccess";

function* requestFailedWorker(action: any) {
    const { status, message } = action.payload;

    if (status === 401) {
        yield put(unauthorized());
    } else {
        yield put(setGlobalError(message));
    }
}

function* requestSuccessWorker(_action: any) {
    // Handle global side effects on API success (e.g., toast notifications)
}

export default function* requestWatcherSaga() {
    yield takeEvery(API_REQUEST_FAILED, requestFailedWorker);
    yield takeEvery(API_REQUEST_SUCCESS, requestSuccessWorker);
}
