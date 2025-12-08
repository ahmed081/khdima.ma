import { all, fork } from "redux-saga/effects";
import authSaga from "./sagas/authSaga";
import requestWatcherSaga from "./sagas/requestWatcherSaga";
import toastSaga from "./sagas/toastSaga";
import {loadUserSaga} from "@/store/sagas/loadUserSaga";
import {logoutSaga} from "@/store/sagas/logoutSaga";


export default function* rootSaga() {
    yield all([
        fork(authSaga),
        fork(requestWatcherSaga),
        fork(toastSaga),
        fork(loadUserSaga),
        fork(logoutSaga),
    ]);
}