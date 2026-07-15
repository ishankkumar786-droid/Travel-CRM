'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LogOut,
  Moon,
  Sun,
  User,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { NotificationsPopover } from '@/components/layout/NotificationsPopover';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Left: Mobile menu + Page context */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <NotificationsPopover />

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-border" />

        {/* User menu */}
        <div className="group relative">
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground',
              'ring-2 ring-primary/20',
            )}>
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-foreground leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {user?.role === 'agency_owner' ? 'Agency Owner' :
                 user?.role === 'agency_staff' ? 'Agency Staff' :
                 user?.role ?? 'User'}
              </p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
          </button>

          {/* Dropdown */}
          <div className="invisible absolute right-0 top-full mt-1 w-56 rounded-lg border bg-popover p-1.5 shadow-lg opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="border-b px-3 py-2.5 mb-1">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </a>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
