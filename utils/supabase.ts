import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://unqpmwlzyaqrryzyrslf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucXBtd2x6eWFxcnJ5enlyc2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTI5ODUsImV4cCI6MjA2NDE4ODk4NX0.RwDqMBy9ctQzxG9CuVzaUlriK6M5cGycPhQviNQfcxw";


  
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'x-client-info': 'dutuk-frontend@1.0.0',
    },
    fetch: (url, options = {}) => {
      // Add timeout to all requests but increase for email operations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout for email
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});
