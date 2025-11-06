/**
 * Navigation Types for React Native Expo Router
 * 
 * This file contains TypeScript types and interfaces for all navigation routes
 * in the application. It provides type safety for route params and navigation.
 */

import { Href } from 'expo-router';

/**
 * Root Stack Navigator Params
 * Defines all screens available in the root stack navigator
 */
export type RootStackParamList = {
  index: undefined;
  '(tabs)': undefined;
  'auth/UserLogin': undefined;
  'auth/register': undefined;
  'auth/OtpPage': { email?: string };
  'auth/EmailAuth': undefined;
  'auth/callback': undefined;
  'orders': undefined;
  'orders/customerApproval': OrderDetailsParams;
  'orders/customerDetails': OrderDetailsParams;
  event: undefined;
  requests: undefined;
  'requests/menu': undefined;
  profilePages: undefined;
  'profilePages/profile': undefined;
  'profilePages/calender/CalendarPage': undefined;
  public: undefined;
};

/**
 * Bottom Tab Navigator Params
 * Defines the three main tabs in the app
 */
export type TabParamList = {
  home: undefined;
  orders: undefined;
  profile: undefined;
};

/**
 * Order Details Params
 * Used when navigating to order approval or details screens
 */
export interface OrderDetailsParams {
  orderId: string;
  title: string;
  customerName: string;
  packageType: string;
  customerEmail?: string;
  customerPhone?: string;
}

/**
 * Active Tab Type
 * Used by BottomNavigation component (if custom nav is needed)
 */
export type ActiveTab = 'home' | 'orders' | 'profile';

/**
 * Navigation Route Helper
 * Type-safe route strings
 */
export type AppRoute = Href;

/**
 * Order Status Types
 */
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'done';

/**
 * Order Item Interface
 */
export interface OrderItem {
  id: string;
  title: string;
  customerName: string;
  status: OrderStatus;
  date: string;
  time: string;
}