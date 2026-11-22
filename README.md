# Gurusamy Cardamom Management System

This project is a web-only React + Vite application for managing cardamom stock records.

Commands:

- `npm run dev` starts the local development server.
- `npm run build` creates the production build in `dist`.
- `npm run preview` previews the production build locally.

The application runs entirely in the browser and uses `public/cardamom.jpeg` as the background image.

## Supabase environment setup

For local development, copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Restart `npm run dev` after changing `.env`.

## Secure first Super Admin setup

## Deploy the manage-users Edge Function

Link and deploy the function from the project directory:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy manage-users --no-verify-jwt
```

Set these secrets in **Supabase Dashboard → Edge Functions → manage-users → Secrets**:

- `SUPABASE_SERVICE_ROLE_KEY`
- `FIRST_SUPER_ADMIN_SETUP_SECRET`

Do not put either secret in Vite variables or repository files.

After running the RBAC migration and deploying the `manage-users` Edge Function,
configure this server-only Supabase Edge Function secret:

- `FIRST_SUPER_ADMIN_SETUP_SECRET`

Choose a strong random value and keep it outside source control and outside
the Vite frontend. Call the setup action once with the secret in the request
header:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/manage-users" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "x-setup-secret: $FIRST_SUPER_ADMIN_SETUP_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"setup","name":"Project Owner","email":"owner@example.com","password":"replace-with-a-strong-password"}'
```

The setup endpoint creates only one Super Admin and refuses all later setup calls.
Admin and regular User accounts must be created through the authenticated app
flow or the `manage-users` Edge Function. Do not add the setup secret or
service-role key to Vite environment variables.

## Initial account bootstrap

After RBAC migration, use `supabase/bootstrap_initial_accounts.sql` in the
Supabase SQL editor if the three Auth users already exist:

- `harishhari3291@gmail.com` — Super Admin
- `8270153291@user.local` — Admin
- `9961153291@user.local` — User

Set or reset passwords in Supabase Dashboard > Authentication > Users. Do not
write passwords into SQL migration or backup scripts.

## Database backup and reset

Before any reset, run `supabase/backup_before_reset.sql` in the Supabase SQL
editor and verify the `reset_backup_20261122` schema. The destructive
`supabase/reset_after_confirmation.sql` script is disabled until the project
owner explicitly confirms it. Do not run it without a complete backup and
approval.

For GitHub Pages, configure repository Actions variables/secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The included deployment workflow passes them into `npm run build`; Vite replaces them in the hosted JavaScript bundle.

## Cloudflare Workers deployment

The repository includes `wrangler.toml` and `.github/workflows/deploy-workers.yml`.
Add these GitHub Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_APP_UPDATE_MANIFEST_URL` (optional)

The workflow builds Vite with the Supabase values before deploying `dist` to the Worker.
Run the workflow manually once from the Actions tab after adding the secrets.

## WhatsApp, SMS, and PDF setup

1. Run both SQL migration files in the Supabase SQL editor:
   - `supabase/rbac_migration.sql`
   - `supabase/notification_reports_migration.sql`
2. Deploy the notification Edge Function:
   - `supabase/functions/send-stock-notifications/index.ts`
3. In Supabase Dashboard, set these Edge Function secrets:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `MSG91_AUTH_KEY`
   - `MSG91_SENDER_ID`
   - `MSG91_TEMPLATE_ID`
4. Configure approved WhatsApp and DLT-approved SMS templates and consent values in the `profiles`, `notification_settings`, and `message_templates` database tables.

WhatsApp delivery uses the Meta WhatsApp Cloud API. Register a Meta business account, a WhatsApp Business phone number, approved message templates, and a permanent access token. SMS delivery uses MSG91; register the sender ID, DLT content template, and approved template ID with TRAI-compliant Indian mobile numbers.

No provider credentials are stored in the React app or in `VITE_*` environment variables. A notification is triggered only after the Supabase stock insert succeeds. WhatsApp and SMS are attempted independently and delivery state is stored in `public.message_history`.
No notification content or notification counters are displayed in the application dashboard.

## Android / APK build

The existing React, Supabase, authentication, roles, and database data are shared by both the website and Android app.

From the project folder, run these commands one at a time:

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
The debug APK will be written to:

`android/app/build/outputs/apk/debug/app-debug.apk`

Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` or `.env.production` for local builds. Never add a Supabase service-role or secret key to Vite environment variables.

