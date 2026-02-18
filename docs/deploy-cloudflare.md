# Beginner's Guide: Deploying Swedish Camp Command to Cloudflare

This guide provides a step-by-step walkthrough for deploying a **Test (Staging) Environment** for the Swedish Camp Command application. 

> [!NOTE]
> This guide assumes you have a Cloudflare account and have pushed your code to a GitHub repository.

---

## 1. Create a Staging Branch (Optional but Recommended)
To keep your production and test environments separate, it is best to create a dedicated "staging" branch.

1. Open your terminal in the project folder.
2. Run: `git checkout -b staging`
3. Run: `git push origin staging`

---

## 2. Connect to Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, click **Workers & Pages**.
3. Click the **Create application** button.
4. Select the **Pages** tab and click **Connect to Git**.
5. Select your GitHub repository and click **Begin setup**.

---

## 3. Configure Build Settings
Cloudflare will ask for build configurations. Use these exact settings:

- **Project Name**: `swedish-camp-command-test` (or similar)
- **Production Branch**: `staging` (this ensures this project is for testing)
- **Framework Preset**: `Next.js`
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Build Output Directory**: `.vercel/output/static`
- **Root Directory**: `/web` (Crucial: the app is in the `web/` subfolder)

### Nuance: Node.js Version
Under **Build settings** > **Environment variables**, add:
- **Variable name**: `NODE_VERSION`
- **Value**: `20` (Matches your project requirements)

Click **Save and Deploy**. *Note: The first build will likely fail because the database isn't linked yet. This is normal.*

---

## 4. Bind the D1 Database
The application needs to "see" your database to work.

1. Go back to your project in the Cloudflare Dashboard (**Workers & Pages** > **swedish-camp-command-test**).
2. Click the **Settings** tab at the top.
3. In the left sidebar, click **Functions**.
4. Scroll down to **D1 Database Bindings**.
5. Click **Add binding**.
6. Set the following:
   - **Variable name**: `DB` (Must be exactly `DB`)
   - **D1 database**: Select `swedish-camp-db` from the dropdown.
7. Repeat this for both **Production** and **Preview** environments in the same tab.
8. **IMPORTANT**: You must trigger a new deployment for this change to take effect. Go to **Deployments** > click the three dots on the failed build > **Retry deployment**.

---

## 5. Apply Database Migrations (Remote)
Currently, your cloud database is likely empty. You need to run the data migrations manually once to set up the tables.

1. Open your local terminal.
2. Run the following command to apply migrations to your **live** Cloudflare database:
   ```bash
   npx wrangler d1 migrations apply swedish-camp-db --remote
   ```
3. When asked to confirm, type `y`.

---

## 6. Accessing your Test Environment
Once the build completes (it should take 2-3 minutes):
1. You will see a URL like `https://swedish-camp-command-test.pages.dev`.
2. Open this URL on your phone or browser.
3. To test the **Coach View**, go to: `https://[your-url]/coach/camps/[id]`

---

## 🛡️ Common Troubleshooting
- **"D1 Database not found"**: Ensure the binding name in Cloudflare Settings is exactly `DB` (uppercase).
- **"TypeError: Cannot read property 'prepare' of undefined"**: This means the D1 binding hasn't "attached" yet. Double-check step 4 and redeploy.
- **Admin Access**: Remember that the admin area is secured. You will need to log in at `/admin/login` using the credentials defined in your `AdminUsers` table.
