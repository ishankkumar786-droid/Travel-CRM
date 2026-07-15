'use client';

import { useState } from 'react';
import { User, Building2, Lock, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/* ─── Tabs ─────────────────────────────────────────────────────────────────── */

const settingsTabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'agency', label: 'Agency Info', icon: Building2 },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type TabKey = (typeof settingsTabs)[number]['key'];

/* ─── Component ────────────────────────────────────────────────────────────── */

export function SettingsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and agency preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <Card className="h-fit lg:col-span-1">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6 lg:col-span-3">
          {activeTab === 'profile' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input defaultValue={user?.firstName ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input defaultValue={user?.lastName ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue={user?.email ?? ''} type="email" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue={user?.phone ?? ''} type="tel" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast.success('Profile updated successfully')}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'agency' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
                <CardDescription>Your registered business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agency Name</label>
                    <Input defaultValue="Travel Masters India" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Legal Name</label>
                    <Input defaultValue="Travel Masters India Pvt. Ltd." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GST Number</label>
                    <Input defaultValue="07AABCT1332H1Z5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PAN Number</label>
                    <Input defaultValue="AABCT1332H" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast.success('Agency information updated')}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="max-w-md space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast.success('Password updated successfully')}>
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: 'New enquiry received',
                      description: 'Get notified when someone enquires about your packages',
                    },
                    {
                      label: 'Booking confirmed',
                      description: 'Notifications for confirmed bookings',
                    },
                    { label: 'New reviews', description: 'When a customer leaves a review' },
                    {
                      label: 'Verification updates',
                      description: 'Status changes on your documents',
                    },
                    { label: 'Marketplace updates', description: 'New features and announcements' },
                  ].map((pref) => (
                    <div
                      key={pref.label}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{pref.label}</p>
                        <p className="text-muted-foreground text-xs">{pref.description}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="bg-muted peer-checked:bg-primary peer-focus:ring-primary/20 h-6 w-11 rounded-full transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-focus:ring-2" />
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your portal</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Theme settings are managed via the theme toggle in the header. Click the sun/moon
                  icon to switch between light and dark mode.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
