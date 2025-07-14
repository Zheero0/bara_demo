'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AnchorHTMLAttributes } from 'react';

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
    variant?: 'desktop' | 'mobile';
};

export function NavLink({ href, children, variant = 'desktop', className, ...props }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    const desktopClasses = cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
    );

    const mobileClasses = cn(
        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
        isActive && "bg-muted text-foreground"
    );

    return (
        <Link 
            href={href} 
            className={cn(
                variant === 'desktop' ? desktopClasses : mobileClasses,
                className
            )}
            {...props}
        >
            {children}
        </Link>
    )
}
