import bcrypt from "bcryptjs";
import {User, UserRole, JobType, JobMode, AppStatus} from "@/generated/prisma/client";
import {prisma} from "@/lib/prisma";


async function main() {
    // ---------------------------------------
    // HELPERS
    // ---------------------------------------
    const hash = (pw: string) => bcrypt.hashSync(pw, 10);

    const randomPick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    // ---------------------------------------
    // Seed Countries & Cities
    // ---------------------------------------
    const morocco = await prisma.country.create({
        data: {
            name: "Morocco",
            cities: {
                create: [
                    { name: "Casablanca" },
                    { name: "Rabat" },
                    { name: "Tanger" },
                    { name: "Marrakech" },
                ],
            },
        },
        include: { cities: true },
    });

    const cities = morocco.cities;

    // ---------------------------------------
    // Seed Users (10 total)
    // 6 Job seekers + 4 employers
    // ---------------------------------------
    const usersData = Array.from({ length: 10 }).map((_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@gmail.com`,
        password: hash("password123"),
        role: i < 4 ? UserRole.EMPLOYER : UserRole.JOB_SEEKER,
        cityId: randomPick(cities).id,
        countryId: morocco.id,
        phone: "0612345678",
        address: "Address " + (i + 1),
        age: 22 + i,
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        bio: "This is a test user.",
        companyName: i < 4 ? `Company ${i + 1}` : null,
        companyWebsite: i < 4 ? `https://company${i + 1}.com` : null,
        companyLogoUrl: i < 4 ? `https://picsum.photos/seed/logo${i}/200` : null,
    }));

    const users = await prisma.user.createManyAndReturn({
        data: usersData,
    });

    const employers = users.filter((u:User) => u.role === UserRole.EMPLOYER);
    const jobSeekers = users.filter((u: User) => u.role === UserRole.JOB_SEEKER);

    // ---------------------------------------
    // Job categories, experience & contract types
    // ---------------------------------------
    const category = await prisma.jobCategory.create({ data: { name: "Software Development" } });
    const expJunior = await prisma.experienceLevel.create({ data: { name: "Junior" } });
    const contractCDI = await prisma.contractType.create({ data: { name: "CDI" } });

    // ---------------------------------------
    // Seed Jobs (30 total)
    // ---------------------------------------
    let jobs: any[] = [];

    for (let i = 1; i <= 30; i++) {
        const employer = randomPick(employers);
        const city = randomPick(cities);

        const job = await prisma.job.create({
            data: {
                title: `Job Offer ${i}`,
                description: "This is a generated job description.",
                competencies: ["Teamwork", "Communication", "Problem Solving"],
                requirements: ["Bachelor degree", "1+ years experience"],
                benefits: ["Paid holidays", "Health insurance"],
                salary: "5000 - 9000 MAD",
                type: randomPick([
                    JobType.FULL_TIME,
                    JobType.PART_TIME,
                    JobType.FREELANCE,
                    JobType.INTERNSHIP,
                ]),
                mode: randomPick([JobMode.ONSITE, JobMode.REMOTE, JobMode.HYBRID]),

                cityId: city.id,
                countryId: morocco.id,
                employerId: employer.id,
                categoryId: category.id,
                experienceLevelId: expJunior.id,
                contractTypeId: contractCDI.id,
                status: "ACTIVE",
                views: Math.floor(Math.random() * 300),
            },
        });

        jobs.push(job);
    }

    // ---------------------------------------
    // Seed Applications
    // each job seeker applies randomly to 2–3 jobs
    // ---------------------------------------
    for (const seeker of jobSeekers) {
        const appliedJobs = Array.from({ length: 3 }).map(() => randomPick(jobs));

        for (const job of appliedJobs) {
            await prisma.application.create({
                data: {
                    userId: seeker.id,
                    jobId: job.id,
                    status: AppStatus.PENDING,
                    coverLetter: "I am very interested in this job.",
                    cvUrl: "https://example.com/cv.pdf",
                },
            });
        }
    }

    console.log("🌱 SEED COMPLETED SUCCESSFULLY");
}

// ---------------------------------------
// RUN SEED
// ---------------------------------------
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("SEED ERROR:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
