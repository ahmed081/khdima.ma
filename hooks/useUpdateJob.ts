"use client";

import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { API_REQUEST_FAILED } from "@/store/sagas/requestWatcherSaga";

export function useUpdateJob(jobId: number, onSuccess: () => void) {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: async (values: any) => {
            const res = await fetch(`/api/employers/jobs/${jobId}/edit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const errorObj: any = new Error(err.error || "Erreur");
                errorObj.status = res.status;
                throw errorObj;
            }

            return res.json();
        },

        onSuccess,

        onError: (err: any) => {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { status: err.status, message: err.message },
            });
        },
    });
}
