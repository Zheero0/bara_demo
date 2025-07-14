
'use client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type User, type Message } from "@/lib/data"
import { SendHorizonal, ArrowLeft, MoreHorizontal, Trash2, Flag } from "lucide-react"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, updateDoc, deleteDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ConversationPage() {
    const router = useRouter();
    const params = useParams();
    const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { user, profile } = useAuth();

    const [conversation, setConversation] = useState<any | null>(null);
    const [otherUser, setOtherUser] = useState<any | null>(null);
    const [job, setJob] = useState<any | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!conversationId || !user) {
            setLoading(false);
            return;
        };

        const convoDocRef = doc(db, 'conversations', conversationId);

        const unsubscribeConvo = onSnapshot(convoDocRef, async (convoDocSnap) => {
            if (convoDocSnap.exists()) {
                const convoData = convoDocSnap.data();
                setConversation(convoData);

                const otherUserId = convoData.participantIds.find((id: string) => id !== user.uid);
                
                if (otherUserId) {
                    const userDocRef = doc(db, 'users', otherUserId);
                    const jobDocRef = doc(db, 'jobs', convoData.jobId);
                    
                    try {
                        const [userDocSnap, jobDocSnap] = await Promise.all([
                            getDoc(userDocRef),
                            getDoc(jobDocRef)
                        ]);

                        if (userDocSnap.exists()) {
                            setOtherUser({ id: userDocSnap.id, ...userDocSnap.data() });
                        }
                        if (jobDocSnap.exists()) {
                            setJob({ id: jobDocSnap.id, ...jobDocSnap.data() });
                        }

                    } catch (error) {
                        console.error("Error fetching conversation details:", error);
                        toast.error("Error", { description: "Could not load conversation details." });
                    }
                }
            } else {
                console.log("Conversation not found!");
                // Don't show toast if it was deleted intentionally
                // toast({ title: "Not Found", description: "This conversation does not exist.", variant: "destructive" });
                // router.push('/chat');
            }
        });

        // Subscribe to messages
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            if(loading) setLoading(false);
        });

        return () => {
            unsubscribeConvo();
            unsubscribeMessages();
        };

    }, [conversationId, user, router]);
    
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !conversationId) return;

        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const newMessageDoc = await addDoc(messagesRef, {
            senderId: user.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        });
        
        // Update last message on conversation
        const convoDocRef = doc(db, 'conversations', conversationId);
        await updateDoc(convoDocRef, {
            lastMessage: {
                text: newMessage,
                senderId: user.uid,
                timestamp: (await getDoc(newMessageDoc)).data()?.timestamp
            }
        });

        setNewMessage("");
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!conversationId || !messageId) return;
        try {
            // If this is the last message, delete the entire conversation
            if (messages.length === 1 && messages[0].id === messageId) {
                const convoRef = doc(db, 'conversations', conversationId);
                await deleteDoc(convoRef);
                toast.success("Conversation Deleted", { description: "The last message was removed, so the conversation was deleted." });
                router.push('/chat');
                return; // Exit the function
            }

            // Otherwise, just delete the single message
            const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
            await deleteDoc(messageRef);
            toast.success("Message Deleted", { description: "The message has been successfully removed." });

        } catch (error) {
            console.error("Error deleting message: ", error);
            toast.error("Error", { description: "Could not delete the message." });
        }
    };

    const handleReportMessage = (messageId: string) => {
        console.log(`Reporting message ${messageId}`);
        // In a real app, you would write this report to a "reports" collection in Firestore.
        toast.info("Message Reported", {
            description: "Thank you for your feedback. We will review this message.",
        });
    };

    if (loading) {
        return (
             <Card className="flex-1 flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
                     <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-4 animate-pulse w-full">
                         <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-32" />
                             <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </CardHeader>
                 <CardContent className="flex-1 p-6 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading conversation...</p>
                 </CardContent>
            </Card>
        )
    }

    if (!conversation || !otherUser || !job) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <Card className="flex-1 flex flex-col items-center justify-center w-full">
                    <p className="text-lg font-semibold mb-2">Conversation not found</p>
                    <p className="text-muted-foreground mb-4">It might have been deleted or does not exist.</p>
                    <Button asChild variant="outline">
                        <Link href="/chat">Back to Chat</Link>
                    </Button>
                </Card>
            </div>
        )
    }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex shrink-0 flex-row items-center gap-4 p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/chat')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Button>
        <Avatar>
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-base truncate">{job.title}</p>
          <p className="text-sm text-muted-foreground">with {otherUser.name}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((message) => {
          if (!message.id) return null;
          const isMe = message.senderId === user?.uid
          const sender = isMe ? profile : otherUser
          return (
            <div
              key={message.id}
              className={`group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={sender?.avatar} />
                </Avatar>
              )}
               <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div
                    className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`text-xs mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {message.timestamp
                        ? format(message.timestamp.toDate(), 'p')
                        : 'sending...'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {isMe ? (
                         <DropdownMenuItem onClick={() => handleDeleteMessage(message.id!)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                         </DropdownMenuItem>
                      ) : (
                         <DropdownMenuItem onClick={() => handleReportMessage(message.id!)}>
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                         </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
              {isMe && profile && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar} />
                </Avatar>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t bg-background shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            placeholder="Type a message..."
            className="pr-12"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={!newMessage.trim()}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
