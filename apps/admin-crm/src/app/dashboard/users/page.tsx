import type { Metadata } from 'next';

import { UsersPage } from '@/components/users/UsersPage';

export const metadata: Metadata = { title: 'Users' };

export default function Page() {
  return <UsersPage />;
}
