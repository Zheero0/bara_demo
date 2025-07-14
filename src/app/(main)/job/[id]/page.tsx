
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Job } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

function JobDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      if (id) {
        try {
          const jobDocRef = doc(db, 'jobs', id);
          const jobDocSnap = await getDoc(jobDocRef);
          if (jobDocSnap.exists()) {
            setJob({ id: jobDocSnap.id, ...jobDocSnap.data() } as Job);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error("Error fetching job:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    
    try {
        const conversationsRef = collection(db, 'conversations');
        // Check if a conversation already exists for this job and these two users
        const q = query(conversationsRef, 
            where('jobId', '==', job.id),
            where('participantIds', 'array-contains', user.uid)
        );

        const querySnapshot = await getDocs(q);
        let conversationId: string | null = null;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.participantIds.includes(job.postedBy.uid)) {
                conversationId = doc.id;
            }
        });

        // If no conversation exists, create a new one
        if (!conversationId) {
            const newConversationRef = doc(conversationsRef);
            await setDoc(newConversationRef, {
                jobId: job.id,
                participantIds: [user.uid, job.postedBy.uid],
                createdAt: serverTimestamp(),
            });
            conversationId = newConversationRef.id;
            
            // Add an initial message to the conversation
            const messagesRef = collection(db, `conversations/${conversationId}/messages`);
            await addDoc(messagesRef, {
                senderId: user.uid,
                text: `Hi, I'm interested in applying for the "${job.title}" position.`,
                timestamp: serverTimestamp(),
            });

             // Update last message on conversation
            await setDoc(doc(db, 'conversations', conversationId), {
                lastMessage: {
                    text: `Hi, I'm interested in applying for the "${job.title}" position.`,
                    timestamp: serverTimestamp()
                }
            }, { merge: true });
        }
        
        // Navigate to the conversation
        router.push(`/messages/${conversationId}`);

    } catch (error) {
        console.error("Error applying for job: ", error);
        toast({ title: "Error", description: "Could not start conversation. Please try again.", variant: "destructive" });
    } finally {
        setApplying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <JobDetailSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Job not found</p>
        <Button asChild variant="link">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  const isJobPoster = user?.uid === job.postedBy.uid;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-headline">{job.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                    <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={24} height={24} className="rounded-full" data-ai-hint="logo" />
                    <span>Posted by {job.postedBy.name}</span>
                </div>
              </CardDescription>
            </div>
             <Badge variant="secondary" className="text-base px-4 py-2">{job.category}</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <h3 className="font-semibold text-xl font-headline">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
             <div className="space-y-6">
                <h3 className="font-semibold text-xl font-headline">Job Details</h3>
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                     <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-3 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-semibold">${job.price.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-3 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-semibold">{job.category}</p>
                        </div>
                    </div>
                     {job.createdAt && (
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-3 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Date Posted</p>
                                <p className="font-semibold">{format(job.createdAt.toDate(), 'PPP')}</p>
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </CardContent>
        <CardFooter>
          {!isJobPoster && (
            <Button onClick={handleApply} size="lg" disabled={applying}>
              {applying ? 'Starting conversation...' : 'Apply for this Job'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
