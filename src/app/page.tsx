
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, MessagesSquare, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
           <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
            Contact
          </Link>
          {loading ? null : user ? (
            <Link href="/jobs">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
            <Link href="/signup">
                <Button>Get Started</Button>
            </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                The UK's Premier Marketplace for Pro Freelancers
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Find exclusive projects, connect with top-tier UK clients, and get paid, all in one place. Join Bara Pro today.
              </p>
              <Link href="/signup">
                <Button size="lg">
                  Become a Bara Pro <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">The Bara Pro Advantage</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform is built on trust and quality. We connect the best UK talent with the best projects.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Briefcase className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Exclusive Job Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Gain access to high-quality, vetted projects you won't find anywhere else. Say goodbye to low-ball offers.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Users className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Become a "Bara Pro"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Join our approved list of trusted UK professionals. Clients look for the "Bara Pro" badge for quality assurance.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <MessagesSquare className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Powerful Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">From direct messaging to project management, get the tools you need to collaborate effectively and get paid on time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    One plan, all features. Become a Pro and unlock your full potential.
                </p>
            </div>
             <div className="mx-auto flex justify-center">
                 <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline">Bara Pro</CardTitle>
                        <CardDescription>Full access to the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="my-4">
                            <span className="text-5xl font-bold">£99</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <ul className="space-y-3 w-full text-left my-4">
                            <li className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Apply to unlimited jobs</li>
                            <li className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Get the "Bara Pro" badge</li>
                            <li className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Priority support</li>
                            <li className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Full access to communication tools</li>
                        </ul>
                         <Link href="/signup" className="w-full">
                            <Button className="w-full" size="lg">Get Started</Button>
                        </Link>
                    </CardContent>
                </Card>
             </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Get In Touch</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions or want to learn more? Drop us a line.
              </p>
            </div>
            <div className="mx-auto w-full max-w-2xl">
              <Card>
                <CardContent className="p-6">
                  <form className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="John" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Type your message here." required className="min-h-[120px]" />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 barabara Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

