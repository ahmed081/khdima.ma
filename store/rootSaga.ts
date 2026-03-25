import { all, fork } from "redux-saga/effects";
import authSaga          from "./sagas/authSaga";
import requestWatcherSaga from "./sagas/requestWatcherSaga";
import toastSaga         from "./sagas/toastSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(requestWatcherSaga),
    fork(toastSaga),
  ]);
}
