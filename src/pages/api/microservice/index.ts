import {PrismaClient, Prisma} from '@prisma/client'

// requires API_KEY to be set
const API_KEY = process.env.API_KEY
const AUTHORIZATION_HEADER = process.env.AUTHORIZATION_HEADER

// requires DATABASE_URL to be set 
const prisma = new PrismaClient();

/**
 * Fetch jobs from findwork.dev API
 */
const fetchJobs = async function () {

    // used as offset
    let pageCounter = 1;
    let invalidPage = false;
    let numberJobsFetched = 0;

    while (!invalidPage) {

        const start = new Date().getTime();

        const resp = await fetch(`https://findwork.dev/api/jobs/\?page=${pageCounter}`, {
            headers: {"Authorization": `Token ${API_KEY}`}
        })
        const data: any = await resp.json();

        // check if we reached the last page
        if (data.detail && data.detail === "Invalid page.") {
            invalidPage = true;
            return;
        }
        pageCounter++;
        numberJobsFetched += data.results.length;
        data.results.map(async (job: JobWithKeywords) => {
            await writeJobToDb(job);
        });

        // make sure to not exceed the rate limit
        const end = new Date().getTime();
        const time = end - start;
        if (time < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - time));
        }
    }
    console.log("Number of jobs fetched: ", numberJobsFetched);
}

/**
 * Write job to database with id as primary key
 * @param job to write into the database
 */
const writeJobToDb = async function (job: JobWithKeywords) {
    const skills = job.keywords;
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete job.keywords;
        await prisma.job.create({data: job});
        console.log("Job with id " + job.id + " written to database.");
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                // console.log(
                //     'Job with given ID already exists in database',
                // )
            }
        }
    }
    // create all the skill entries for the job
    for (const skill of skills) {
        try {
            await prisma.skill.create({data: {name: skill}});
        } catch (e) {}
    }
    // create all the job_skill entries for the job
    for (const skill of skills) {
        try {
            await prisma.jobSkill.create({data: {job_id: job.id, skill_name: skill}});
        } catch (e) {}
    }
}

export default async function handler(req: any, res: any) {

    // check if request is authorized
    if (!req.headers.authorization || req.headers.authorization !== AUTHORIZATION_HEADER) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }
    await fetchJobs();
    res.status(200).json({message: "success"});
}