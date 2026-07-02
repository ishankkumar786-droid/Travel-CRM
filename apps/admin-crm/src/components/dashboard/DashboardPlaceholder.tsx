'use client';

import { LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ProtectedRoute>
      <div className="bg-background flex min-h-screen flex-col">
        {/* Minimal nav */}
        <header className="border-border bg-card border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-semibold">Travel Marketplace — Admin</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="text-primary h-8 w-8" aria-hidden="true" />
          </div>

          <div className="text-center">
            <h1 className="text-foreground text-2xl font-bold">
              Welcome, {user?.firstName ?? 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">Authentication is working correctly.</p>
          </div>

          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-sm">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary">{user?.role?.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="success">{user?.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-xs">
            Phase 4 will replace this with the full dashboard.
          </p>
        </main>
      </div>
    </ProtectedRoute>
  );
}
