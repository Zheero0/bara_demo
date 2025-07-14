
// A simple script to seed the database with some initial data.
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockJobs } from '../lib/data';

// This is a placeholder UID. In a real scenario, you would seed jobs
// associated with actual user UIDs from your Firebase Auth.
// To make this work, create a user in your Firebase console and paste their UID here.
const PLACEHOLDER_USER_ID = "REPLACE_WITH_A_REAL_USER_ID";
const PLACEHOLDER_USER_NAME = "Seed User";
const PLACEHOLDER_USER_AVATAR = "https://placehold.co/40x40.png";


async function seedJobs() {
    if (PLACEHOLDER_USER_ID === "REPLACE_WITH_A_REAL_USER_ID") {
        console.error("Please replace the placeholder UID in `src/scripts/seed-db.ts` with a real user's UID from your Firebase Authentication console.");
        return;
    }

    console.log('Seeding jobs collection...');
    const jobsCollection = collection(db, 'jobs');

    const promises = mockJobs.map(job => {
        return addDoc(jobsCollection, {
            ...job,
            postedBy: {
                uid: PLACEHOLDER_USER_ID,
                name: PLACEHOLDER_USER_NAME,
                avatar: PLACEHOLDER_USER_AVATAR
            },
            createdAt: serverTimestamp()
        });
    });

    await Promise.all(promises);
    console.log(`${mockJobs.length} jobs have been added.`);
}

async function main() {
    try {
        console.log('Seeding database...');
        await seedJobs();
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // The script will hang without this, so we need to exit.
        process.exit(0);
    }
}

main();
