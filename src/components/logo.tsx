import { Users } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Users className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold">barabara</span>
    </Link>
  );
}
