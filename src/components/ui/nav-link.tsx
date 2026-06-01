'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, type MouseEvent, type ReactNode } from 'react';

/**
 * Sidebar nav row with a rapid-click guard. Power-clicking sidebar items would
 * otherwise each fire an independent Next router transition; Next 16's App
 * Router doesn't reliably cancel in-flight RSC streams on a new cross-route nav,
 * so they pile up and saturate the main thread (the documented freeze class). We
 * intercept the click, hand nav to useTransition + router.push, and ignore
 * further clicks while pending. Modifier/middle clicks fall through to the
 * browser default so "open in new tab" still works. prefetch={false} stops a
 * parallel RSC prefetch per visible row.
 *
 * (No Suspense/cacheComponents split — this project defers cacheComponents, so
 * usePathname() doesn't need to suspend during prerender.)
 */
export function NavLink({
  href,
  children,
  className,
  activeClassName = '',
  exact = false,
}: {
  href: string;
  children: ReactNode;
  className: string;
  activeClassName?: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (pending || href === pathname) return;
    startTransition(() => router.push(href));
  }

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={handleClick}
      data-active={active ? 'true' : undefined}
      data-pending={pending ? 'true' : undefined}
      aria-current={active ? 'page' : undefined}
      className={`${className} ${active ? activeClassName : ''} ${pending ? 'opacity-60' : ''}`}
    >
      {children}
    </Link>
  );
}
