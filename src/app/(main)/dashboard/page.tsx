
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type Job } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { collection, onSnapshot, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Briefcase, Calendar, DollarSign, BriefcaseBusiness, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  category: z.string().min(1, "Please select a category."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
});

function PostJobDialog({ onJobPosted }: { onJobPosted: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      category: "",
      price: 0,
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof jobSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      await addDoc(jobsCollection, {
        ...values,
        postedBy: {
          uid: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || `https://placehold.co/40x40.png`,
        },
        createdAt: serverTimestamp()
      });
      toast({ title: "Job Posted!", description: "Your job has been successfully posted." });
      form.reset();
      onJobPosted();
    } catch (error) {
      console.error("Error posting job: ", error);
      toast({ title: "Error", description: "There was an error posting your job. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && form.reset()}>
      <DialogTrigger asChild>
        <Button>Post a Job</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Fill out the details below to post a new job opportunity.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. E-commerce Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                 <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Writing">Writing</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the job requirements in detail..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Job"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function JobDetailView({ job, onBack }: { job: Job, onBack: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);
  const isJobPoster = user?.uid === job.postedBy.uid;
  
  const handleApply = async () => {
    if (!user || !job) return;
    setApplying(true);
    
    try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, 
            where('jobId', '==', job.id),
            where('participantIds', 'array-contains', user.uid)
        );

        const querySnapshot = await getDocs(q);
        let existingConversation: { id: string, [key: string]: any } | null = null;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.participantIds.includes(job.postedBy.uid)) {
                existingConversation = { id: doc.id, ...data };
            }
        });

        let conversationId: string;
        
        if (existingConversation) {
            conversationId = existingConversation.id;
        } else {
            const initialMessage = `Hi, I'm interested in applying for the "${job.title}" position.`;
            const newConversationRef = doc(collection(db, 'conversations'));
            
            await setDoc(newConversationRef, {
                jobId: job.id,
                participantIds: [user.uid, job.postedBy.uid],
                lastMessage: {
                    text: initialMessage,
                    senderId: user.uid,
                    timestamp: serverTimestamp()
                },
                createdAt: serverTimestamp(),
            });
            conversationId = newConversationRef.id;
            
            const messagesRef = collection(db, `conversations/${conversationId}/messages`);
            await addDoc(messagesRef, {
                senderId: user.uid,
                text: initialMessage,
                timestamp: serverTimestamp(),
            });
        }
        
        router.push(`/messages/${conversationId}`);

    } catch (error) {
        console.error("Error applying for job: ", error);
        toast({ title: "Error", description: "Could not start conversation. Please try again.", variant: "destructive" });
    } finally {
        setApplying(false);
    }
  };


  return (
    <Card className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <CardHeader>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <CardTitle className="text-2xl font-headline">{job.title}</CardTitle>
                    <CardDescription className="mt-2">
                        <div className="flex items-center gap-2">
                            <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={24} height={24} className="rounded-full" data-ai-hint="logo" />
                            <span>Posted by {job.postedBy.name}</span>
                        </div>
                    </CardDescription>
                </div>
            </div>
             <Badge variant="secondary" className="text-base px-4 py-2">{job.category}</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-xl font-headline">Job Details</h3>
              <div className="p-4 bg-muted/50 rounded-lg flex flex-wrap gap-x-8 gap-y-4">
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
            <div className="space-y-4">
                <h3 className="font-semibold text-xl font-headline">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t pt-6">
          {!isJobPoster && (
            <Button onClick={handleApply} size="lg" disabled={applying || !user}>
              {applying ? 'Starting conversation...' : 'Apply for this Job'}
            </Button>
          )}
      </CardFooter>
    </Card>
  )
}

function EmptyJobView() {
    return (
        <Card className="h-full flex-col items-center justify-center text-center p-8 hidden md:flex">
            <BriefcaseBusiness className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">Select a job to view details</h2>
            <p className="text-muted-foreground mt-1">Choose a job from the list on the left to get started.</p>
        </Card>
    )
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const jobsData: Job[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      const sortedJobs = jobsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setJobs(sortedJobs);
      if (loading) {
        setSelectedJob(sortedJobs[0] || null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loading]);
  
  const handleJobSelect = (job: Job) => {
      setSelectedJob(job);
      setMobileView('detail');
  }

  return (
    <div className="grid md:grid-cols-10 gap-6 h-full">
        {/* Left Column */}
        <div className={cn("md:col-span-4 flex-col gap-4", mobileView === 'list' ? 'flex' : 'hidden md:flex')}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                <h1 className="text-3xl font-headline font-bold">Job Marketplace</h1>
                <p className="text-muted-foreground">Find your next project.</p>
                </div>
                <div className="flex-shrink-0">
                    <PostJobDialog onJobPosted={() => setIsDialogOpen(false)} />
                </div>
            </div>
            <div className="border shadow-sm rounded-lg p-4">
                {/* Filters can go here */}
                 <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="web-dev">Web Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
             <ScrollArea className="flex-1 -mr-6 pr-6">
                <div className="space-y-4">
                    {loading ? (
                         Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                    ) : (
                        jobs.map((job) => (
                            <Card 
                                key={job.id} 
                                className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-primary' : ''}`}
                                onClick={() => handleJobSelect(job)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="font-headline text-lg mb-1 line-clamp-1">{job.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={20} height={20} className="rounded-full" data-ai-hint="logo" />
                                                {job.postedBy.name}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{job.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                         <p className="text-sm text-muted-foreground line-clamp-2">
                                            {job.description}
                                        </p>
                                        <div className="text-lg font-bold text-primary whitespace-nowrap ml-4">${job.price.toLocaleString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
             </ScrollArea>
        </div>
        {/* Right Column */}
        <div className={cn("md:col-span-6 h-full", mobileView === 'detail' ? 'block' : 'hidden md:block')}>
            {loading ? (
                <Card className="h-full"><CardHeader><Skeleton className="h-full w-full" /></CardHeader></Card>
            ) : selectedJob ? (
                <JobDetailView job={selectedJob} onBack={() => setMobileView('list')} />
            ) : (
                <EmptyJobView />
            )}
        </div>
    </div>
  )
}
