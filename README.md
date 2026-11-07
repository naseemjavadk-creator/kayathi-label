# KAYATHI LABEL website

Next.js 14 + Tailwind CSS + Supabase (database, login, image storage).
Customers browse and order through WhatsApp. The owner manages everything from `/admin`.

> **Status:** the code was written without being able to install or run it. Follow
> `TEST-CHECKLIST.md` after setup and report anything that fails.

---

## 1. Install

You need Node.js 18.17 or newer (https://nodejs.org).

```bash
cd kayathi-label
npm install
```

## 2. Supabase project

**Already done for you:** the database, security rules, image bucket and starting categories were created in your Supabase project, and `.env.local` is filled in. Skip to step 4. (The steps below are kept in case you ever need to set it up again.)

### Setting up from scratch

1. Go to https://supabase.com, create a free account and a **New project**. Save the database password.
2. Open **SQL Editor > New query**, paste the whole of `supabase/schema.sql`, click **Run**.
   This creates the tables, security rules, the `media` image bucket, your categories and a few sample products.
3. Open **Project Settings > API** and copy the **Project URL** and the **anon public** key.

## 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **anon public** key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your real domain when live |

Never add the `service_role` key anywhere. This project does not need it.

## 4. Create the owner account (securely)

1. In Supabase open **Authentication > Users > Add user > Create new user**.
   Use `kayathilabel@gmail.com`, choose a long unique password, tick **Auto Confirm User**.
2. In **Authentication > Providers > Email**, turn **off** "Allow new users to sign up".
   This stops anyone else creating accounts.
3. In **SQL Editor** run, replacing the email if different:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'kayathilabel@gmail.com';
   ```
   Only accounts listed in `admin_users` get owner access. The database enforces this, not just the website.

## 5. Run locally

```bash
npm run dev
```

- Website: http://localhost:3000
- Owner login: http://localhost:3000/admin/login

## 6. First things to do in the dashboard

1. **Logo:** your original logo is already included (`public/brand/logo-on-burgundy.png`, only the empty margin cropped) and is shown on the burgundy header and footer. To replace it later, use **Website > Logo**.
2. **Website > Business information:** check WhatsApp, email, phone and Instagram. Add the shop address and opening hours when you have them.
   Until an address is added, the Contact page shows no map and no address.
3. **Website > Homepage banners:** upload your saree banner photos.
4. **Products:** delete the `SAMPLE-` products and add your real ones with photos.

## 7. Deploy online (Vercel)

1. Put the project in a GitHub repository (`.env.local` is already ignored by git).
2. At https://vercel.com choose **Add New > Project**, import the repository.
3. Under **Environment Variables** add the three variables from step 3, using your real domain for `NEXT_PUBLIC_SITE_URL`.
4. Click **Deploy**. Then add your domain under **Settings > Domains**.
5. In Supabase, **Authentication > URL Configuration**, set **Site URL** to your domain.

## 8. Managing the shop after launch

Sign in at `yourdomain.com/admin/login` on a phone or laptop.

- **Products:** add, edit, delete, upload several photos, set the cover photo, price, original price (shows the discount), sizes, colours, labels.
- **Categories:** add or rename categories and subcategories. The "Product details" choice decides which extra fields (fabric, material, ring type…) appear on products.
- **Inventory:** update stock quickly. Stock 0 marks a product out of stock automatically, and ordering is disabled for it. Adding stock again makes it available.
- **Website:** banners, logo, contact details, About us text, Instagram images.

Changes appear on the public website straight after saving.

## Fun zone and animations

The site has a Fun zone (`/play`): a style quiz, a spin-the-wheel that suggests a collection, and a colour-match game. There are no prizes or discounts. The opening logo screen, sparkles and scroll animations are switched off automatically for visitors who use "reduce motion".

## How security works

- Visitors use the public key and can only **read** published products and site info. Write access is removed at the database level (Row Level Security).
- Writes need a signed-in user who is listed in `admin_users`. This is checked by the database on every request.
- `/admin` pages are also protected by middleware and a server-side check.
- Photo uploads: JPG, PNG and WebP only, 5 MB maximum, checked in the browser and enforced by the storage bucket. Only the owner can upload or delete.
- Products set to "not visible" are hidden from visitors.

## Notes and limits

- The Instagram section uses images you upload yourself (no Instagram API connection). Each links to your post or profile.
- No online payment, by design. WhatsApp opening does not mean an order is confirmed, and the site says so.
- The shop address is never invented. Add it in Website settings.
- The `wa.me` link opens the WhatsApp app on phones and WhatsApp Web or Desktop on computers.
