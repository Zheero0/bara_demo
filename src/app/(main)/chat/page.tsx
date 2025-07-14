
'use client';
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Conversation, type User, type Job } from "@/lib/data"
import { MessageSquareText, MoreHorizontal, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, getDoc, doc, orderBy, deleteDoc } from "firebase/firestore"
import { formatDistanceToNowStrict } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
  const { toast } = useToast();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const conversationsRef = collection(db, 'conversations');
    const q = query(
        conversationsRef, 
        where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const convosPromises = querySnapshot.docs.map(async (convoDoc) => {
            const convoData = convoDoc.data();
            const otherUserId = convoData.participantIds.find((id: string) => id !== user.uid);
            if (!otherUserId) return null;
            
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
        
        resolvedConvos.sort((a, b) => {
            return (b.lastMessageTimestamp || "").localeCompare(a.lastMessageTimestamp || "");
        });

        setConversations(resolvedConvos);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteDoc(doc(db, "conversations", conversationToDelete));
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been permanently removed.",
      });
      // Optionally, if the currently viewed chat is deleted, redirect
      // This part of the logic might need to be more complex depending on app structure
      // For now, we just close the dialog.
      setConversationToDelete(null);

    } catch (error) {
      console.error("Error deleting conversation: ", error);
      toast({
        title: "Error",
        description: "Could not delete the conversation.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
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
                           <div key={convo.id} className="group relative flex items-center pr-4 hover:bg-muted/50">
                                <Link href={`/chat/${convo.id}`} className="flex flex-1 items-center gap-3 p-4 min-w-0">
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setConversationToDelete(convo.id)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
     <AlertDialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              entire conversation history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
