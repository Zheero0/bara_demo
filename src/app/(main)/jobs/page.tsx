
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
import { Button, buttonVariants } from "@/components/ui/button"
import { type Job } from "@/lib/data"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useMemo, Suspense } from "react"
import { collection, onSnapshot, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, updateDoc, getDoc as getFirestoreDoc, deleteDoc } from "firebase/firestore"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Briefcase, Calendar, PoundSterling, BriefcaseBusiness, ArrowLeft, MoreHorizontal, Flag, Settings, User, MapPin, Check, ChevronsUpDown, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { Separator } from "@/components/ui/separator";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  category: z.string().min(1, "Please select a category."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  jobType: z.enum(['On-site', 'Remote']),
  location: z.string().min(2, "Please specify a location.").max(50, "Location must be 50 characters or less."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
});

const manageJobSchema = jobSchema.extend({
  status: z.enum(['Open', 'In Progress', 'Completed']),
});


const JOB_CATEGORIES = [
    "Web Development",
    "Design & Creative",
    "Writing & Translation",
    "DIY & Home Improvement",
    "Cleaning Services",
    "Tutoring & Education",
    "Gardening & Landscaping",
    "Moving & Delivery",
    "Events & Photography",
    "Personal Care & Wellness",
    "Other"
];

const getStatusClass = (status: Job['status']) => {
    switch (status) {
        case 'Open':
            return 'text-green-600 bg-transparent hover:bg-transparent';
        case 'In Progress':
            return 'text-yellow-500 bg-transparent hover:bg-transparent';
        case 'Completed':
            return 'text-gray-500 bg-transparent hover:bg-transparent';
        default:
            return 'text-muted-foreground bg-transparent hover:bg-transparent';
    }
}

