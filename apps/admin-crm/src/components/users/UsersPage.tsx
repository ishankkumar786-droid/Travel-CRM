'use client';

import { Plus, Shield, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { inviteUserSchema } from '@travel/validation';
import type { InviteUserInput } from '@travel/validation';
import type { UserManagementDTO } from '@travel/types';

import { useInviteUser, useUpdateUserRole, useUpdateUserStatus, useUsers } from '@/hooks/usePhase6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';

const ROLES = ['admin', 'researcher', 'sales', 'verification', 'support', 'viewer'];
const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'default'
> = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  suspended: 'destructive',
};

export function UsersPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useUsers();
  const inviteMutation = useInviteUser();
  const roleMutation = useUpdateUserRole();
  const statusMutation = useUpdateUserStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: 'viewer' },
  });

  const onInvite = async (values: InviteUserInput) => {
    await inviteMutation.mutateAsync(values as Record<string, unknown>);
    reset();
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );

  const users = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">{users.length} team members</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Invite User
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Invite team members to get started."
          icon={<Shield className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Invite User
            </Button>
          }
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full text-sm" role="grid">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="border-border text-muted-foreground border-b px-4 py-3 text-left text-xs font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: UserManagementDTO) => (
                <tr key={u.id} className="border-border hover:bg-muted/30 border-b last:border-0">
                  <td className="text-foreground px-4 py-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      className="border-input bg-background focus:ring-ring rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                      aria-label={`Role for ${u.firstName}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[u.status] ?? 'default'} className="capitalize">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Deactivate"
                          onClick={() => statusMutation.mutate({ id: u.id, status: 'inactive' })}
                        >
                          <UserX className="text-destructive h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Activate"
                          onClick={() => statusMutation.mutate({ id: u.id, status: 'active' })}
                        >
                          <UserCheck className="h-4 w-4 text-green-500" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Invite Team Member</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit(onInvite)} className="space-y-4 p-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name *</label>
                <Input error={!!errors.firstName} {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-destructive text-xs">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name *</label>
                <Input error={!!errors.lastName} {...register('lastName')} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" error={!!errors.email} {...register('email')} />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">Role *</label>
                <select
                  className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
                  {...register('role')}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Send Invite
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
