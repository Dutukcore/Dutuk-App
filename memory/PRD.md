# Dutuk PRD

## Problem
Fix onboarding flow - screens existed but weren't integrated, logout redirects inconsistent, no loading state in callback.

## Implemented (Jan 2026)
- ✅ Integrated OnboardingGetStarted → OnboardingLocation → Home flow
- ✅ Fixed logout redirects (both → `/` Welcome screen)
- ✅ Added loading indicator to auth callback
- ✅ Onboarding saves company name/location to Supabase

## Next Tasks
- Add route guards for protected routes
- Add onboarding_completed flag to database
