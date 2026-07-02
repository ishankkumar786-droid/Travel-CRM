import { redirect } from 'next/navigation';

/**
 * Root page redirects to login.
 * AuthProvider on the login page will redirect to /dashboard if already authenticated.
 */
export default function RootPage() {
  redirect('/login');
}
