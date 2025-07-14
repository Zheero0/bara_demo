
// A simple script to seed the database with some initial data.
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mockJobs } from '../lib/data';

async function seedJobs() {
    console.log('Seeding jobs collection...');
    const jobsCollection = collection(db, 'jobs');

    const promises = mockJobs.map(job => {
        return addDoc(jobsCollection, {
            ...job,
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
        console.log('Database seeded successfully! Please add a user manually in your Firebase console.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // The script will hang without this, so we need to exit.
        process.exit(0);
    }
}

main();
