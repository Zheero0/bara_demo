
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, MessagesSquare, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
            Contact
          </Link>
          {loading ? null : user ? (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
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
            <Link href="/dashboard">
                <Button>Get Started</Button>
            </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                barabara
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connect, collaborate, and create. Your next opportunity is just a message away.
              </p>
              <Link href="/dashboard">
                <Button size="lg">
                  Find Your Next Opportunity <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Everything you need to connect</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A platform designed for professionals to find work, build teams, and grow their network.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Briefcase className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Job Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Discover opportunities or find the perfect talent for your next project in our curated marketplace.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Users className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Meaningful Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Build your professional network with user profiles, connection requests, and user search.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <MessagesSquare className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Direct Messaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Communicate seamlessly with built-in private messaging to discuss projects and ideas.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
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
