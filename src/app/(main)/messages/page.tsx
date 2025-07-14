import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { conversations, currentUser } from "@/lib/data"
import { SendHorizonal } from "lucide-react"

export default function MessagesPage() {
    const selectedConversation = conversations[0];
  return (
    <div className="grid w-full min-h-[calc(100vh-8rem)] grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
            <CardHeader>
                <CardTitle className="font-headline">Conversations</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
                <div className="flex flex-col">
                    {conversations.map((convo, index) => (
                        <div key={convo.id} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 ${index === 0 ? 'bg-muted' : ''}`}>
                            <Avatar>
                                <AvatarImage src={convo.user.avatar} />
                                <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{convo.user.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                        <AvatarImage src={selectedConversation.user.avatar} />
                        <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{selectedConversation.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedConversation.user.headline}</p>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {selectedConversation.messages.map(message => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                             {message.sender !== 'me' && <Avatar className="w-8 h-8"><AvatarImage src={selectedConversation.user.avatar} /></Avatar>}
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
    </div>
  )
}
