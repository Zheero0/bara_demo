export type User = {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  location: string;
  connections: number;
  about: string;
};

export type Job = {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  postedBy: Pick<User, "name" | "avatar">;
};

export type Connection = {
  id: string;
  user: User;
  status: 'pending' | 'connected';
};

export type Message = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
};

export type Conversation = {
    id: string;
    user: User;
    lastMessage: string;
    lastMessageTimestamp: string;
    messages: Message[];
}

export const users: User[] = [
  { id: '1', name: 'Alice Johnson', avatar: '/avatars/01.png', headline: 'Full-Stack Developer | React & Node.js', location: 'San Francisco, CA', connections: 152, about: 'Passionate developer with 5+ years of experience building web applications.' },
  { id: '2', name: 'Bob Williams', avatar: '/avatars/02.png', headline: 'UI/UX Designer | Figma & Sketch', location: 'New York, NY', connections: 89, about: 'Creating intuitive and beautiful user experiences is my passion.' },
  { id: '3', name: 'Charlie Brown', avatar: '/avatars/03.png', headline: 'Project Manager | Agile & Scrum Master', location: 'Chicago, IL', connections: 230, about: 'Experienced PM focused on delivering high-quality projects on time.' },
  { id: '4', name: 'Diana Prince', avatar: '/avatars/04.png', headline: 'Mobile Developer | iOS & Swift', location: 'Austin, TX', connections: 110, about: 'Building performant and user-friendly mobile applications.' },
  { id: '5', name: 'Ethan Hunt', avatar: '/avatars/05.png', headline: 'DevOps Engineer | AWS & Kubernetes', location: 'Seattle, WA', connections: 180, about: 'Automating infrastructure and scaling systems for growth.' },
];

export const jobs: Job[] = [
  { id: 'job-1', title: 'E-commerce Website Redesign', category: 'Web Development', price: 5000, description: 'We are looking for an experienced developer to redesign our Shopify store. Must have a strong portfolio.', postedBy: { name: 'Fashion Co.', avatar: '/avatars/company-1.png' } },
  { id: 'job-2', title: 'Mobile App UI/UX Design', category: 'Design', price: 3500, description: 'Design a new mobile application for a fitness startup. Experience with Figma is required.', postedBy: { name: 'FitLife App', avatar: '/avatars/company-2.png' } },
  { id: 'job-3', title: 'Cloud Infrastructure Setup', category: 'DevOps', price: 7000, description: 'Setup a scalable and secure cloud infrastructure on AWS for our growing SaaS platform.', postedBy: { name: 'SaaS Inc.', avatar: '/avatars/company-3.png' } },
  { id: 'job-4', title: 'Content Writer for Tech Blog', category: 'Writing', price: 1500, description: 'Write 4 high-quality blog posts per month about software development trends.', postedBy: { name: 'Tech Weekly', avatar: '/avatars/company-4.png' } },
  { id: 'job-5', title: 'React Native Developer for MVP', category: 'Mobile Development', price: 6000, description: 'Develop a cross-platform MVP for a new social networking app.', postedBy: { name: 'ConnectApp', avatar: '/avatars/company-5.png' } },
  { id: 'job-6', title: 'Data Visualization Dashboard', category: 'Data Science', price: 4500, description: 'Create an interactive data dashboard using D3.js or a similar library to visualize sales data.', postedBy: { name: 'Analytics Corp', avatar: '/avatars/company-1.png' } },
];

export const connections: Connection[] = [
  { id: 'conn-1', user: users[1], status: 'connected' },
  { id: 'conn-2', user: users[2], status: 'connected' },
  { id: 'conn-3', user: users[3], status: 'pending' },
  { id: 'conn-4', user: users[4], status: 'pending' },
];

export const conversations: Conversation[] = [
    {
        id: 'convo-1',
        user: users[1],
        lastMessage: 'Sure, I can have the prototype ready by Friday.',
        lastMessageTimestamp: '2h ago',
        messages: [
            { id: 'msg-1-1', sender: 'them', text: 'Hey, how is the design coming along?', timestamp: '3h ago' },
            { id: 'msg-1-2', sender: 'me', text: 'Going great! Just finalizing the color palette. I should have a prototype for you to review by EOD Friday.', timestamp: '2h ago' },
            { id: 'msg-1-3', sender: 'them', text: 'Sure, I can have the prototype ready by Friday.', timestamp: '2h ago' }
        ]
    },
    {
        id: 'convo-2',
        user: users[2],
        lastMessage: 'Perfect, thank you!',
        lastMessageTimestamp: '1d ago',
        messages: [
             { id: 'msg-2-1', sender: 'me', text: 'Just sent over the contract.', timestamp: '1d ago' },
             { id: 'msg-2-2', sender: 'them', text: 'Perfect, thank you!', timestamp: '1d ago' },
        ]
    },
    {
        id: 'convo-3',
        user: users[3],
        lastMessage: 'Let\'s schedule a call for tomorrow morning.',
        lastMessageTimestamp: '3d ago',
        messages: [
            { id: 'msg-3-1', sender: 'them', text: 'Let\'s schedule a call for tomorrow morning.', timestamp: '3d ago' }
        ]
    }
]

export const currentUser: User = users[0];
