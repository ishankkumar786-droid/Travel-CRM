'use client';

import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { GlobalSearch } from '@/components/crm/GlobalSearch';
import { Button } from '@/components/ui/Button';

export function AppNavbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="border-border bg-card flex h-14 items-center justify-between border-b px-6">
      <GlobalSearch />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun
            className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
          <Moon
            className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
        </Button>

        <div className="border-border flex items-center gap-2 border-l pl-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <User className="text-primary h-4 w-4" aria-hidden="true" />
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground text-xs font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-muted-foreground text-xs">{user?.role?.replace('_', ' ')}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
