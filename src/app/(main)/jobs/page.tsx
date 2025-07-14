
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
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
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
import { useToast } from "@/hooks/use-toast"
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

const getStatusBadgeClass = (status: Job['status']) => {
    switch (status) {
        case 'Open':
            return 'bg-green-600';
        case 'In Progress':
            return 'bg-yellow-500';
        case 'Completed':
            return 'bg-gray-500';
        default:
            return 'bg-muted';
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
  const { toast } = useToast();
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
      toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
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
          avatar: user.photoURL || `https://placehold.co/40x40.png`,
        },
        createdAt: serverTimestamp()
      });
      toast({ title: "Job Posted!", description: "Your job has been successfully posted." });
      form.reset();
      onJobPosted();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error posting job: ", error);
      toast({ title: "Error", description: "There was an error posting your job. Please try again.", variant: "destructive" });
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
  const { toast } = useToast();
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
      toast({ title: "Job Updated!", description: "Your job details have been saved." });
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Error updating job: ", error);
      toast({ title: "Error", description: "There was an error updating your job.", variant: "destructive" });
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
        toast({ title: "Error", description: "Could not start conversation. Please try again.", variant: "destructive" });
    } finally {
        setApplying(false);
    }
  };


  return (
    <Card className="flex flex-col max-h-full">
      <ScrollArea className="flex-1">
        <CardHeader>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl font-headline break-words">{job.title}</CardTitle>
                        <Badge variant={'default'} className={cn(getStatusBadgeClass(job.status))}>{job.status}</Badge>
                    </div>
                    <CardDescription className="mt-1">
                        <div className="flex items-center gap-2 text-xs">
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
        <Separator />
        <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-xs font-headline tracking-wider uppercase text-muted-foreground">Job Details</h3>
              <div className="border rounded-lg space-y-4 p-4">
                  <div className="flex items-start space-x-2">
                      <PoundSterling className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-semibold text-sm">£{job.price.toLocaleString()}</p>
                      </div>
                  </div>
                   <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-semibold text-sm">{job.location} ({job.jobType})</p>
                      </div>
                  </div>
                  <div className="flex items-start space-x-2">
                      <Briefcase className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="font-semibold text-sm">{job.category}</p>
                      </div>
                  </div>
                  {job.createdAt && (
                      <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 text-primary shrink-0 mt-1" />
                          <div>
                              <p className="text-xs text-muted-foreground">Date Posted</p>
                              <p className="font-semibold text-sm">{format(job.createdAt.toDate(), 'PPP')}</p>
                          </div>
                      </div>
                  )}
              </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base font-headline">Job Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t pt-4">
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
        <Card className="h-full flex-col items-center justify-center text-center p-8 hidden md:flex">
            <BriefcaseBusiness className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold">Select a job to view details</h2>
            <p className="text-muted-foreground mt-1">Choose a job from the list on the left to get started.</p>
        </Card>
    )
}

function JobsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
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
      toast({ title: "Job Deleted", description: "The job posting has been removed." });
      setJobToDelete(null); // Close the dialog
      // If the deleted job was the selected one, clear the selection
      if (selectedJob?.id === jobToDelete) {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error deleting job: ", error);
      toast({ title: "Error", description: "Could not delete the job. Please try again.", variant: "destructive" });
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
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="border shadow-sm rounded-lg">
                <div className="p-4">
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between md:hidden">
                            <span>{isFilterOpen ? 'Hide' : 'Show'} Filters</span>
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4">
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
                        <Button variant="ghost" onClick={handleResetFilters} className="w-full text-muted-foreground">
                            <RotateCcw className="mr-2 h-4 w-4"/>
                            Reset Filters
                        </Button>
                    </div>
                 </CollapsibleContent>
            </Collapsible>
             <ScrollArea className="flex-1 -mr-6 pr-6">
                <div className="space-y-4">
                    {loading ? (
                         Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                    ) : (
                        filteredJobs.map((job) => (
                            <Card 
                                key={job.id} 
                                className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-primary' : ''}`}
                                onClick={() => handleJobSelect(job)}
                            >
                                <CardHeader className="p-3 pt-3 pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="font-headline text-base line-clamp-1">{job.title}</CardTitle>
                                                <Badge variant={'default'} className={cn(getStatusBadgeClass(job.status))}>{job.status}</Badge>
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
                                <CardContent className="p-3 pt-0 pb-3">
                                    <div className="flex justify-between items-start">
                                         <p className="text-sm text-muted-foreground pr-4 mt-1">
                                            {truncateText(job.description, 25)}
                                        </p>
                                        <div className="text-lg font-bold text-primary whitespace-nowrap">£{job.price.toLocaleString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
             </ScrollArea>
        </div>
        {/* Right Column */}
        <div className={cn("md:col-span-6", mobileView === 'detail' ? 'block' : 'hidden md:block')}>
            {loading ? (
                <Card><CardHeader><Skeleton className="h-full w-full" /></CardHeader></Card>
            ) : selectedJob ? (
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
