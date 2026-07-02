'use client';

import { Building2, CheckSquare, MessageSquare, Phone, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useGlobalSearch } from '@/hooks/useCRM';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useGlobalSearch(q);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const hasResults =
    data &&
    (data.agencies.length > 0 ||
      data.contacts.length > 0 ||
      data.activities.length > 0 ||
      data.notes.length > 0 ||
      data.tasks.length > 0);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="border-input bg-muted/50 text-muted-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="bg-background hidden rounded px-1.5 text-xs sm:inline">⌘K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Search panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          className="border-border bg-background fixed left-1/2 top-20 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border shadow-xl"
        >
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search agencies, contacts, tasks…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
              aria-label="Search query"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} aria-label="Clear search">
                <X
                  className="text-muted-foreground hover:text-foreground h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
            {isLoading && <LoadingSpinner size="sm" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!q && (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Type at least 2 characters to search
              </p>
            )}

            {q.length >= 2 && !isLoading && !hasResults && (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No results for &ldquo;{q}&rdquo;
              </p>
            )}

            {hasResults && (
              <>
                {data.agencies.length > 0 && (
                  <ResultGroup title="Agencies" icon={Building2}>
                    {data.agencies.map((a) => (
                      <ResultItem
                        key={a.id}
                        href={`/dashboard/agencies/${a.id}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-foreground font-medium">{a.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {a.agencyCode} · {a.city}
                        </span>
                      </ResultItem>
                    ))}
                  </ResultGroup>
                )}
                {data.contacts.length > 0 && (
                  <ResultGroup title="Contacts" icon={Phone}>
                    {data.contacts.map((c) => (
                      <ResultItem
                        key={c.id}
                        href={`/dashboard/agencies/${c.agencyId}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-foreground font-medium">{c.fullName}</span>
                        <span className="text-muted-foreground text-xs">
                          {c.agencyName} {c.email ? `· ${c.email}` : ''}
                        </span>
                      </ResultItem>
                    ))}
                  </ResultGroup>
                )}
                {data.tasks.length > 0 && (
                  <ResultGroup title="Tasks" icon={CheckSquare}>
                    {data.tasks.map((t) => (
                      <ResultItem
                        key={t.id}
                        href={`/dashboard/agencies/${t.agencyId}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-foreground font-medium">{t.title}</span>
                        <span className="text-muted-foreground text-xs capitalize">
                          {t.priority} · {t.agencyName}
                        </span>
                      </ResultItem>
                    ))}
                  </ResultGroup>
                )}
                {data.notes.length > 0 && (
                  <ResultGroup title="Notes" icon={MessageSquare}>
                    {data.notes.map((n) => (
                      <ResultItem
                        key={n.id}
                        href={`/dashboard/agencies/${n.agencyId}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-foreground line-clamp-1 text-sm">{n.content}</span>
                        <span className="text-muted-foreground text-xs">{n.agencyName}</span>
                      </ResultItem>
                    ))}
                  </ResultGroup>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </p>
      {children}
    </div>
  );
}

function ResultItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('hover:bg-muted flex flex-col gap-0.5 rounded-md px-3 py-2 transition-colors')}
    >
      {children}
    </Link>
  );
}
