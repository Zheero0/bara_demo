
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser, type Job } from "@/lib/data";
import { Mail, MapPin, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";


export default function ProfilePage() {
  const { user } = useAuth();
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // For display purposes, we'll still use the mock currentUser for the profile header
  // In a real app, you'd fetch this based on the authenticated user's ID
  const displayUser = currentUser; 
  
  useEffect(() => {
    if (user?.displayName) {
        setLoading(true);
        const jobsQuery = query(collection(db, "jobs"), where("postedBy.name", "==", user.displayName));
        const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
            const jobsData: Job[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
            setUserJobs(jobsData);
            setLoading(false);
        });
        return () => unsubscribe();
    } else {
      // If no user is logged in, or they don't have a displayName, don't fetch jobs
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="relative h-32 md:h-48 bg-muted rounded-t-lg">
          <div data-ai-hint="banner background" className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100" />
          <Avatar className="absolute -bottom-12 left-6 w-24 h-24 border-4 border-background">
            <AvatarImage src={displayUser.avatar} />
            <AvatarFallback>{displayUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-2xl font-headline font-bold">{displayUser.name}</h1>
              <p className="text-muted-foreground">{displayUser.headline}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {displayUser.location}</span>
                <span>{displayUser.connections} connections</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button><UserPlus className="mr-2 h-4 w-4" /> Connect</Button>
              <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Message</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="about">
        <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">About {displayUser.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{displayUser.about}</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="jobs">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Active Jobs</CardTitle>
                    <CardDescription>Jobs posted by {user?.displayName || 'this user'}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
                    ) : userJobs.length > 0 ? (
                        userJobs.map((job) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="font-headline text-lg mb-1">{job.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={20} height={20} className="rounded-full" data-ai-hint="logo" />
                                                {job.postedBy.name}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{job.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {job.description}
                                    </p>
                                </CardContent>
                                <Separator className="my-4" />
                                <CardFooter className="flex justify-between items-center">
                                    <div className="text-lg font-bold text-primary">${job.price.toLocaleString()}</div>
                                    <Button asChild variant="outline">
                                        <Link href="#">View Job</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                         <div className="text-center text-muted-foreground py-12">
                            <p>No active jobs posted.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="reviews">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Reviews</CardTitle>
                    <CardDescription>What others are saying about {displayUser.name}.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                    <p>No reviews yet.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
