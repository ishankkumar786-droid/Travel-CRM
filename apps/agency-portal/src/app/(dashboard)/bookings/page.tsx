import type { Metadata } from 'next';

import { BookingsContent } from '@/components/bookings/BookingsContent';

export const metadata: Metadata = { title: 'Bookings & Enquiries' };

export default function BookingsPage() {
  return <BookingsContent />;
}
