"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Job, type User as ProfileData } from "@/lib/data";
import {
  Mail,
  MapPin,
  UserPlus,
  MoreHorizontal,
  ShieldX,
  Flag,
  Edit,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="relative h-32 md:h-48 bg-muted rounded-t-lg">
          <Skeleton className="absolute inset-0" />
          <Skeleton className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-background" />
        </CardHeader>
        <CardContent className="mt-16">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/2 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === profileId;

  useEffect(() => {
    if (!profileId) return;

    setProfileLoading(true);
    const profileDocRef = doc(db, "users", profileId);

    const unsubscribeProfile = onSnapshot(
      profileDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<ProfileData, "id">;
          setProfile({ id: docSnap.id, ...data });

          setJobsLoading(true);
          const jobsQuery = query(
            collection(db, "jobs"),
            where("postedBy.uid", "==", docSnap.id)
          );
          const unsubscribeJobs = onSnapshot(
            jobsQuery,
            (snapshot) => {
              const jobsData: Job[] = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Job)
              );
              setUserJobs(jobsData);
              setJobsLoading(false);
            },
            (error) => {
              console.error("Error fetching user jobs: ", error);
              setJobsLoading(false);
            }
          );
          // This nested unsubscribe isn't ideal but works for this structure.
          // Be mindful of cleanup if dependencies change.
        } else {
          console.log("No such profile!");
          setProfile(null);
          router.push("/jobs");
        }
        setProfileLoading(false);
      },
      (error) => {
        console.error("Error fetching profile:", error);
        setProfileLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [profileId, router]);

  if (profileLoading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="relative h-32 md:h-48 bg-muted rounded-t-lg">
          <div
            data-ai-hint="banner background"
            className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100"
          />
          <Avatar className="absolute -bottom-12 left-6 w-24 h-24 border-4 border-background">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-2xl font-headline font-bold">
                {profile.name}
              </h1>
              <p className="text-muted-foreground">{profile.headline}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />{" "}
                  {profile.location || "No location specified"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/settings">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                  </Button>
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" /> Message
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Flag className="mr-2 h-4 w-4" />
                        Report User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <ShieldX className="mr-2 h-4 w-4" />
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
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
              <CardTitle className="font-headline">
                About {profile.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profile.about ||
                  "This user hasn't written an about section yet."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Active Jobs</CardTitle>
              <CardDescription>Jobs posted by {profile.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))
              ) : userJobs.length > 0 ? (
                userJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <CardTitle className="font-headline text-lg mb-1 truncate">
                            {job.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {job.category}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </CardContent>
                    <Separator className="my-4" />
                    <CardFooter className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        £{job.price.toLocaleString()}
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/jobs?jobId=${job.id}`}>View Job</Link>
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
              <CardDescription>
                What others are saying about {profile.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
              <p>No reviews yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
