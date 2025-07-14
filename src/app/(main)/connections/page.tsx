import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { connections, users } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, MessageSquare, UserPlus, X } from "lucide-react"

export default function ConnectionsPage() {
  const myConnections = connections.filter(c => c.status === 'connected');
  const pendingRequests = connections.filter(c => c.status === 'pending');

  return (
    <>
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-headline font-bold">Connections</h1>
              <p className="text-muted-foreground">Manage your professional network.</p>
          </div>
      </div>
      <Tabs defaultValue="connections">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections">My Connections ({myConnections.length})</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests ({pendingRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Network</CardTitle>
              <CardDescription>
                You are connected with {myConnections.length} professionals.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myConnections.map((conn) => (
                <Card key={conn.id}>
                  <CardHeader className="flex items-center gap-4 flex-row">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conn.user.avatar} alt={conn.user.name} />
                      <AvatarFallback>{conn.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{conn.user.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{conn.user.headline}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">View Profile</Button>
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Connection Requests</CardTitle>
              <CardDescription>
                You have {pendingRequests.length} pending connection requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={conn.user.avatar} alt={conn.user.name} />
                      <AvatarFallback>{conn.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{conn.user.name}</p>
                      <p className="text-sm text-muted-foreground">{conn.user.headline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
