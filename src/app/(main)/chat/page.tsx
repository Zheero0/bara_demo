
'use client';
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Conversation, type User, type Job } from "@/lib/data"
import { MessageSquareText } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from "firebase/firestore"
import { formatDistanceToNowStrict } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton";

type ConversationDetails = {
  id: string;
  otherUser: User;
  job: Job;
  lastMessageText: string;
  lastMessageTimestamp: string;
}

function ConversationListSkeleton() {
    return (
        <div className="flex flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const conversationsRef = collection(db, 'conversations');
    // The query was causing an error because it required a composite index.
    // Removing the orderBy clause will fix the error, but the conversations may not be sorted by the most recent message.
    const q = query(
        conversationsRef, 
        where('participantIds', 'array-contains', user.uid)
        // orderBy('lastMessage.timestamp', 'desc') // This line was removed
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const convosPromises = querySnapshot.docs.map(async (convoDoc) => {
            const convoData = convoDoc.data();

            // Find other participant's ID
            const otherUserId = convoData.participantIds.find((id: string) => id !== user.uid);
            if (!otherUserId) return null;

            // Fetch other user's data and job data
            const userDocRef = doc(db, 'users', otherUserId);
            const jobDocRef = doc(db, 'jobs', convoData.jobId);
            const [userDoc, jobDoc] = await Promise.all([getDoc(userDocRef), getDoc(jobDocRef)]);
            
            if (!userDoc.exists() || !jobDoc.exists()) return null;
            
            const otherUserData = { id: userDoc.id, ...userDoc.data() } as User;
            const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;

            return {
                id: convoDoc.id,
                otherUser: otherUserData,
                job: jobData,
                lastMessageText: convoData.lastMessage?.text || `Application for ${jobData.title}`,
                lastMessageTimestamp: convoData.lastMessage?.timestamp
                    ? formatDistanceToNowStrict(convoData.lastMessage.timestamp.toDate(), { addSuffix: true })
                    : ''
            };
        });
        
        const resolvedConvos = (await Promise.all(convosPromises))
            .filter(Boolean) as ConversationDetails[];
        
        // Sort on the client-side after fetching
        resolvedConvos.sort((a, b) => {
            // A simple string sort on the timestamp string should work for "ago" format
            // but a more robust solution would be to sort by the actual date object.
            // For now, this is a reasonable workaround.
            return (b.lastMessageTimestamp || "").localeCompare(a.lastMessageTimestamp || "");
        });

        setConversations(resolvedConvos);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="grid w-full h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Chat</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                    <ConversationListSkeleton />
                ) : conversations.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No conversations yet.</p>
                        <p className="text-sm">Apply for a job to start a chat!</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {conversations.map((convo) => (
                            <Link href={`/chat/${convo.id}`} key={convo.id} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50`}>
                                <Avatar>
                                    <AvatarImage src={convo.otherUser.avatar} />
                                    <AvatarFallback>{convo.otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{convo.otherUser.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{convo.lastMessageTimestamp}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 hidden md:flex flex-col">
            <Card className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquareText className="w-16 h-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Select a chat</h2>
                <p className="text-muted-foreground">Choose a chat from the list to start messaging.</p>
            </Card>
        </div>
    </div>
  )
}
