
'use client';
import { NavLink } from "@/components/nav-link";
import Link from "next/link"
import {
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  Briefcase
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserNav } from "@/components/user-nav"
import Logo from "@/components/logo"
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = useUnreadMessages(user?.uid);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  const FullPageLoader = () => (
     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Logo />
                </div>
                <div className="flex-1 p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        </div>
         <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="h-8 w-8 md:hidden" />
            <div className="flex-1">
              <Skeleton className="h-8 w-1/3" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Skeleton className="h-10 w-1/4 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
       </div>
  );

  if (loading || !user) {
    return <FullPageLoader />;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink href="/jobs">
                <Briefcase className="h-4 w-4" />
                Jobs
              </NavLink>
              <NavLink href="/chat">
                <MessageSquare className="h-4 w-4" />
                Chat
                {unreadCount > 0 && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </NavLink>
              <NavLink href="/connections">
                <Users className="h-4 w-4" />
                Connections
              </NavLink>
              <NavLink href="/profile">
                <User className="h-4 w-4" />
                Profile
              </NavLink>
               <NavLink href="/settings">
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle className="font-headline text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Upgrade to Pro
                </CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen overflow-y-auto">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Logo />
                <NavLink href="/jobs" variant="mobile">
                  <Briefcase className="h-5 w-5" />
                  Jobs
                </NavLink>
                <NavLink href="/chat" variant="mobile">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                  {unreadCount > 0 && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </NavLink>
                <NavLink href="/connections" variant="mobile">
                  <Users className="h-5 w-5" />
                  Connections
                </NavLink>
                <NavLink href="/profile" variant="mobile">
                  <User className="h-5 w-5" />
                  Profile
                </NavLink>
                 <NavLink href="/settings" variant="mobile">
                  <Settings className="h-5 w-5" />
                  Settings
                </NavLink>
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-base flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-primary" />
                       Upgrade to Pro
                    </CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </AuthProvider>
  );
}
