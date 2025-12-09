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

function* requestSuccessWorker(action: any) {
    // You can show a toast or handle global side effects
    // Example: toast success
    console.log("API Success:", action.payload);
}

export default function* requestWatcherSaga() {
    yield takeEvery(API_REQUEST_FAILED, requestFailedWorker);
    yield takeEvery(API_REQUEST_SUCCESS, requestSuccessWorker);
}
