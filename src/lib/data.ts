import { type Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  headline: string;
  location: string;
  about: string;
  connections?: number; // Make optional as we're not tracking it yet
};

export type Job = {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  postedBy: {
    uid: string; // Keep track of the poster's user ID
    name: string;
    avatar: string;
  };
  createdAt?: Timestamp;
};

export type Connection = {
  id: string;
  user: User;
  status: 'pending' | 'connected';
};

export type Message = {
  id?: string; // ID will be assigned by Firestore
  senderId: string;
  text: string;
  timestamp: Timestamp;
};

export type Conversation = {
    id: string;
    participantIds: string[];
    jobId: string;
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Timestamp;
    };
    // We'll fetch participant details on the fly
};


export const mockUsers: User[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice Johnson', avatar: 'https://placehold.co/100x100.png', headline: 'Full-Stack Developer | React & Node.js', location: 'San Francisco, CA', connections: 152, about: 'Passionate developer with 5+ years of experience building web applications.' },
  { id: '2', email: 'bob@example.com', name: 'Bob Williams', avatar: 'https://placehold.co/100x100.png', headline: 'UI/UX Designer | Figma & Sketch', location: 'New York, NY', connections: 89, about: 'Creating intuitive and beautiful user experiences is my passion.' },
  { id: '3', email: 'charlie@example.com', name: 'Charlie Brown', avatar: 'https://placehold.co/100x100.png', headline: 'Project Manager | Agile & Scrum Master', location: 'Chicago, IL', connections: 230, about: 'Experienced PM focused on delivering high-quality projects on time.' },
  { id: '4', email: 'diana@example.com', name: 'Diana Prince', avatar: 'https://placehold.co/100x100.png', headline: 'Mobile Developer | iOS & Swift', location: 'Austin, TX', connections: 110, about: 'Building performant and user-friendly mobile applications.' },
  { id: '5', email: 'ethan@example.com', name: 'Ethan Hunt', avatar: 'https://placehold.co/100x100.png', headline: 'DevOps Engineer | AWS & Kubernetes', location: 'Seattle, WA', connections: 180, about: 'Automating infrastructure and scaling systems for growth.' },
];

export const mockJobs: Omit<Job, 'id' | 'postedBy'>[] = [
  { title: 'E-commerce Website Redesign', category: 'Web Development', price: 5000, description: 'We are looking for an experienced developer to redesign our Shopify store. Must have a strong portfolio.' },
  { title: 'Mobile App UI/UX Design', category: 'Design', price: 3500, description: 'Design a new mobile application for a fitness startup. Experience with Figma is required.' },
  { title: 'Cloud Infrastructure Setup', category: 'DevOps', price: 7000, description: 'Setup a scalable and secure cloud infrastructure on AWS for our growing SaaS platform.' },
  { title: 'Content Writer for Tech Blog', category: 'Writing', price: 1500, description: 'Write 4 high-quality blog posts per month about software development trends.' },
  { title: 'React Native Developer for MVP', category: 'Mobile Development', price: 6000, description: 'Develop a cross-platform MVP for a new social networking app.' },
  { title: 'Data Visualization Dashboard', category: 'Data Science', price: 4500, description: 'Create an interactive data dashboard using D3.js or a similar library to visualize sales data.' },
];

export const connections: Connection[] = [
  { id: 'conn-1', user: mockUsers[1], status: 'connected' },
  { id: 'conn-2', user: mockUsers[2], status: 'connected' },
  { id: 'conn-3', user: mockUsers[3], status: 'pending' },
  { id: 'conn-4', user: mockUsers[4], status: 'pending' },
];


// The concept of a single 'currentUser' is replaced by fetching the logged-in user's profile.
// We keep this here for now to avoid breaking other components that might still use it.
export const currentUser: User = mockUsers[0];