function LocationCombobox({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? CITIES.find((city) => city.toLowerCase() === value.toLowerCase()) || "Select location..."
            : "Select location..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search location..." value={searchValue} onValueChange={setSearchValue} />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {CITIES.filter(city => city.toLowerCase().includes(searchValue.toLowerCase())).map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={(currentValue) => {
                    onChange(currentValue.toLowerCase() === value.toLowerCase() ? "" : city)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === city.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function PostJobDialog({ onJobPosted }: { onJobPosted: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      category: "",
      price: 0,
      jobType: "On-site",
      location: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof jobSchema>) {
    if (!user) {
      toast.error("Authentication Error", { description: "You must be logged in to post a job." });
      return;
    }
    setLoading(true);
    try {
      const jobsCollection = collection(db, "jobs");
      await addDoc(jobsCollection, {
        ...values,
        status: 'Open', // Default status
        postedBy: {
          uid: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='feather feather-user'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E`,
        },
        createdAt: serverTimestamp()
      });
      toast.success("Job Posted!", { description: "Your job has been successfully posted." });
      form.reset();
      onJobPosted();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error posting job: ", error);
      toast.error("Error", { description: "There was an error posting your job. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) form.reset();}}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>Post a Job</Button>
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
                    <Input placeholder="e.g. Assemble IKEA furniture" {...field} />
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
                        {JOB_CATEGORIES.map(category => (
                             <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                   <FormControl>
                     <LocationCombobox value={field.value} onChange={field.onChange} />
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

function ManageJobDialog({ job, onOpenChange }: { job: Job, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof manageJobSchema>>({
    resolver: zodResolver(manageJobSchema),
    defaultValues: {
      ...job,
    },
  });

  async function onSubmit(values: z.infer<typeof manageJobSchema>) {
    setLoading(true);
    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, values);
      toast.success("Job Updated!", { description: "Your job details have been saved." });
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Error updating job: ", error);
      toast.error("Error", { description: "There was an error updating your job." });
    } finally {
      setLoading(false);
    }
  }
  
  // Use `useEffect` to reset the form if the job prop changes
  useEffect(() => {
    form.reset(job);
  }, [job, form]);


  return (
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Job</DialogTitle>
          <DialogDescription>
            Update the details for your job posting.
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
                    <Input {...field} />
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
                        {JOB_CATEGORIES.map(category => (
                             <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                   <FormControl>
                     <LocationCombobox value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}

function JobDetailView({ job, onBack, onManage, onDelete }: { job: Job, onBack: () => void, onManage: (job: Job) => void, onDelete: (jobId: string) => void }) {
  const router = useRouter();
  const { user } = useAuth();
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
            const newConversationRef = doc(collection(db, 'conversations'));
            conversationId = newConversationRef.id;

            const initialMessage = `Hi, I'm interested in applying for the "${job.title}" position.`;

            const messagesRef = collection(db, `conversations/${conversationId}/messages`);
            const newMessageDoc = await addDoc(messagesRef, {
                senderId: user.uid,
                text: initialMessage,
                timestamp: serverTimestamp(),
            });

            const newMessageSnap = await getFirestoreDoc(newMessageDoc);
            const newMessageData = newMessageSnap.data();

            await setDoc(newConversationRef, {
                jobId: job.id,
                participantIds: [user.uid, job.postedBy.uid],
                lastMessage: {
                    text: initialMessage,
                    senderId: user.uid,
                    timestamp: newMessageData?.timestamp || serverTimestamp(),
                }
            });
        }
        
        router.push(`/chat/${conversationId}`);

    } catch (error) {
        console.error("Error applying for job: ", error);
        toast.error("Error", { description: "Could not start conversation. Please try again." });
    } finally {
        setApplying(false);
    }
  };


  return (
    <Card className="flex flex-col max-h-full border-0 shadow-none">
      <ScrollArea className="flex-1">
        <CardHeader className="p-0">
          <div className="flex justify-between items-start px-6 py-4">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-3xl font-headline break-words">{job.title}</CardTitle>
                      <span className={cn("px-1 font-semibold text-xs", getStatusClass(job.status))}>{job.status}</span>
                  </div>
                  <CardDescription className="mt-1">
                      <div className="flex items-center gap-2 text-base">
                          <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={20} height={20} className="rounded-full" data-ai-hint="logo" />
                          <span>
                              Posted by{' '}
                              <Link href={`/profile/${job.postedBy.uid}`} className="font-medium text-foreground hover:underline">
                                  {job.postedBy.name}
                              </Link>
                          </span>
                      </div>
                  </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                      <Link href={`/profile/${job.postedBy.uid}`}>
                          <User className="mr-2 h-4 w-4" />
                          Go to user's profile
                      </Link>
                  </DropdownMenuItem>
                  {isJobPoster ? (
                      <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => onManage(job)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Job
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onDelete(job.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Job
                          </DropdownMenuItem>
                      </>
                  ) : (
                          <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          Report Job
                      </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-6 py-6 border-y">
                <div className="flex flex-col gap-4 justify-center bg-muted/50 p-6 rounded-lg">
                    <p className="text-base text-muted-foreground">Price</p>
                    <p className="text-5xl font-bold">£{job.price.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      <div>
                          <p className="text-base text-muted-foreground">Location</p>
                          <p className="font-semibold text-lg">{job.location} ({job.jobType})</p>
                      </div>
                  </div>
                   <div className="flex items-start space-x-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      <div>
                          <p className="text-base text-muted-foreground">Category</p>
                          <p className="font-semibold text-lg">{job.category}</p>
                      </div>
                  </div>
                  {job.createdAt && (
                      <div className="flex items-start space-x-3">
                          <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                          <div>
                              <p className="text-base text-muted-foreground">Date Posted</p>
                              <p className="font-semibold text-lg">{format(job.createdAt.toDate(), 'PPP')}</p>
                          </div>
                      </div>
                  )}
                </div>
            </div>
             <div className="space-y-4 px-6 pt-6">
                  <h3 className="font-semibold text-xl font-headline">Job Description</h3>
                  <p className="text-xl text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>
        </CardContent>
      </ScrollArea>
      <CardFooter className="pt-4 px-6">
          {!isJobPoster && (
            <Button onClick={handleApply} size="sm" disabled={applying || !user || job.status !== 'Open'}>
              {job.status !== 'Open' ? `Job ${job.status}` : applying ? 'Starting conversation...' : 'Apply for this Job'}
            </Button>
          )}
      </CardFooter>
    </Card>
  )
}

function EmptyJobView() {
    return (
        <Card className="h-full flex-col items-center justify-center text-center p-8 hidden md:flex border-0 shadow-none">
            <BriefcaseBusiness className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">Select a job to view details</h2>
            <p className="text-muted-foreground mt-1">Choose a job from the list on the left to get started.</p>
        </Card>
    )
}

function JobCardSkeleton() {
    return (
        <Card className="border-0">
            <CardHeader className="p-4 pt-4 pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                             <Skeleton className="h-5 w-5 rounded-full" />
                             <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                     <Skeleton className="h-6 w-6" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-end mt-2">
                     <div className="flex items-center gap-2 text-xs">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                </div>
            </CardContent>
        </Card>
    )
}

function JobDetailSkeleton() {
    return (
        <Card className="flex flex-col h-full border-0 shadow-none">
            <ScrollArea className="flex-1">
                <CardHeader className="p-0">
                    <div className="px-6 py-4 border-b">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </div>
                            <Skeleton className="h-7 w-7" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="border-t py-6 px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-start space-x-2">
                                    <Skeleton className="w-4 h-4 mt-1" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pt-6 mt-6 border-t">
                            <Skeleton className="h-5 w-40" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </ScrollArea>
            <CardFooter className="pt-4 px-6">
                 <Skeleton className="h-9 w-36" />
            </CardFooter>
        </Card>
    )
}

function JobsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [priceFilter, setPriceFilter] = useState('All Prices');
  const [jobTypeFilter, setJobTypeFilter] = useState('All Types');
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [jobToManage, setJobToManage] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const jobsData: Job[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      const sortedJobs = jobsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setAllJobs(sortedJobs);
      if (loading) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loading]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchesSearch = searchQuery 
        ? job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesLocation = locationFilter && job.location
        ? job.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const matchesCategory = categoryFilter !== 'All Categories'
        ? job.category === categoryFilter
        : true;
        
      const matchesJobType = jobTypeFilter !== 'All Types'
        ? job.jobType === jobTypeFilter
        : true;

      const matchesPrice = priceFilter !== 'All Prices'
        ? (() => {
            const [min, max] = priceFilter.split('-').map(Number);
            if (max) return job.price >= min && job.price <= max;
            return job.price >= min;
          })()
        : true;

      return matchesSearch && matchesLocation && matchesCategory && matchesJobType && matchesPrice;
    });
  }, [allJobs, searchQuery, locationFilter, categoryFilter, jobTypeFilter, priceFilter]);

  useEffect(() => {
    if (!selectedJob && filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    } else if (selectedJob && !filteredJobs.some(j => j.id === selectedJob.id)) {
      setSelectedJob(filteredJobs[0] || null);
    }
  }, [filteredJobs, selectedJob]);
  
  const handleJobSelect = (job: Job) => {
      setSelectedJob(job);
      setMobileView('detail');
  }

  const handleManageJob = (job: Job) => {
    setJobToManage(job);
    setIsManageDialogOpen(true);
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await deleteDoc(doc(db, "jobs", jobToDelete));
      toast.success("Job Deleted", { description: "The job posting has been removed." });
      setJobToDelete(null); // Close the dialog
      // If the deleted job was the selected one, clear the selection
      if (selectedJob?.id === jobToDelete) {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error deleting job: ", error);
      toast.error("Error", { description: "Could not delete the job. Please try again." });
    }
  };


  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleResetFilters = () => {
    router.push('/jobs'); // Clears the '?q=' param from URL
    setLocationFilter('');
    setCategoryFilter('All Categories');
    setPriceFilter('All Prices');
    setJobTypeFilter('All Types');
  };

  const FilterForm = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <LocationCombobox value={locationFilter} onChange={setLocationFilter} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">All Categories</SelectItem>
            {JOB_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price</Label>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger id="price">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Prices">All Prices</SelectItem>
              <SelectItem value="0-100">£0 - £100</SelectItem>
              <SelectItem value="100-500">£100 - £500</SelectItem>
              <SelectItem value="500-1000">£500 - £1000</SelectItem>
              <SelectItem value="1000">£1000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="job-type">Job Type</Label>
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger id="job-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="ghost" onClick={handleResetFilters} className="w-full text-muted-foreground border">
        <RotateCcw className="mr-2 h-4 w-4"/>
        Reset Filters
      </Button>
    </div>
  );

  if (loading) {
      return (
        <div className="grid md:grid-cols-10 gap-6 h-full">
            <div className={cn("md:col-span-4 flex flex-col gap-4 min-h-0", mobileView === 'list' ? 'flex' : 'hidden md:flex')}>
                 <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
                 <div className="hidden md:block bg-card shadow-sm rounded-lg p-4">
                    <Skeleton className="h-6 w-20 mb-4" />
                    <div className="space-y-4">
                         <div className="grid gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="grid gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                         <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="md:hidden">
                    <Skeleton className="h-14 w-full" />
                </div>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
                    </div>
                </ScrollArea>
            </div>
             <div className={cn("md:col-span-6", mobileView === 'detail' ? 'block' : 'hidden md:block')}>
                 <JobDetailSkeleton />
            </div>
        </div>
      )
  }

  return (
    <>
    <div className="grid md:grid-cols-10 gap-6 h-full">
        {/* Left Column */}
        <div className={cn("md:col-span-4 flex flex-col gap-4 min-h-0", mobileView === 'list' ? 'flex' : 'hidden md:flex')}>
            <div className="flex flex-row items-center justify-between gap-4">
                <div>
                <h1 className="text-xl font-headline font-bold">Job Search</h1>
                <p className="text-sm text-muted-foreground">Find your next project.</p>
                </div>
                <div className="flex-shrink-0">
                    <PostJobDialog onJobPosted={() => {}} />
                </div>
            </div>

            {/* Filters for Desktop */}
            <div className="hidden md:block bg-card shadow-sm rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 font-headline">Filters</h3>
                <FilterForm />
            </div>

            {/* Filters for Mobile */}
            <div className="md:hidden">
                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="bg-card shadow-sm rounded-lg">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-4">
                            <span>{isFilterOpen ? 'Hide' : 'Show'} Filters</span>
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0">
                        <div className="mt-4">
                            <FilterForm />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
            
             <ScrollArea className="flex-1 -mr-6 pr-6">
                <div className="space-y-4">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <Card 
                                key={job.id} 
                                className={cn(
                                    "cursor-pointer transition-all border-0",
                                    selectedJob?.id === job.id 
                                        ? "shadow-lg shadow-primary/20 -translate-y-1"
                                        : "hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                                )}
                                onClick={() => handleJobSelect(job)}
                            >
                                <CardHeader className="p-4 pt-4 pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="font-headline text-base line-clamp-1">{job.title}</CardTitle>
                                                <span className={cn("px-1 font-semibold text-xs", getStatusClass(job.status))}>{job.status}</span>
                                            </div>
                                            <CardDescription className="flex items-center gap-2 text-xs">
                                                <Image src={job.postedBy.avatar} alt={job.postedBy.name} width={20} height={20} className="rounded-full" data-ai-hint="logo" />
                                                {job.postedBy.name}
                                            </CardDescription>
                                        </div>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                {user?.uid === job.postedBy.uid ? (
                                                    <>
                                                        <DropdownMenuItem onSelect={() => handleManageJob(job)}>
                                                            <Settings className="mr-2 h-4 w-4" />
                                                            Manage Job
                                                        </DropdownMenuItem>
                                                         <DropdownMenuItem onSelect={() => setJobToDelete(job.id)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Job
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <DropdownMenuItem>
                                                        <Flag className="mr-2 h-4 w-4" />
                                                        Report Job
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 pb-4">
                                     <p className="text-sm text-muted-foreground pr-4 mt-1 line-clamp-2">
                                        {job.description}
                                    </p>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{job.location} ({job.jobType})</span>
                                        </div>
                                        <div className="text-lg font-bold text-primary whitespace-nowrap">£{job.price.toLocaleString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>No jobs found.</p>
                            <p className="text-sm">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
             </ScrollArea>
        </div>
        {/* Right Column */}
        <div className={cn("md:col-span-6", mobileView === 'detail' ? 'block' : 'hidden md:block')}>
            {selectedJob ? (
                <JobDetailView 
                    job={selectedJob} 
                    onBack={() => setMobileView('list')}
                    onManage={handleManageJob}
                    onDelete={(jobId) => setJobToDelete(jobId)}
                />
            ) : filteredJobs.length > 0 ? (
                 <JobDetailView 
                    job={filteredJobs[0]} 
                    onBack={() => setMobileView('list')} 
                    onManage={handleManageJob}
                    onDelete={(jobId) => setJobToDelete(jobId)}
                />
            ) : (
                <EmptyJobView />
            )}
        </div>
    </div>
    <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        {jobToManage && <ManageJobDialog job={jobToManage} onOpenChange={setIsManageDialogOpen} />}
    </Dialog>
     <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this job
              posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsContent />
    </Suspense>
  )
}

    
