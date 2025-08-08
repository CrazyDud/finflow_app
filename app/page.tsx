"use client";

import { Dashboard } from '@/components/dashboard/dashboard';
import { MainLayout } from '@/components/layout/main-layout';
import { useEffect } from 'react';
import { useOnboarding, type OnboardingStep } from '@/components/shared/onboarding/OnboardingProvider';

export default function HomePage() {
  // Steps are initialized inside Dashboard; nothing extra here.
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
