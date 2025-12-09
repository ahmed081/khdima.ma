"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useDispatch} from "react-redux";
import {api} from "@/lib/axios";
import {API_REQUEST_FAILED} from "@/store/sagas/requestWatcherSaga";

export function useUpdateJobStatus(jobId: number, onSuccess?: () => void) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status: "PENDING_REVIEW" | "ACTIVE" | "DELETED") => {
            const res = await api.patch("/jobs/status", {
                jobId, status,
            });

            return res.data;
        },

        onSuccess: async () => {
            // Refresh dashboard automatically
            await queryClient.invalidateQueries({queryKey: ["employerDashboard"]});

            if (onSuccess) onSuccess();
        },

        onError: (err: any) => {
            dispatch({
                type: API_REQUEST_FAILED, payload: {
                    status: err?.response?.status ?? 500, message: err?.response?.data?.error ?? err.message,
                },
            });
        },
    });
}
