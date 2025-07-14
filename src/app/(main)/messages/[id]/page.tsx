
'use client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { type User, type Message, type Job } from "@/lib/data"
import { SendHorizonal, ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { formatDistanceToNow, format } from 'date-fns';

export default function ConversationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const { id: conversationId } = params;

    const [conversation, setConversation] = useState<any | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!conversationId || !user) return;

        const fetchConversationData = async () => {
            setLoading(true);
            const convoDocRef = doc(db, 'conversations', conversationId);
            const convoDocSnap = await getDoc(convoDocRef);

            if (convoDocSnap.exists()) {
                const convoData = convoDocSnap.data();
                setConversation(convoData);

                // Fetch job details
                const jobDocRef = doc(db, 'jobs', convoData.jobId);
                const jobDocSnap = await getDoc(jobDocRef);
                if (jobDocSnap.exists()) {
                    setJob({ id: jobDocSnap.id, ...jobDocSnap.data() } as Job);
                }

                // Fetch other user's details
                const otherUserId = convoData.participantIds.find((id: string) => id !== user.uid);
                if (otherUserId) {
                    const userDocRef = doc(db, 'users', otherUserId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setOtherUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
                    }
                }
            } else {
                console.log("Conversation not found!");
            }
        };

        fetchConversationData();

        // Subscribe to messages
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [conversationId, user]);
    
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !conversationId) return;

        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        await addDoc(messagesRef, {
            senderId: user.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        });
        
        // Update last message on conversation
        await doc(db, 'conversations', conversationId).set({
            lastMessage: {
                text: newMessage,
                timestamp: serverTimestamp()
            }
        }, { merge: true });

        setNewMessage("");
    };

    if (loading) {
        return (
             <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                     <Button variant="ghost" size="icon" onClick={() => router.push('/messages')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-4 animate-pulse">
                         <div className="w-10 h-10 rounded-full bg-muted"></div>
                        <div>
                             <div className="h-5 w-32 bg-muted rounded"></div>
                             <div className="h-4 w-48 bg-muted rounded mt-1"></div>
                        </div>
                    </div>
                </CardHeader>
                <Separator/>
                 <CardContent className="flex-1 p-6 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading conversation...</p>
                 </CardContent>
            </Card>
        )
    }

    if (!conversation || !otherUser || !job) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg font-semibold">Conversation not found</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/messages">Back to messages</Link>
                </Button>
            </div>
        )
    }


  return (
    <div className="h-full flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/messages')}>
                        <ArrowLeft className="w-5 h-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <Avatar>
                        <AvatarImage src={otherUser.avatar} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{job.title}</p>
                        <p className="text-sm text-muted-foreground">with {otherUser.name}</p>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map(message => {
                        const isMe = message.senderId === user?.uid;
                        return (
                             <div key={message.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && <Avatar className="w-8 h-8"><AvatarImage src={otherUser.avatar} /></Avatar>}
                                <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{message.text}</p>
                                     <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                         {message.timestamp ? format(message.timestamp.toDate(), 'p') : 'sending...'}
                                    </p>
                                </div>
                                {isMe && user && <Avatar className="w-8 h-8"><AvatarImage src={user.photoURL || undefined} /></Avatar>}
                            </div>
                        )
                    })}
                     <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t">
                     <form onSubmit={handleSendMessage} className="relative">
                        <Input 
                            placeholder="Type a message..." 
                            className="pr-12"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <SendHorizonal className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
    </div>
  )
}
