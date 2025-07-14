
'use client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { conversations, currentUser } from "@/lib/data"
import { SendHorizonal, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ConversationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // This is a temporary way to handle both existing conversations and new applications
    // In a real app, you'd likely create a new conversation in the DB and navigate to its ID
    const isApplication = params.id.startsWith('application-');

    const jobTitle = searchParams.get('jobTitle');
    const posterName = searchParams.get('posterName');
    const posterAvatar = searchParams.get('posterAvatar');

    const conversationDetails = useMemo(() => {
        if (isApplication && jobTitle && posterName) {
            return {
                title: jobTitle,
                subtitle: `with ${posterName}`,
                avatar: posterAvatar || 'https://placehold.co/40x40.png',
                messages: [{ id: 'system-1', sender: 'them', text: `You are applying for the job: "${jobTitle}". Start the conversation!`, timestamp: new Date().toLocaleTimeString() }]
            }
        }
        
        const selectedConversation = conversations.find(c => c.id === params.id);
        if (selectedConversation) {
            return {
                title: selectedConversation.user.name,
                subtitle: selectedConversation.user.headline,
                avatar: selectedConversation.user.avatar,
                messages: selectedConversation.messages
            }
        }
        return null;
    }, [params.id, isApplication, jobTitle, posterName, posterAvatar]);
    

    if (!conversationDetails) {
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
                        <AvatarImage src={conversationDetails.avatar} />
                        <AvatarFallback>{conversationDetails.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{conversationDetails.title}</p>
                        <p className="text-sm text-muted-foreground">{conversationDetails.subtitle}</p>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {conversationDetails.messages.map(message => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                             {message.sender !== 'me' && <Avatar className="w-8 h-8"><AvatarImage src={conversationDetails.avatar} /></Avatar>}
                            <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p>{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</p>
                            </div>
                            {message.sender === 'me' && <Avatar className="w-8 h-8"><AvatarImage src={currentUser.avatar} /></Avatar>}
                        </div>
                    ))}
                </CardContent>
                <div className="p-4 border-t">
                    <div className="relative">
                        <Input placeholder="Type a message..." className="pr-12" />
                        <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <SendHorizonal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
    </div>
  )
}
