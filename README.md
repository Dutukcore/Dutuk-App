# Dutuk - Event Vendor Management App

> A comprehensive vendor/company management platform for event service providers built with React Native and Expo.

## 📱 What is Dutuk?

**Dutuk** is a mobile application designed for event service vendors (photographers, caterers, decorators, etc.) to manage their business operations efficiently. The app serves as a complete business management solution for vendors to handle customer requests, manage events, track finances, and maintain their service calendar.

### Primary Users
- Event service vendors (photographers, videographers, caterers, decorators, etc.)
- Event management companies
- Freelance event professionals

### Core Purpose
Enable vendors to run their event services business from a mobile app by managing customer requests, events, bookings, payments, and availability calendars.

---

## 🎯 Key Features

### 1. **Authentication & Profile Management**
- Email/Password authentication with OTP verification
- Google OAuth social login
- Company profile management with logo upload
- Document verification system
- Password change functionality

### 2. **Event Management**
- Create and manage events with images
- View events categorized by status:
  - **Upcoming Events**: Future scheduled events
  - **Ongoing Events**: Currently active events
  - **Completed Events**: Past finished events
- Event details include:
  - Event title, description
  - Start and end dates (with validation to prevent past dates)
  - Payment amount
  - Customer information
  - Event images/banners
- Automatic status management (all new events default to "upcoming")

### 3. **Customer Requests**
- Receive and view customer event requests
- Accept or decline requests
- Request count notifications
- Detailed request information view
- Convert accepted requests into events

### 4. **Calendar Management**
- Visual calendar to track availability
- Mark dates as available or booked
- Store and retrieve calendar dates
- Calendar integration with events (marked dates on calendar)
- View upcoming bookings

### 5. **Orders Management**
- View and process customer orders
- Order approval workflow
- Customer details for each order
- Order history tracking

### 6. **Financial Tracking**
- Track earnings from completed events
- Payment history and records
- Revenue analytics
- Past payments overview

### 7. **Reviews & Ratings**
- View customer reviews
- Review history
- Rating management

### 8. **Messaging & Support**
- In-app chat support
- Customer messaging
- Communication history

### 9. **Image Management**
- Upload company logos
- Upload event images and banners
- Image manipulation (crop, resize)
- Supabase storage integration

---

## 🛠 Tech Stack

### Frontend/Mobile
- **Framework**: React Native (v0.81.5)
- **Platform**: Expo (v54.0.21)
- **Language**: TypeScript (v5.9.2)
- **Navigation**: Expo Router (v6.0.14)
- **UI Components**: 
  - React Native core components
  - @expo/vector-icons for icons
  - react-native-calendars for calendar views
  - react-native-toast-message for notifications
  - react-native-gifted-chat for messaging

### Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Real-time**: Supabase Realtime (for requests, orders, events)

### Key Libraries
- `@supabase/supabase-js` - Backend integration
- `expo-image-picker` - Image selection
- `expo-image-manipulator` - Image processing
- `react-native-safe-area-context` - Safe area handling
- `react-native-reanimated` - Animations
- `react-native-webview` - Web content rendering

---

## 📁 Project Structure

