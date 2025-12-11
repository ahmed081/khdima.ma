"use server"

import { registerUserService } from "@/lib/services/authService"

export async function registerAction(form: any) {
    try {
        const user = await registerUserService(form)
        return { success: true, user }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
