
// A simple script to seed the database with some initial data.
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { mockJobs } from '../lib/data';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function seedAuth() {
    console.log('Seeding auth with test user...');
    try {
        await createUserWithEmailAndPassword(auth, 'test@example.com', 'password');
        console.log('Test user created: test@example.com / password');
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Test user already exists.');
        } else {
            console.error('Error creating test user:', error);
        }
    }
}

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
        await seedAuth();
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
