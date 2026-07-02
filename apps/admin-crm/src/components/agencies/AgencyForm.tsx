'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { createAgencySchema } from '@travel/validation';
import type { CreateAgencyInput } from '@travel/validation';
import type { AgencyDTO } from '@travel/types';

import { useCreateAgency, useUpdateAgency } from '@/hooks/useAgencies';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const EMPLOYEE_OPTIONS = ['1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '250+'];

interface AgencyFormProps {
  agency?: AgencyDTO;
}

export function AgencyForm({ agency }: AgencyFormProps) {
  const router = useRouter();
  const isEdit = !!agency;

  const createMutation = useCreateAgency();
  const updateMutation = useUpdateAgency(agency?.id ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<CreateAgencyInput>({
    resolver: zodResolver(createAgencySchema),
    defaultValues: agency
      ? {
          name: agency.name,
          legalName: agency.legalName,
          ownerName: agency.ownerName,
          primaryContactName: agency.primaryContactName,
          email: agency.email,
          secondaryEmail: agency.secondaryEmail,
          phone: agency.phone,
          secondaryPhone: agency.secondaryPhone,
          whatsapp: agency.whatsapp,
          website: agency.website,
          address: {
            street: agency.address.street,
            city: agency.address.city,
            state: agency.address.state,
            country: agency.address.country,
            postalCode: agency.address.postalCode,
          },
          gstNumber: agency.gstNumber,
          panNumber: agency.panNumber,
          yearEstablished: agency.yearEstablished,
          employeeCount: agency.employeeCount,
          notes: agency.notes,
          services: agency.services,
          destinations: agency.destinations,
          tags: agency.tags,
        }
      : {
          address: { city: '', state: '', country: 'India' },
          services: [],
          destinations: [],
          tags: [],
        },
  });

  // Unsaved-changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onSubmit = async (data: CreateAgencyInput) => {
    if (isEdit) {
      await updateMutation.mutateAsync(data as Record<string, unknown>);
      router.push(`/dashboard/agencies/${agency.id}`);
    } else {
      const created = await createMutation.mutateAsync(data as Record<string, unknown>);
      router.push(`/dashboard/agencies/${(created as AgencyDTO).id}`);
    }
    reset();
  };

  const mutError = isEdit ? updateMutation.error : createMutation.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {mutError instanceof Error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{mutError.message}</AlertDescription>
        </Alert>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Agency Name *" error={errors.name?.message}>
            <Input placeholder="Sunrise Travels" error={!!errors.name} {...register('name')} />
          </FormField>
          <FormField label="Legal Name" error={errors.legalName?.message}>
            <Input placeholder="Sunrise Travels Pvt Ltd" {...register('legalName')} />
          </FormField>
          <FormField label="Owner Name *" error={errors.ownerName?.message}>
            <Input
              placeholder="Rahul Sharma"
              error={!!errors.ownerName}
              {...register('ownerName')}
            />
          </FormField>
          <FormField label="Primary Contact" error={errors.primaryContactName?.message}>
            <Input placeholder="Contact person name" {...register('primaryContactName')} />
          </FormField>
          <FormField label="Year Established" error={errors.yearEstablished?.message}>
            <Input type="number" placeholder="2010" {...register('yearEstablished')} />
          </FormField>
          <FormField label="Employee Count" error={errors.employeeCount?.message}>
            <select
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              {...register('employeeCount')}
            >
              <option value="">Select range</option>
              {EMPLOYEE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FormField>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email *" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="info@agency.com"
              error={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <FormField label="Secondary Email" error={errors.secondaryEmail?.message}>
            <Input type="email" placeholder="backup@agency.com" {...register('secondaryEmail')} />
          </FormField>
          <FormField label="Phone *" error={errors.phone?.message}>
            <Input placeholder="+91 9876543210" error={!!errors.phone} {...register('phone')} />
          </FormField>
          <FormField label="Secondary Phone" error={errors.secondaryPhone?.message}>
            <Input placeholder="+91 9876543211" {...register('secondaryPhone')} />
          </FormField>
          <FormField label="WhatsApp" error={errors.whatsapp?.message}>
            <Input placeholder="+91 9876543210" {...register('whatsapp')} />
          </FormField>
          <FormField label="Website" error={errors.website?.message}>
            <Input placeholder="https://agency.com" {...register('website')} />
          </FormField>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Street"
            error={errors.address?.street?.message}
            className="sm:col-span-2"
          >
            <Input placeholder="123 MG Road" {...register('address.street')} />
          </FormField>
          <FormField label="City *" error={errors.address?.city?.message}>
            <Input
              placeholder="Mumbai"
              error={!!errors.address?.city}
              {...register('address.city')}
            />
          </FormField>
          <FormField label="State *" error={errors.address?.state?.message}>
            <Input
              placeholder="Maharashtra"
              error={!!errors.address?.state}
              {...register('address.state')}
            />
          </FormField>
          <FormField label="Country *" error={errors.address?.country?.message}>
            <Input
              placeholder="India"
              error={!!errors.address?.country}
              {...register('address.country')}
            />
          </FormField>
          <FormField label="Postal Code" error={errors.address?.postalCode?.message}>
            <Input placeholder="400001" {...register('address.postalCode')} />
          </FormField>
        </CardContent>
      </Card>

      {/* Business */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="GST Number" error={errors.gstNumber?.message}>
            <Input placeholder="27AAPFU0939F1ZV" {...register('gstNumber')} />
          </FormField>
          <FormField label="PAN Number" error={errors.panNumber?.message}>
            <Input placeholder="AAPFU0939F" {...register('panNumber')} />
          </FormField>
          <FormField label="Notes" error={errors.notes?.message} className="sm:col-span-2">
            <textarea
              rows={3}
              placeholder="Internal notes about this agency…"
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
              {...register('notes')}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Agency'}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label className="text-foreground text-sm font-medium">{label}</label>
      {children}
      {error && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
