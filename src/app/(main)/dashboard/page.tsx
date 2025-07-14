
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
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
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


export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const jobsData: Job[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Job Marketplace</h1>
          <p className="text-muted-foreground">Find your next project or freelance opportunity.</p>
        </div>
        <PostJobDialog onJobPosted={() => setIsDialogOpen(false)} />
      </div>
      <div className="border shadow-sm rounded-lg p-4 mb-4">
        <div className="grid md:grid-cols-4 gap-4">
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
          <div className="grid gap-2 col-span-2">
            <Label>Price Range</Label>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-sm text-muted-foreground">$0</span>
              <Slider defaultValue={[2500]} max={10000} step={100} />
              <span className="text-sm text-muted-foreground">$10,000</span>
            </div>
          </div>
          <div className="grid gap-2 self-end">
            <Button>Apply Filters</Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 pr-6 -mr-6">
        {loading ? (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-4 w-full mb-2" />
                   <Skeleton className="h-4 w-full mb-2" />
                   <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex justify-between items-center">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-1/3" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
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
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex justify-between items-center">
                  <div className="text-lg font-bold text-primary">${job.price.toLocaleString()}</div>
                  <Button asChild>
                    <Link href={`/job/${job.id}`}>View Job</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
