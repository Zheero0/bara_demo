
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, MessagesSquare, Users, CheckCircle, Search, UserPlus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Re-defining Sparkles as an inline SVG component
const Sparkles = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm0 15a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75ZM5.036 5.036a.75.75 0 0 1 0 1.06l-2.122 2.12a.75.75 0 1 1-1.06-1.06l2.12-2.12a.75.75 0 0 1 1.062 0ZM19.964 18.9a.75.75 0 0 1 0 1.06l-2.12 2.122a.75.75 0 1 1-1.061-1.06l2.12-2.122a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1 0-1.5h3a.75.75 0 0 1 .75.75ZM6 12a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1 0-1.5h3A.75.75 0 0 1 6 12ZM5.036 18.964a.75.75 0 0 1 1.06 0l-2.12 2.12a.75.75 0 1 1-1.06-1.06l2.12-2.12a.75.75 0 0 1 0 1.06Zm14.928-13.928a.75.75 0 0 1 1.06 0l-2.122 2.12a.75.75 0 0 1-1.06-1.06l2.122-2.12a.75.75 0 0 1 0-1.06Z" />
    </svg>
);


export default function LandingPage() {
  const { user, loading } = useAuth();

  const plans = [
    {
        name: 'Free',
        price: '£0',
        priceDescription: '/month',
        description: 'For those just getting started.',
        features: [
            'Browse all job postings',
            'Apply to 3 jobs per month',
            'Basic profile customization',
        ],
        buttonText: 'Get Started',
        variant: 'outline'
    },
    {
        name: 'Pro',
        price: '£4.99',
        priceDescription: '/month',
        description: 'For professionals ready to level up.',
        features: [
            'Apply to unlimited jobs',
            'Get the "Bara Pro" badge',
            'Priority support',
            'Full access to communication tools'
        ],
        buttonText: 'Go Pro',
        isPrimary: true
    },
    {
        name: 'Pro Annual',
        price: '£49.99',
        priceDescription: '/year',
        description: 'For committed professionals.',
        features: [
            'All features from Pro Monthly',
            'Save ~£10 (2+ months free)',
            'Top priority support',
        ],
        buttonText: 'Go Pro Annual',
        variant: 'outline'
    }
];

const features = [
    {
        icon: Briefcase,
        title: "Exclusive Job Board",
        description: "Gain access to high-quality, vetted projects you won't find anywhere else. Say goodbye to low-ball offers."
    },
    {
        icon: Users,
        title: 'Become a "Bara Pro"',
        description: "Join our approved list of trusted UK professionals. Clients look for the 'Bara Pro' badge for quality assurance."
    },
    {
        icon: MessagesSquare,
        title: "Powerful Tools",
        description: "From direct messaging to project management, get the tools you need to collaborate effectively and get paid on time."
    }
]

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Logo />
        <nav className="hidden md:flex gap-4 items-center">
          <Link href="#features" className="text-base font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-base font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          {loading ? null : user ? (
            <Button asChild className='bg-green-400' >
                <Link href="/jobs">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
        <div className="md:hidden">
            <Button asChild>
                <Link href={user ? '/jobs' : '/signup'}>Get Started</Link>
            </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full relative overflow-hidden flex items-center justify-center min-h-dvh">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-3xl -z-10" />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
                <Badge variant="outline" className="py-1 px-3 border-primary/30 text-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Connecting the UK's Top Talent
                </Badge>
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl !leading-tight">
                The UK's Premier Marketplace for Pro Freelancers
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Find exclusive projects, connect with top-tier UK clients, and get paid, all in one place. Join Bara Pro today.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Button asChild size="lg" className="group bg-green-400">
                    <Link href="/signup">
                        Become a Bara Pro <ArrowRight className="ml-2 h-5 w-5 transition-transform   group-hover:translate-x-1" />
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="#features">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage src="https://placehold.co/40x40/ffa59e/ffffff.png" data-ai-hint="person" />
                          <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage src="https://placehold.co/40x40/9ed1ff/ffffff.png" data-ai-hint="person" />
                          <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                       <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage src="https://placehold.co/40x40/c59eff/ffffff.png" data-ai-hint="person" />
                          <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                  </div>
                  <p className="text-sm text-muted-foreground">Trusted by 1,000+ UK professionals</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
             <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Getting started on barabara is simple. Follow these three easy steps.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader className="items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                               <UserPlus className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-xl">1. Create Your Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Sign up and create a standout professional profile. Showcase your skills, experience, and portfolio to attract clients.
                        </CardContent>
                    </Card>
                     <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader className="items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Search className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-xl">2. Find & Apply for Jobs</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Browse our exclusive job board for projects that match your expertise. Apply directly and start conversations with clients.
                        </CardContent>
                    </Card>
                     <Card className="bg-transparent border-0 shadow-none">
                        <CardHeader className="items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-xl">3. Get Hired & Paid</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Collaborate with clients using our built-in tools. Complete your work and get paid securely and on time through our platform.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">The Bara Pro Advantage</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform is built on trust and quality. We connect the best UK talent with the best projects.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={i} className="bg-background">
                    <CardHeader className="flex flex-row items-center gap-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Choose the plan that's right for you. No hidden fees.
                </p>
            </div>
             <div className="grid gap-8 lg:grid-cols-3">
                 {plans.map((plan) => (
                    <Card 
                        key={plan.name} 
                        className={cn(
                            "flex flex-col transition-all", 
                            plan.isPrimary 
                                ? "ring-2 ring-primary shadow-2xl shadow-primary/20 -translate-y-4" 
                                : "hover:-translate-y-2"
                        )}
                    >
                        {plan.isPrimary && (
                            <div className="py-2 px-4 bg-primary text-primary-foreground text-center text-sm font-semibold rounded-t-lg">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 justify-between">
                            <div>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.priceDescription}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                            <span className="flex-1">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button asChild className="w-full mt-8" size="lg" variant={plan.isPrimary ? 'default' : 'outline'}>
                                <Link href="/signup">{plan.buttonText}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                 ))}
             </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-muted/50">
        <div className="container flex flex-col gap-4 sm:flex-row py-6 items-center px-4 md:px-6">
            <div className="flex flex-col items-center sm:items-start">
                <Logo />
                <p className="text-xs text-muted-foreground mt-2">&copy; 2024 barabara Inc. All rights reserved.</p>
            </div>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4">
                Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
                Privacy Policy
            </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
