import WelcomeScreen from "@/features/auth/components/WelcomeScreen";
import logger from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';
import { useVendorStore } from '@/store/useVendorStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useShallow } from 'zustand/react/shallow';

/**
 * Landing screen – reads auth state from the Zustand store (single source of truth).
 * The store's onAuthStateChange listener (in useAuthStore.initialize) handles all
 * auth transitions; this screen simply reacts to the resulting state changes.
 */
export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { company, companyLoading } = useVendorStore(
    useShallow((s) => ({
      company: s.company,
      companyLoading: s.companyLoading,
    }))
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        // 1. Hard signal: the just-registered flag.
        const isNewUser = await AsyncStorage.getItem('isNewUserSignup');

        // 2. Soft signal: fetch the companies row to determine completeness.
        const { useVendorStore } = await import('@/store/useVendorStore');
        await useVendorStore.getState().fetchCompany();
        if (cancelled) return;
        const company = useVendorStore.getState().company;

        const onboardingIncomplete =
          !company ||
          !company.company ||
          company.company === 'My Company' ||
          company.company === 'New Vendor' ||
          !(company as any).category ||
          ((company as any).category?.length ?? 0) === 0;

        if (isNewUser === 'true' || onboardingIncomplete) {
          // Note: do NOT remove the flag here — let the final onboarding step
          // remove it after success, so a kill-resume mid-flow stays in onboarding.
          logger.log('Routing to onboarding (flag=' + isNewUser + ', incomplete=' + onboardingIncomplete + ')');
          router.replace('/auth/OnboardingGetStarted');
        } else {
          // Clean stale flag if any.
          if (isNewUser) await AsyncStorage.removeItem('isNewUserSignup');
          logger.log('User logged in with complete onboarding, routing to home');
          router.replace('/(tabs)/home');
        }
      } catch (e) {
        logger.warn('Index routing fallback to home:', e);
        router.replace('/(tabs)/home');
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, isLoading, router]);

  // While initialising show nothing (splash screen is still up)
  if (isLoading) return null;

  // Authenticated users are being redirected above; show welcome to guests
  if (isAuthenticated) return null;

  return <WelcomeScreen />;
}
