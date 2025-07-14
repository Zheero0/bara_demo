import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currentUser } from "@/lib/data"

export default function SettingsPage() {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                Make changes to your public profile. This will be displayed to
                other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={currentUser.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" defaultValue={currentUser.headline} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue={currentUser.location} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="about">About</Label>
                <Textarea id="about" defaultValue={currentUser.about} rows={5} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alice@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-confirm">Confirm New Password</Label>
                <Input id="password-confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="new-messages" className="flex flex-col space-y-1">
                    <span>New Messages</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive a notification when you get a new message.
                    </span>
                  </Label>
                  <Switch id="new-messages" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="job-alerts" className="flex flex-col space-y-1">
                    <span>Job Alerts</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Get notified about new jobs that match your profile.
                    </span>
                  </Label>
                  <Switch id="job-alerts" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="connection-requests" className="flex flex-col space-y-1">
                    <span>Connection Requests</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Be notified when someone wants to connect with you.
                    </span>
                  </Label>
                  <Switch id="connection-requests" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                    <span>Dark Mode</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Enable dark mode for a different visual experience.
                    </span>
                  </Label>
                  <Switch id="dark-mode" />
                </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
