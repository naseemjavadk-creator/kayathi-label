# Put KAYATHI LABEL online with Vercel

Vercel cannot take a .zip file directly. Use GitHub (easiest, no coding):

## 1. Put the files on GitHub
1. Unzip this file on your computer.
2. Go to https://github.com and create a free account, then click **New repository**.
   Name it `kayathi-label`, choose **Private**, click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Open the unzipped `kayathi-label` folder, select everything inside it (all folders and files,
   not the folder itself) and drag it into the GitHub page. Wait for the upload to finish.
   Make sure the folders `app`, `components`, `lib`, `public`, `supabase` are all there.
5. Click **Commit changes**.

## 2. Deploy on Vercel
1. Go to https://vercel.com, sign up with GitHub, click **Add New > Project**.
2. Choose the `kayathi-label` repository and click **Import**. Leave the framework as **Next.js**.
3. Open **Environment Variables** and add these three (names exactly as written):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://srhhekxjnfnudzgqibwj.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaGhla3hqbmZudWR6Z3FpYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDUzMzUsImV4cCI6MjEwOTM4MTMzNX0.5sZn_z1AFoBOvHv_uRZw5cZddl1t1xH7aYsY4nhFhcY |
| `NEXT_PUBLIC_SITE_URL` | `https://kayathi-label.vercel.app` (change it in step 4 if Vercel gives a different address) |

4. Click **Deploy**. When it finishes, Vercel shows your website address.
   If it differs from the one above, go to **Settings > Environment Variables**, edit
   `NEXT_PUBLIC_SITE_URL` to the real address (no slash at the end), then **Deployments > Redeploy**.

If the deploy fails, open the failed deployment, copy the red error text and send it to Claude.

## 3. After it is live
1. Open `your-address/admin/login` and sign in with the owner email and password you made in Supabase.
2. In Supabase: **Authentication > URL Configuration**, set **Site URL** to your website address.
3. In Supabase: **Authentication > Providers > Email**, turn OFF "Allow new users to sign up".
4. In the dashboard add products, then run through TEST-CHECKLIST.md on your phone.
5. Later, a custom domain: Vercel > Settings > Domains.

Never share the Supabase "service_role" key. This site does not use it.
