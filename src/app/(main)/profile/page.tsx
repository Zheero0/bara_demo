
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/profile/${user.uid}`);
    }
    if (!loading && !user) {
        // If not logged in, redirect to login page
        router.replace('/login');
    }
  }, [user, loading, router]);

  return (
     <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <div className="flex gap-4">
            <Skeleton className="h-32 w-1/2" />
            <Skeleton className="h-32 w-1/2" />
        </div>
    </div>
  );
}

    