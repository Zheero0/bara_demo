'use client';
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { conversations } from "@/lib/data"
import { MessageSquareText } from "lucide-react"

export default function MessagesPage() {

  return (
    <div className="grid w-full h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="flex flex-col">
                    {conversations.map((convo) => (
                        <Link href={`/messages/${convo.id}`} key={convo.id} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50`}>
                             <Avatar>
                                <AvatarImage src={convo.user.avatar} />
                                <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{convo.user.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{convo.lastMessageTimestamp}</span>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 hidden md:flex flex-col">
            <Card className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquareText className="w-16 h-16 text-muted-foreground/50" />
                <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a conversation from the list to start chatting.</p>
            </Card>
        </div>
    </div>
  )
}