```
/app
├── /app                          # Main application code
│   ├── /(tabs)                   # Bottom tab navigation screens
│   │   ├── home.tsx             # Home dashboard with events overview
│   │   ├── orders.tsx           # Orders management screen
│   │   └── profile.tsx          # User profile screen
│   ├── /auth                     # Authentication screens
│   │   ├── EmailAuth.tsx        # Email authentication
│   │   ├── OtpPage.tsx          # OTP verification
│   │   ├── UserAuth.tsx         # Main auth screen
│   │   ├── UserLogin.tsx        # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── /event                    # Event management
│   │   ├── /manage              # Event CRUD operations
│   │   │   └── create.tsx       # Create new event
│   │   ├── currentEvents.tsx    # Ongoing events list
│   │   ├── upcomingEvents.tsx   # Future events list
│   │   ├── pastEvents.tsx       # Completed events list
│   │   └── index.tsx            # All events overview
│   ├── /orders                   # Orders management
│   │   ├── customerApproval.tsx # Approve customer orders
│   │   └── customerDetails.tsx  # Order details view
│   ├── /requests                 # Customer requests
│   │   ├── menu.tsx             # Requests list
│   │   └── seperateRequest.tsx  # Individual request view
│   └── /profilePages            # Profile & settings
│       ├── /calender            # Calendar management
│       ├── /message             # Messaging system
│       ├── /profileSettings     # User settings
│       ├── editProfile.tsx      # Edit profile
│       ├── historyScreen.tsx    # History overview
│       └── chatSupport.tsx      # Support chat
├── /hooks                        # Custom React hooks
│   ├── /companyRequests         # Request-related hooks
│   ├── authHelpers.ts           # Authentication utilities
│   ├── createEvent.ts           # Create event hook
│   ├── getAllEvents.ts          # Fetch all events
│   ├── useImageUpload.ts        # Image upload hook
│   ├── useOrders.ts             # Orders management hook
│   └── [other hooks...]         # Various data management hooks
├── /utils                        # Utility functions
│   └── supabase.ts              # Supabase client configuration
├── /assets                       # Static assets (images, fonts)
├── /constants                    # App constants
│   └── Typography.ts            # Typography definitions
└── package.json                  # Dependencies and scripts
```

---

## 🗄 Database Schema

### Core Tables

1. **companies**
   - Vendor company profiles
   - Company name, description, logo, contact info
   - Linked to user via `user_id`

2. **events**
   - Event records with details
   - Fields: `id`, `event`, `description`, `start_date`, `end_date`, `status`, `payment`, `image_url`, `banner_url`
   - Status values: `upcoming`, `ongoing`, `completed`, `cancelled`

3. **requests**
   - Customer event requests
   - Request details, dates, status
   - Linked to vendors via `company_id`

4. **orders**
   - Customer orders requiring approval
   - Order details and approval status

5. **dates**
   - Vendor calendar availability
   - Available vs. booked dates

6. **payments**
   - Payment transaction records
   - Amount, date, status

7. **earnings**
   - Vendor earnings tracking

8. **reviews**
   - Customer reviews and ratings

9. **user_profiles**
   - Extended user information

### Security
- **Row Level Security (RLS)** enabled on all tables
- User-specific data isolation
- Authenticated access required

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dutuk_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   - Ensure `/app/utils/supabase.ts` has correct credentials
   - Supabase URL: `https://unqpmwlzyaqrryzyrslf.supabase.co`
   - Anon key should be set in the file

4. **Run the app**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

### Environment Setup
The app uses Supabase configuration from `/app/utils/supabase.ts`. No additional `.env` file needed for basic setup.

---

## 📱 Key User Flows

### 1. Vendor Registration & Onboarding
```
Register → Email Verification → Company Profile Setup → Calendar Setup → Ready to Accept Requests
```

### 2. Event Creation Flow
```
Home → Create Event → Upload Image → Enter Details (Title, Description, Payment, Dates) → Save → Event Created with "upcoming" status
```

### 3. Request Management Flow
```
Receive Request → View Details → Accept/Decline → If Accepted → Convert to Event → Add to Calendar
```

### 4. Order Processing Flow
```
View Orders → Select Order → Review Details → Approve/Reject → Update Status → Notify Customer
```

---

## 🔒 Data Validation Rules

### Event Creation
- ✅ Event title is required
- ✅ Event image is required
- ✅ Start date is optional but cannot be in the past
- ✅ End date is optional but must be after start date
- ✅ Payment amount is required (default: 0)
- ✅ Status is auto-set to "upcoming"

### Date Validation
- ✅ Past dates cannot be selected for new events
- ✅ End date must be greater than or equal to start date
- ✅ Date format: YYYY-MM-DD

---

## 🎨 UI/UX Features

- **Safe Area Handling**: Proper handling of notches and system UI
- **Pull-to-Refresh**: Refresh data by pulling down on lists
- **Loading States**: Activity indicators for async operations
- **Toast Notifications**: User-friendly success/error messages
- **Image Loading**: Smooth image loading with placeholders
- **Responsive Design**: Adapts to different screen sizes
- **Icon System**: Ionicons for consistent iconography

