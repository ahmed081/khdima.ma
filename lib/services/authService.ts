import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function registerUserService(form: any) {
    const {
        name, email, phone, role,
        countryId, cityId, contractTypeId,
        password, skills
    } = form

    // Check if email exists
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) throw new Error("Cet email est déjà utilisé.")

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            role: role === "employer" ? "EMPLOYER" : "JOB_SEEKER",
            password: hashed,
            countryId: countryId ? Number(countryId) : null,
            cityId: cityId ? Number(cityId) : null,
            skills: {
                create: skills.map((skillId: number) => ({
                    skillId
                }))
            }
        }
    })

    return user
}

