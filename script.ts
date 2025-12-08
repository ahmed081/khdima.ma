import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";

const SALT_ROUNDS = 10;

// Delay helper
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Retry-safe transactional wrapper
async function transactional<T>(
    fn: (tx: PrismaClient) => Promise<T>,
    retry = 3
): Promise<T> {
    try {
        return await prisma.$transaction(async (tx) => fn(tx), {
            timeout: 90000, // 60s
            maxWait: 5000,
        });
    } catch (err: any) {
        if (retry > 0 && err.message?.includes("timeout")) {
            console.warn("⏳ Transaction timeout — retrying...");
            await wait(1000);
            return transactional(fn, retry - 1);
        }
        throw err;
    }
}

async function main() {
    console.log("🌱 Starting seed...");

    await transactional(async (tx) => {
        // ----------------------------------
        // 1️⃣ Country + Cities
        // ----------------------------------
        const morocco = await tx.country.upsert({
            where: { name: "Morocco" },
            update: {},
            create: { name: "Morocco" },
        });

        const cityNames = [
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

        for (const name of cityNames) {
            await tx.city.upsert({
                where: { name_countryId: { name, countryId: morocco.id } },
                update: {},
                create: { name, countryId: morocco.id },
            });
        }

        const allCities = await tx.city.findMany();

        // ----------------------------------
        // 2️⃣ Job categories
        // ----------------------------------
        const categories = [
            "Technologie & IT",
            "Marketing & Communication",
            "Finance & Comptabilité",
            "Ressources Humaines",
            "Vente & Commerce",
            "Ingénierie",
            "Éducation",
        ];

        for (const name of categories) {
            await tx.jobCategory.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const allCategories = await tx.jobCategory.findMany();

        // ----------------------------------
        // 3️⃣ Experience levels
        // ----------------------------------
        const expLevels = [
            "Débutant (0-1 an)",
            "Junior (1-3 ans)",
            "Intermédiaire (3-5 ans)",
            "Senior (5+ ans)",
        ];

        for (const name of expLevels) {
            await tx.experienceLevel.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const experienceLevels = await tx.experienceLevel.findMany();

        // ----------------------------------
        // 4️⃣ Contract types
        // ----------------------------------
        const contractTypes = ["CDI", "CDD", "Stage", "Freelance", "Temps partiel"];

        for (const name of contractTypes) {
            await tx.contractType.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const allContracts = await tx.contractType.findMany();

        // ----------------------------------
        // 5️⃣ Skills & contexts
        // ----------------------------------
        const skillGroups = [
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

        for (const g of skillGroups) {
            const ctx = await tx.skillContext.upsert({
                where: { name: g.context },
                update: {},
                create: { name: g.context },
            });

            for (const sk of g.skills) {
                await tx.skill.upsert({
                    where: { name: sk },
                    update: {},
                    create: { name: sk, contextId: ctx.id },
                });
            }
        }

        const allSkills = await tx.skill.findMany();

        // ----------------------------------
        // 6️⃣ Users (bcrypt)
        // ----------------------------------
        const hashed = await bcrypt.hash("password123", SALT_ROUNDS);

        const employer = await tx.user.upsert({
            where: { email: "employer@khidma.ma" },
            update: {},
            create: {
                name: "TechCorp",
                email: "employer@khidma.ma",
                password: hashed,
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
                password: hashed,
                role: "JOB_SEEKER",
                countryId: morocco.id,
                cityId: allCities[1].id,
            },
        });

        // Assign skills to job seeker
        for (const s of allSkills.slice(0, 3)) {
            await tx.userSkill.create({
                data: { userId: jobSeeker.id, skillId: s.id },
            });
        }

        // ----------------------------------
        // 7️⃣ Create job (MATCHES SCHEMA)
        // ----------------------------------
        const job = await tx.job.create({
            data: {
                title: "Développeur Full Stack",
                description: "Nous recherchons un développeur passionné...",
                competencies: ["React", "Node.js", "Création d'API"],
                requirements: ["3 ans d'expérience", "Connaissance Docker"],
                benefits: ["Assurance santé", "Télétravail", "Prime annuelle"],
                salary: "12,000 - 18,000 MAD",

                employerId: employer.id,
                countryId: morocco.id,
                cityId: allCities[0].id,
                categoryId: allCategories[0].id,
                experienceLevelId: experienceLevels[1].id,
                contractTypeId: allContracts[0].id,
            },
        });

        // Add skills to job
        for (const sk of allSkills.slice(0, 3)) {
            await tx.jobSkill.create({
                data: { jobId: job.id, skillId: sk.id },
            });
        }

        // Application
        await tx.application.create({
            data: {
                jobId: job.id,
                userId: jobSeeker.id,
                coverLetter: "Je suis très motivé pour ce poste.",
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
