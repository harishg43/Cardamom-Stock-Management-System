# Cardamom Web App

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

For GitHub Pages, configure repository Actions variables/secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The included deployment workflow passes them into `npm run build`; Vite replaces them in the hosted JavaScript bundle.

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

Android and Capacitor files have been removed from this project.

