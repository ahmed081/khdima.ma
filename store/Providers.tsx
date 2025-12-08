"use client";

import {Provider, useDispatch} from "react-redux";
import { store } from "./index";
import {useEffect} from "react";
function InitAuth() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: "auth/loadUser" });
    }, []);

    return null;
}
export default function Providers({ children }: { children: React.ReactNode }) {

    return (
        <Provider store={store}>
            <InitAuth />
            {children}
        </Provider>
    );}
