import { createClient } from '@supabase/supabase-js';

// Create Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Auth helpers
export const auth = {
  // Get current auth session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Register new user
  register: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
      });
    }

    return data;
  },

  // Login
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current user with profile
  getCurrentUserProfile: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;
    return { ...user, ...profile };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Services helpers
export const services = {
  // Get all active services
  getAll: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category');
    if (error) throw error;
    return data;
  },

  // Get services by category
  getByCategory: async (category) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // Get all categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true)
      .order('category');
    if (error) throw error;
    return [...new Set(data.map(s => s.category))];
  },

  // Get single service
  getById: async (id) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Admin: Create service
  create: async (serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Admin: Update service
  update: async (id, serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Admin: Delete service
  delete: async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Bookings helpers
export const bookings = {
  // Create booking
  create: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Get all (user's own bookings)
  getAll: async () => {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(name, category, price)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get single booking
  getById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(name, category, price), reviews(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Admin: Get all bookings
  getAllAdmin: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, users(email, full_name, phone), services(name, price)')
      .order('booking_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Update booking status
  updateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Delete booking
  delete: async (id) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Reviews helpers
export const reviews = {
  // Create review
  create: async (reviewData) => {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...reviewData, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Get reviews for service
  getForService: async (serviceId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, bookings(service_id)')
      .eq('bookings.service_id', serviceId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get reviews for booking
  getForBooking: async (bookingId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(full_name)')
      .eq('booking_id', bookingId);
    if (error) throw error;
    return data;
  },
};

// Settings helpers
export const settings = {
  // Get setting
  get: async (key) => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || null;
  },

  // Set setting (admin only)
  set: async (key, value) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select();
    if (error) throw error;
    return data[0];
  },
};

// Storage helpers
export const storage = {
  // Upload file
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return data;
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl;
  },

  // Delete file
  delete: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  },
};

// Export for use in components
export default supabase;
