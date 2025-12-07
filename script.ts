import { prisma } from './lib/prisma'
import bcrypt from "bcryptjs"
import {PrismaClient} from "@/generated/prisma/client";



const SALT_ROUNDS = 10;

/** Utility: sleep */
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Transaction wrapper with automatic retry on timeout.
 */
async function transactional<T>(fn: (tx: PrismaClient) => Promise<T>, retry = 3): Promise<T> {
    try {
        return await prisma.$transaction(async (tx) => fn(tx), {
            timeout: 60000, // 15 seconds
            maxWait: 5000,
        });
    } catch (err: any) {
        if (
            retry > 0 &&
            err?.message?.includes("transaction") &&
            err?.message?.includes("timeout")
        ) {
            console.warn("⏳ Transaction timeout — retrying in 1 sec...");
            await wait(1000);
            return transactional(fn, retry - 1);
        }
        throw err;
    }
}

async function main() {
    console.log("🌱 Starting seed...");

    await transactional(async (tx) => {
        // ==========================
        // 1️⃣ COUNTRIES & CITIES
        // ==========================
        const morocco = await tx.country.upsert({
            where: { name: "Morocco" },
            update: {},
            create: { name: "Morocco" },
        });

        const cities = [
            "Casablanca",
            "Rabat",
            "Marrakech",
            "Tanger",
            "Fès",
            "Agadir",
            "Meknès",
            "Oujda",
            "Tétouan",
            "Kénitra",
        ];

        for (const city of cities) {
            await tx.city.create({
                data: {
                    name: city,
                    countryId: morocco.id,
                },
            });
        }

        const allCities = await tx.city.findMany();

        // ==========================
        // 2️⃣ JOB CATEGORIES
        // ==========================
        const jobCategories = [
            "Technologie & IT",
            "Marketing & Communication",
            "Finance & Comptabilité",
            "Ressources Humaines",
            "Vente & Commerce",
            "Ingénierie",
            "Éducation",
        ];

        for (const name of jobCategories) {
            await tx.jobCategory.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const categories = await tx.jobCategory.findMany();

        // ==========================
        // 3️⃣ EXPERIENCE LEVELS
        // ==========================
        const experienceLevels = [
            "Débutant (0-1 an)",
            "Junior (1-3 ans)",
            "Intermédiaire (3-5 ans)",
            "Senior (5+ ans)",
        ];

        for (const name of experienceLevels) {
            await tx.experienceLevel.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const expLevels = await tx.experienceLevel.findMany();

        // ==========================
        // 4️⃣ CONTRACT TYPES
        // ==========================
        const contractTypes = ["CDI", "CDD", "Stage", "Freelance", "Temps partiel"];

        for (const name of contractTypes) {
            await tx.contractType.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const contracts = await tx.contractType.findMany();

        // ==========================
        // 5️⃣ SKILL CONTEXTS + SKILLS
        // ==========================
        const skillData = [
            {
                context: "Technologie",
                skills: ["React", "Node.js", "TypeScript", "Docker", "SQL", "Kubernetes"],
            },
            {
                context: "Finance",
                skills: ["Comptabilité", "Audit", "Excel", "SAP"],
            },
            {
                context: "Marketing",
                skills: ["SEO", "Content Writing", "Google Ads", "Brand Management"],
            },
        ];

        for (const group of skillData) {
            const ctx = await tx.skillContext.upsert({
                where: { name: group.context },
                update: {},
                create: { name: group.context },
            });

            for (const skill of group.skills) {
                await tx.skill.upsert({
                    where: { name: skill },
                    update: {},
                    create: {
                        name: skill,
                        contextId: ctx.id,
                    },
                });
            }
        }

        const allSkills = await tx.skill.findMany();

        // ==========================
        // 6️⃣ USERS (with bcrypt)
        // ==========================
        const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

        const employer = await tx.user.upsert({
            where: { email: "employer@khidma.ma" },
            update: {},
            create: {
                name: "TechCorp",
                email: "employer@khidma.ma",
                password: hashedPassword,
                role: "EMPLOYER",
                countryId: morocco.id,
                cityId: allCities[0].id,
                companyName: "TechCorp Solutions",
                companyWebsite: "https://techcorp.ma",
            },
        });

        const jobSeeker = await tx.user.upsert({
            where: { email: "user@khidma.ma" },
            update: {},
            create: {
                name: "Ahmed Benali",
                email: "user@khidma.ma",
                password: hashedPassword,
                role: "JOB_SEEKER",
                countryId: morocco.id,
                cityId: allCities[1].id,
            },
        });

        // Assign skills to job seeker
        for (const s of allSkills.slice(0, 3)) {
            await tx.userSkill.create({
                data: {
                    userId: jobSeeker.id,
                    skillId: s.id,
                },
            });
        }

        // ==========================
        // 7️⃣ JOBS + SKILLS + APPLICATION
        // ==========================
        const job1 = await tx.job.create({
            data: {
                title: "Développeur Full Stack",
                description: "<p>Nous recherchons un développeur passionné...</p>",
                domain: "IT",
                employerId: employer.id,
                countryId: morocco.id,
                cityId: allCities[0].id,
                categoryId: categories[0].id,
                experienceLevelId: expLevels[1].id,
                contractTypeId: contracts[0].id,
                salary: "12,000 - 18,000 MAD",
                requirements: ["React", "Node.js", "MongoDB"],
                responsibilities: ["Développer", "Collaborer", "Maintenir"],
            },
        });

        // Add skills to job
        for (const s of allSkills.slice(0, 3)) {
            await tx.jobSkill.create({
                data: {
                    jobId: job1.id,
                    skillId: s.id,
                },
            });
        }

        // Create application
        await tx.application.create({
            data: {
                jobId: job1.id,
                userId: jobSeeker.id,
                coverLetter: "Motivé pour rejoindre votre équipe.",
            },
        });
    });

    console.log("🌱 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
