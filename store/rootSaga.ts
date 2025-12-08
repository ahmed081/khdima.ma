import { all, fork } from "redux-saga/effects";
import authSaga from "./sagas/authSaga";
import requestWatcherSaga from "./sagas/requestWatcherSaga";

export default function* rootSaga() {
    yield all([fork(authSaga), fork(requestWatcherSaga)]);
}
