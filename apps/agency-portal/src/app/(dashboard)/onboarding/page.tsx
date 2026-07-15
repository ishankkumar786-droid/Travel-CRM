import type { Metadata } from 'next';

import { OnboardingContent } from '@/components/onboarding/OnboardingContent';

export const metadata: Metadata = { title: 'Onboarding' };

export default function OnboardingPage() {
  return <OnboardingContent />;
}
