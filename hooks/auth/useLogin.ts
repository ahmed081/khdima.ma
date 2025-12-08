"use client";

import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";
import { API_REQUEST_FAILED } from "@/store/sagas/requestWatcherSaga";

async function fetchUserMe() {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) throw new Error("Impossible de récupérer l'utilisateur");
    return res.json();
}

export function useLogin(onSuccessRedirect: (role: string) => void) {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                const err: any = new Error(data.error || "Erreur de connexion");
                err.status = res.status;
                throw err;
            }

            return data;
        },

        onSuccess: async () => {
            try {
                const user = await fetchUserMe();
                dispatch(setUser(user)); // hydrate redux

                onSuccessRedirect(user.role);
            } catch (err: any) {
                dispatch({
                    type: API_REQUEST_FAILED,
                    payload: { status: 500, message: err.message },
                });
            }
        },

        onError: (err: any) => {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { status: err.status, message: err.message },
            });
        },
    });
}
