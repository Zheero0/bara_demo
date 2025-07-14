import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser, jobs } from "@/lib/data";
import { Mail, MapPin, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const userJobs = jobs.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="relative h-32 md:h-48 bg-muted rounded-t-lg">
          <div data-ai-hint="banner background" className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100" />
          <Avatar className="absolute -bottom-12 left-6 w-24 h-24 border-4 border-background">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-2xl font-headline font-bold">{currentUser.name}</h1>
              <p className="text-muted-foreground">{currentUser.headline}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {currentUser.location}</span>
                <span>{currentUser.connections} connections</span>
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
                    <CardTitle className="font-headline">About {currentUser.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{currentUser.about}</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="jobs">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Active Jobs</CardTitle>
                    <CardDescription>Jobs posted by {currentUser.name}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {userJobs.map(job => (
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
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="reviews">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Reviews</CardTitle>
                    <CardDescription>What others are saying about {currentUser.name}.</CardDescription>
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
