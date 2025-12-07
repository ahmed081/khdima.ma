import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
    console.log("🌱 Seeding database...")

    // ---------------------------
    // SKILL CONTEXTS
    // ---------------------------
    const itContext = await prisma.skillContext.create({
        data: {
            name: "Informatique",
            skills: {
                create: [
                    { name: "React" },
                    { name: "Node.js" },
                    { name: "TypeScript" },
                    { name: "Docker" },
                    { name: "PostgreSQL" },
                ],
            },
        },
        include: { skills: true },
    })

    const marketingContext = await prisma.skillContext.create({
        data: {
            name: "Marketing",
            skills: {
                create: [
                    { name: "SEO" },
                    { name: "Content Writing" },
                    { name: "Analytics" },
                ],
            },
        },
        include: { skills: true },
    })

    // ---------------------------
    // USERS (Job Seekers + Employers)
    // ---------------------------
    const passwordHash = await bcrypt.hash("password123", 10)

    const employer1 = await prisma.user.create({
        data: {
            name: "Entreprise Atlas",
            email: "employer1@khidma.ma",
            password: passwordHash,
            role: "EMPLOYER",
            companyName: "Entreprise Atlas",
            city: "Casablanca",
        },
    })

    const employer2 = await prisma.user.create({
        data: {
            name: "SoftTech Solutions",
            email: "employer2@khidma.ma",
            password: passwordHash,
            role: "EMPLOYER",
            companyName: "SoftTech Solutions",
            city: "Rabat",
        },
    })

    const jobSeeker1 = await prisma.user.create({
        data: {
            name: "Ahmed Benali",
            email: "user1@khidma.ma",
            password: passwordHash,
            role: "JOB_SEEKER",
            city: "Casablanca",
            skills: {
                connect: [
                    { id: itContext.skills[0].id }, // React
                    { id: itContext.skills[1].id }, // Node.js
                ],
            },
        },
    })

    const jobSeeker2 = await prisma.user.create({
        data: {
            name: "Sara El Arabi",
            email: "user2@khidma.ma",
            password: passwordHash,
            role: "JOB_SEEKER",
            city: "Marrakech",
            skills: {
                connect: [
                    { id: marketingContext.skills[0].id }, // SEO
                ],
            },
        },
    })

    // ---------------------------
    // JOBS
    // ---------------------------
    const job1 = await prisma.job.create({
        data: {
            title: "Développeur Full-Stack",
            description: "Nous recherchons un développeur passionné...",
            domain: "Informatique",
            location: "Casablanca",
            salary: "8000 - 12000 MAD",
            type: "FULL_TIME",
            mode: "HYBRID",
            experienceLevel: "Mid",
            responsibilities: ["Développer des APIs", "Maintenir le code"],
            requirements: ["3 ans d'expérience", "Maîtrise de React"],
            benefits: ["Assurance maladie", "Télétravail possible"],
            employerId: employer1.id,
            skills: {
                connect: [
                    { id: itContext.skills[0].id }, // React
                    { id: itContext.skills[1].id }, // Node.js
                ],
            },
        },
    })

    const job2 = await prisma.job.create({
        data: {
            title: "Spécialiste Marketing Digital",
            description: "Poste en marketing digital...",
            domain: "Marketing",
            location: "Rabat",
            salary: "6000 - 9000 MAD",
            type: "FULL_TIME",
            mode: "ONSITE",
            experienceLevel: "Junior",
            employerId: employer2.id,
            skills: {
                connect: [
                    { id: marketingContext.skills[0].id }, // SEO
                    { id: marketingContext.skills[2].id }, // Analytics
                ],
            },
        },
    })

    // ---------------------------
    // APPLICATIONS
    // ---------------------------
    await prisma.application.create({
        data: {
            userId: jobSeeker1.id,
            jobId: job1.id,
            coverLetter: "J'aimerais rejoindre votre équipe...",
            cvUrl: "/uploads/cv_ahmed.pdf",
        },
    })

    await prisma.application.create({
        data: {
            userId: jobSeeker2.id,
            jobId: job2.id,
            coverLetter: "Passionnée par le marketing digital...",
            cvUrl: "/uploads/cv_sara.pdf",
        },
    })

    console.log("✅ Seed completed successfully!")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
