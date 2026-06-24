# Connect frontend on Hostinger to Supabase

This guide explains how to wire the Hostinger frontend and the Supabase-backed backend together and verify everything works.

Prerequisites
- SSH access to your Hostinger VPS or access to the hPanel Node.js app settings for the site.
- Supabase project admin access to copy the `URL` and `anon` publishable key and to configure Auth/Storage policies.

1) Copy Supabase client values
- In Supabase Dashboard -> Project -> Settings -> API, copy:
  - `Project URL` (use as `NEXT_PUBLIC_SUPABASE_URL`)
  - `anon` (publishable) key (use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

2) Set environment variables on Hostinger
- Option A — hPanel App Settings (recommended when available):
  - Go to hPanel -> Websites -> Manage (your site) -> Node.js / App settings -> Environment variables.
  - Add the following variables and values:
    - `NEXT_PUBLIC_SUPABASE_URL` = (Supabase Project URL)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Supabase anon key)
    - `NEXT_PUBLIC_ENABLE_LIVE_API` = `true`
    - `NEXT_PUBLIC_API_URL` = `https://api.elegantedgeunisexsalon.in/api`

- Option B — SSH / shell (use when you control the VPS directly):
  - SSH into your host: `ssh user@your-vps`.
  - Export variables and run the rebuild helper (the repo includes `deploy/hostinger/rebuild-frontend.sh` which will write `.env.local` and build):

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
export NEXT_PUBLIC_ENABLE_LIVE_API=true
export NEXT_PUBLIC_API_URL="https://api.elegantedgeunisexsalon.in/api"
./deploy/hostinger/rebuild-frontend.sh
```

3) Supabase configuration checklist
- Auth Redirect URLs: In Supabase Dashboard -> Authentication -> Settings -> Redirect URLs, add your site domain(s), e.g. `https://elegantedgeunisexsalon.com` and `https://www.elegantedgeunisexsalon.com`.
- Storage: The backend expects a public `user-uploads` bucket for uploads. Ensure the bucket exists and has public read access.
- Row Level Security (RLS): If RLS is enabled for tables the frontend reads (`services`, `settings`, `reviews`), ensure there's a policy allowing `anon` (public) SELECT where appropriate. Example policy for public reads:

```sql
-- allow public select on services
CREATE POLICY "public_select_services" ON public.services
FOR SELECT USING (true);
```

4) Verify the site
- After the rebuild completes, open your site and visit `/health` (e.g., `https://your-domain/health`) — this page reports whether the Supabase env vars are present and whether the live API flag is enabled.
- Check browser console/network for failed requests (401/403) which usually indicate key/policy issues.

5) Troubleshooting
- `401/403` from Supabase: confirm you used the anon (publishable) key and review RLS/storage policies.
- Missing image URLs: check storage bucket public settings or use signed URLs via Supabase storage API.
- Rebuild not picking env changes: ensure host restarts the Node.js app or use the included `rebuild-frontend.sh` (it restarts pm2 process named `parlor-frontend`).

6) Optional: CI / automation
- You can automate rebuilds from your CI/CD by setting the same env vars in the build environment and running `npm run build` in `frontend/` then deploying the `out/` or starting the production server.

If you want, I can:
- prepare a PR with these docs and an optional small script to print env values on the health page (non-sensitive) so you can verify at runtime, or
- try to run the rebuild script from here if you provide SSH credentials (not recommended — better you run it).

---
File references: `frontend/lib/supabase.js`, `frontend/pages/health.js`, `deploy/hostinger/rebuild-frontend.sh`