---

## 🔐 Authentication & Security

- **Email/Password**: Traditional email-based authentication
- **OTP Verification**: Email OTP for secure verification
- **Google OAuth**: Social login integration
- **Session Management**: Automatic session handling via Supabase
- **Secure Storage**: AsyncStorage for local data
- **Row Level Security**: Database-level security policies

---

## 🧩 Custom Hooks (API Layer)

### Authentication Hooks
- `useRegisterUser()` - User registration
- `useLoginUser()` - User login
- `useLogoutUser()` - User logout
- `useSendOTP()` - Send OTP
- `useVerifyOTP()` - Verify OTP
- `useGoogleAuth()` - Google authentication

### Event Hooks
- `createEvent()` - Create new event
- `getAllEvents()` - Fetch all events
- `getUpcomingEvents()` - Fetch upcoming events
- `getCurrentEvents()` - Fetch ongoing events
- `getPastEvents()` - Fetch completed events
- `updateEvent()` - Update event details
- `deleteEvent()` - Delete event

### Request Hooks
- `getRequests()` - Fetch customer requests
- `getRequestsCount()` - Get request count
- `acceptCustomerOffer()` - Accept a request
- `removeRequestFromId()` - Decline a request

### Other Hooks
- `useImageUpload()` - Handle image selection and upload
- `useOrders()` - Manage orders
- `useCompanyInfo()` - Company profile management
- `useStoreDates()` - Calendar date management
- `getPastPayments()` - Payment history
- `getPastReviews()` - Review history

---

## 📊 Feature Status

### ✅ Completed Features
- Authentication (Email, OTP, Google)
- Event management (Create, Read, Update, Delete)
- Customer request handling
- Calendar integration
- Order processing
- Image upload system
- Profile management
- Date validation
- Real-time notifications

### 🚧 Future Enhancements (if needed)
- Analytics dashboard
- Advanced filtering
- Export reports
- Push notifications
- Multi-language support
- Dark mode

---

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Check internet connection
   - Verify Supabase credentials in `/app/utils/supabase.ts`
   - Ensure Supabase project is active

2. **Image Upload Failures**
   - Check Supabase storage buckets are created: `company-logos`, `event-images`
   - Verify bucket permissions are set to public
   - Check file size limits

3. **Authentication Issues**
   - Clear app cache and restart
   - Verify email in Supabase Auth dashboard
   - Check RLS policies are enabled

4. **Calendar Not Showing Events**
   - Ensure events have valid `start_date` in YYYY-MM-DD format
   - Check date timezone handling
   - Verify events are fetched successfully

---

## 📚 For AI Assistants & Developers

### Quick Context
This is a **React Native mobile app** (not a web app) built with **Expo** and **TypeScript**. It uses **Supabase** as the backend (BaaS - Backend as a Service), so there are no separate backend API files - all database operations are done through Supabase client hooks.

### Key Points for Development
- **No separate backend server**: Everything is handled via Supabase
- **File-based routing**: Using Expo Router (similar to Next.js)
- **No REST APIs to create**: Use Supabase hooks for data operations
- **Image handling**: Uses Expo image picker + Supabase storage
- **State management**: React hooks and local state (no Redux/MobX)
- **Real-time updates**: Supabase Realtime for live data

### When Making Changes
- Always validate dates to prevent past dates
- Maintain data consistency between events, requests, and calendar
- Use Toast notifications for user feedback
- Handle loading states properly
- Test on both iOS and Android if possible
- Ensure image uploads work before allowing event creation

### Code Patterns
- Hooks are in `/hooks` directory
- Screens are in `/app` directory (file-based routing)
- Supabase client is in `/utils/supabase.ts`
- Constants are in `/constants` directory
- All async operations should have try-catch blocks
- Use ActivityIndicator for loading states
- Use Toast for success/error messages

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Support

For issues or questions, use the in-app chat support feature or contact the development team.

---

**Last Updated**: 2025
**Version**: 1.0.0
**Platform**: React Native (Expo)
**Backend**: Supabase