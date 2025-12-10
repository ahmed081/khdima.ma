"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { selectUser } from "@/store/slices/authSlice";
import { useApplyToJob } from "@/hooks/useApplyToJob";
import { useJob } from "@/hooks/useJob";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_REQUEST_FAILED, API_REQUEST_SUCCESS } from "@/store/sagas/requestWatcherSaga";

import { useDispatch } from "react-redux";

export default function ApplyForm({ jobId }: { jobId: number }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);

    // 1️⃣ Load the job from your existing hook
    const { data: job, isLoading } = useJob(jobId);

    // CV Upload States
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const { register, handleSubmit } = useForm();

    // 2️⃣ Don't allow employers or job owners to apply
    useEffect(() => {
        if (!job || !user) return;

        if (user.role === "EMPLOYER") {
            router.replace(`/jobs/${jobId}`);
        }

        if (job.employer.id === user.id) {
            router.replace(`/jobs/${jobId}`);
        }
    }, [job, user, jobId, router]);

    // 3️⃣ Apply mutation
    const applyMutation = useApplyToJob(jobId, {
        onSuccess: () => {
            dispatch({
                type: API_REQUEST_SUCCESS,
                payload: { message: "Candidature envoyée avec succès !" },
            });
            router.push(`/jobs/${jobId}`);
        },
    });

    // 4️⃣ Drag & Drop logic
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.includes("pdf")) {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { message: "Le CV doit être un fichier PDF." },
            });
            return;
        }

        setCvFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // 5️⃣ Upload file with progress bar
    async function uploadCV(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);

        return new Promise(async (resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/api/upload/cv");

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.url);
                } else {
                    reject("Erreur upload CV");
                }
            };

            xhr.onerror = () => reject("Erreur upload CV");

            xhr.send(formData);
        });
    }

    // 6️⃣ Submit
    const onSubmit = async (data: any) => {
        if (!cvFile) {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { message: "Veuillez ajouter un CV." },
            });
            return;
        }

        let cvUrl = "";

        try {
            cvUrl = await uploadCV(cvFile);
        } catch (e) {
            dispatch({
                type: API_REQUEST_FAILED,
                payload: { message: "Upload du CV échoué." },
            });
            return;
        }

        applyMutation.mutate({
            coverLetter: data.coverLetter ?? "",
            cvUrl,
        });
    };

    if (isLoading) return <p>Chargement...</p>;

    return (
        <Card className="p-6 space-y-6">

            {/* Cover Letter */}
            <div>
                <label className="block mb-1 font-medium">Lettre de motivation</label>
                <textarea
                    {...register("coverLetter")}
                    rows={5}
                    className="textarea textarea-bordered w-full"
                />
            </div>

            {/* Drag & Drop Upload */}
            <div
                className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:border-primary"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <p className="text-sm text-muted-foreground">
                    Déposez votre CV ici (PDF), ou cliquez pour sélectionner un fichier
                </p>

                <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="cvInput"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] as File)}
                />

                <label htmlFor="cvInput" className="cursor-pointer block mt-2">
                    <Button variant="outline">Choisir un fichier</Button>
                </label>
            </div>

            {/* Progress bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                        className="bg-primary h-2 rounded"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

            {/* PDF Preview */}
            {previewUrl && (
                <iframe
                    src={previewUrl}
                    className="w-full h-64 border rounded"
                ></iframe>
            )}

            {/* Submit */}
            <Button
                className="w-full"
                disabled={applyMutation.isPending}
                onClick={handleSubmit(onSubmit)}
            >
                {applyMutation.isPending ? "Envoi..." : "Envoyer la candidature"}
            </Button>
        </Card>
    );
}
