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
import { jobs } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Job Marketplace</h1>
          <p className="text-muted-foreground">Find your next project or freelance opportunity.</p>
        </div>
        <Button>Post a Job</Button>
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
                  <Link href="#">View Job</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}