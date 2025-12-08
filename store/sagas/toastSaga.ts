import { takeEvery, put, delay } from "redux-saga/effects";
import { showToast, clearToast } from "../slices/toastSlice";

function* autoClearToast() {
    yield delay(3000);
    yield put(clearToast());
}

export default function* toastSaga() {
    yield takeEvery(showToast.type, autoClearToast);
}
