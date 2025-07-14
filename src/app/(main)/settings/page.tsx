
'use client';
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes"

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  headline: z.string().max(100, { message: "Headline must be 100 characters or less." }).optional(),
  location: z.string().max(50, { message: "Location must be 50 characters or less." }).optional(),
  about: z.string().max(500, { message: "About section must be 500 characters or less." }).optional(),
});


export default function SettingsPage() {
  const { user, profile, loading: authLoading, reloadProfile } = useAuth();
  const [formLoading, setFormLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { // Use values instead of defaultValues to reflect live data
        name: profile?.name || user?.displayName || "",
        headline: profile?.headline || "",
        location: profile?.location || "",
        about: profile?.about || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) {
        toast.error("Error", { description: "You must be logged in to update your profile." });
        return;
    }
    setFormLoading(true);
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            ...values,
            email: user.email // ensure email is always stored
        }, { merge: true });

        if (auth.currentUser && auth.currentUser.displayName !== values.name) {
             await updateFirebaseProfile(auth.currentUser, { displayName: values.name });
        }

        toast.success("Profile Updated", { description: "Your profile has been saved successfully." });
        reloadProfile();
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast.error("Error", { description: "Could not update your profile. Please try again." });
    } finally {
        setFormLoading(false);
    }
  }

  return authLoading ? (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  ) : (
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>
                    Make changes to your public profile. This will be displayed to
                    other users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Full-Stack Developer | React & Node.js" {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                           <Input placeholder="e.g. San Francisco, CA" {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                           <Textarea placeholder="Tell us a little bit about yourself." rows={5} {...field} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={formLoading}>{formLoading ? "Saving..." : "Save"}</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
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
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
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
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
