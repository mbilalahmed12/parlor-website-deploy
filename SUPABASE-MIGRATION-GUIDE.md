# Supabase Migration Guide - Complete

## What Was Done

✅ Created Supabase setup guide with database schema  
✅ Installed @supabase/supabase-js in frontend  
✅ Created `lib/supabase.js` with all helper functions  
✅ Updated Zustand auth store to use Supabase  
✅ Enhanced `_app.js` with auth state listener  
✅ Created `.env.local.example` template  
✅ Removed axios dependency (replaced with Supabase client)  

## What You Need to Do

### Step 1: Setup Supabase Project (One-time)

Follow instructions in `SUPABASE-SETUP.md`:
1. Create Supabase account at supabase.com
2. Create new project
3. Get API credentials
4. Run database schema SQL
5. Setup storage buckets
6. Add your .env.local variables

### Step 2: Update Admin Components

Replace the admin component API calls. Here's the pattern:

**OLD (with axios):**
```javascript
import { servicesAPI } from '@/lib/api';

const data = await servicesAPI.getAll();
```

**NEW (with Supabase):**
```javascript
import { services } from '@/lib/supabase';

const data = await services.getAll();
```

### Step 3: Update Each Admin Component

Components to update:
- `components/admin/Services.js` → Use `services` helpers
- `components/admin/Bookings.js` → Use `bookings` helpers
- `components/admin/Reviews.js` → Use `reviews` helpers
- `components/admin/Settings.js` → Use `settings` helpers
- `components/admin/Owner.js` → Use `auth` helpers

See `SUPABASE-COMPONENT-EXAMPLES.md` for a complete Services example.

### Step 4: Handle File Uploads

For any image/file uploads (service images, profile photos):

**Pattern:**
```javascript
import { storage } from '@/lib/supabase';

// Upload file
const { data, error } = await storage.upload('service-images', 'filename.jpg', file);

// Get public URL
const publicUrl = storage.getPublicUrl('service-images', 'filename.jpg');
```

See `SUPABASE-COMPONENT-EXAMPLES.md` for upload example.

### Step 5: Customer Pages (Pages that read data)

Update pages like `pages/services/[category].js`:

```javascript
import { services } from '@/lib/supabase';

export default function ServicePage({ services }) {
  // Already fetched on server-side
}

export async function getServerSideProps({ params }) {
  const data = await services.getByCategory(params.category);
  return { props: { services: data } };
}
```

### Step 6: Booking Page

Update `pages/booking.js`:

```javascript
import { bookings, services } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function Booking() {
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const booking = await bookings.create({
      user_id: user.id,
      service_id: selectedService.id,
      booking_date: new Date(selectedDate),
      customer_name: user.full_name,
      customer_phone: user.phone,
      customer_email: user.email,
      status: 'pending',
    });
    
    toast.success('Booking created!');
  };
}
```

### Step 7: Remove Backend Express Server

Once all frontend pages are updated and tested:

1. Delete `/backend` folder (no longer needed)
2. Delete backend deployment configs
3. Keep only frontend for deployment
4. Deploy frontend to Vercel

### Step 8: Deployment

**Before deploying:**
1. Test locally with your `.env.local` file
2. Run `npm install` to get Supabase client
3. Test all functionality

**To deploy to Vercel:**
```bash
cd frontend
vercel --prod
```

Add Supabase environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## API Reference

### Auth
```javascript
await auth.register(email, password, fullName)
await auth.login(email, password)
await auth.logout()
await auth.getCurrentUser()
await auth.getCurrentUserProfile()
```

### Services
```javascript
await services.getAll()
await services.getByCategory(category)
await services.getCategories()
await services.getById(id)
await services.create(data)      // Admin only
await services.update(id, data)  // Admin only
await services.delete(id)        // Admin only
```

### Bookings
```javascript
await bookings.create(data)
await bookings.getAll()           // Current user's bookings
await bookings.getById(id)
await bookings.getAllAdmin()      // All bookings (admin only)
await bookings.updateStatus(id, status)
await bookings.delete(id)
```

### Reviews
```javascript
await reviews.create(data)
await reviews.getForService(serviceId)
await reviews.getForBooking(bookingId)
```

### Settings
```javascript
await settings.get(key)
await settings.set(key, value)    // Admin only
```

### Storage
```javascript
await storage.upload(bucket, path, file)
storage.getPublicUrl(bucket, path)
await storage.delete(bucket, path)
```

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] User can view services
- [ ] User can create booking
- [ ] Admin can login
- [ ] Admin can view all bookings
- [ ] Admin can update booking status
- [ ] Admin can create/edit/delete services
- [ ] File uploads work
- [ ] App works after refresh (hydrate)

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL"**
- Add `.env.local` file with Supabase credentials
- Copy from `.env.local.example`

**"Auth state not persisting"**
- Supabase handles this automatically
- Clear browser cache if having issues
- Check that hydrate() is called in _app.js

**"Permission denied errors"**
- Check RLS policies in Supabase dashboard
- Ensure user role is set correctly
- Test with admin user first

**"File uploads fail"**
- Check bucket exists in Supabase Storage
- Check bucket policies allow public upload
- Verify file size is under 1GB limit

## Support

For Supabase docs: https://supabase.com/docs
For Next.js + Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
