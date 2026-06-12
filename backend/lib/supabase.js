const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isPlaceholderSupabaseConfig = () => {
  const url = (supabaseUrl || '').toLowerCase();
  const key = (supabaseServiceRoleKey || '').toLowerCase();
  return url.includes('example.supabase.co') || key.includes('service_role_dev_key') || key.includes('changeme');
};

const isDemoMode = () => process.env.NODE_ENV !== 'production' && (process.env.USE_DEMO_AUTH === 'true' || isPlaceholderSupabaseConfig());

const createDemoUser = (email = 'owner@demo.local') => ({
  id: 'demo-owner',
  name: 'Demo Owner',
  email,
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const createDemoAuthResponse = (email = 'owner@demo.local') => {
  const user = createDemoUser(email);
  const token = require('jsonwebtoken').sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  return { token, user: toApiUser(user) };
};

const missingSupabaseClient = new Proxy(
  {},
  {
    get() {
      throw new Error(
        'Supabase backend is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env before starting the server.'
      );
    },
  }
);

const supabase = isDemoMode()
  ? null
  : supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : missingSupabaseClient;

const toApiUser = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toApiService = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    duration: row.duration,
    category: row.category,
    categoryLabel: row.category_label,
    audience: row.audience,
    categoryVideoUrl: row.category_video_url,
    image: row.image,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    featured: row.featured,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toApiBooking = (row, serviceRow = null) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    service: serviceRow ? toApiService(serviceRow) : null,
    serviceId: row.service_id,
    bookingDate: row.booking_date,
    bookingTime: row.booking_time,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toApiReview = (row, serviceRow = null) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    rating: row.rating,
    comment: row.comment,
    service: serviceRow ? toApiService(serviceRow) : null,
    serviceId: row.service_id,
    image: row.image,
    approved: row.approved,
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toApiSettings = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    parlorName: row.parlor_name,
    parlorDescription: row.parlor_description,
    parlorLogoUrl: row.parlor_logo_url,
    heroVideoUrl: row.hero_video_url,
    heroImageUrl: row.hero_image_url,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroCtaText: row.hero_cta_text,
    discountText: row.discount_text,
    offerBanner: row.offer_banner,
    whyUsTitle: row.why_us_title,
    whyUsDescription: row.why_us_description,
    whyUsPoints: row.why_us_points,
    whyUsMediaUrl: row.why_us_media_url,
    whyUsMediaType: row.why_us_media_type,
    whyUsSignatureDetail: row.why_us_signature_detail,
    customizeCtaText: row.customize_cta_text,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactAddress: row.contact_address,
    locationsText: row.locations_text,
    socialLinks: row.social_links,
    workingHours: row.working_hours,
    updatedAt: row.updated_at,
  };
};

const fromApiSettings = (settings) => ({
  id: 1,
  parlor_name: settings.parlorName,
  parlor_description: settings.parlorDescription,
  parlor_logo_url: settings.parlorLogoUrl,
  hero_video_url: settings.heroVideoUrl,
  hero_image_url: settings.heroImageUrl,
  hero_title: settings.heroTitle,
  hero_subtitle: settings.heroSubtitle,
  hero_cta_text: settings.heroCtaText,
  discount_text: settings.discountText,
  offer_banner: settings.offerBanner,
  why_us_title: settings.whyUsTitle,
  why_us_description: settings.whyUsDescription,
  why_us_points: settings.whyUsPoints,
  why_us_media_url: settings.whyUsMediaUrl,
  why_us_media_type: settings.whyUsMediaType,
  why_us_signature_detail: settings.whyUsSignatureDetail,
  customize_cta_text: settings.customizeCtaText,
  contact_email: settings.contactEmail,
  contact_phone: settings.contactPhone,
  contact_address: settings.contactAddress,
  locations_text: settings.locationsText,
  social_links: settings.socialLinks,
  working_hours: settings.workingHours,
  updated_at: new Date().toISOString(),
});

const uploadToBucket = async (bucket, path, body, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, body, {
      upsert: true,
      contentType,
    });

  if (error) {
    throw error;
  }

  return data;
};

const handleSupabaseError = (error, fallbackMessage = 'Database request failed') => {
  const message = error?.message || fallbackMessage;
  const status = error?.status || 500;
  return { message, status };
};

module.exports = {
  createDemoAuthResponse,
  createDemoUser,
  fromApiSettings,
  handleSupabaseError,
  isDemoMode,
  toApiBooking,
  toApiReview,
  toApiService,
  toApiSettings,
  supabase,
  uploadToBucket,
  toApiUser,
};