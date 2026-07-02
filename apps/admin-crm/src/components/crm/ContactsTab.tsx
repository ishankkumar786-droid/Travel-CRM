'use client';

import { Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContactSchema } from '@travel/validation';
import type { CreateContactInput } from '@travel/validation';
import type { ContactDTO } from '@travel/types';
import { useContacts, useCreateContact, useDeleteContact } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';

export function ContactsTab({ agencyId }: { agencyId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useContacts(agencyId);
  const createMutation = useCreateContact(agencyId);
  const deleteMutation = useDeleteContact(agencyId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { preferredCommunication: 'email', status: 'active', isPrimary: false },
  });

  const onSubmit = async (values: CreateContactInput) => {
    await createMutation.mutateAsync(values as Record<string, unknown>);
    reset();
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );

  const contacts = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add a contact for this agency."
          icon={<Phone className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Add Contact
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c: ContactDTO) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium">{c.fullName}</p>
                      {c.isPrimary && (
                        <Badge variant="info" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    {c.designation && (
                      <p className="text-muted-foreground text-xs">
                        {c.designation}
                        {c.department ? ` · ${c.department}` : ''}
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      {c.email && (
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" aria-hidden="true" />
                          {c.email}
                        </p>
                      )}
                      {c.phone && (
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          {c.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm('Delete contact?')) deleteMutation.mutate(c.id);
                    }}
                  >
                    <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Contact</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
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
                {errors.lastName && (
                  <p className="text-destructive text-xs">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Designation</label>
                <Input {...register('designation')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Department</label>
                <Input {...register('department')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...register('email')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input {...register('phone')} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                className="border-border h-4 w-4 rounded"
                {...register('isPrimary')}
              />
              <label htmlFor="isPrimary" className="text-sm">
                Set as primary contact
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Add Contact
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
