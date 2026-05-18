# 🔐 Admin Panel Setup - Step by Step

## Step 1: Create Environment Variables File

### For Local Development:

1. Open your project folder: `c:\Users\USER\OneDrive\Desktop\mine\escort`
2. Create a new file named `.env.local` (note the dot at the beginning)
3. Add this line inside:
   ```
   ADMIN_PASSWORD=admin123
   ```
   (You can change `admin123` to any password you want)
4. Save the file

**Your folder should now look like:**
```
escort/
├── .env.local          ← NEW FILE YOU CREATED
├── package.json
├── api/
├── backend/
├── data/
├── public/
│   ├── admin-panel.html    ← Use this to access admin panel
│   ├── view-ads.html
│   ├── post-ad.html
│   └── ...
└── ...
```

---

## Step 2: Start Your Local Server

1. Open VS Code Terminal (Ctrl + `)
2. Run this command:
   ```
   npm start
   ```
   Or if that doesn't work:
   ```
   node api/index.js
   ```

3. Wait for the server to start. You should see:
   ```
   Server is running...
   ```

---

## Step 3: Access the Admin Panel

### In Your Browser:

1. Open your browser
2. Go to: `http://localhost:3000/admin-panel.html`
3. A login page appears
4. Enter your admin password: `admin123` (or whatever you set in `.env.local`)
5. Click **LOGIN**

---

## Step 4: Delete Ads

Once logged in, you'll see:

- ✅ **Total Ads** count
- ✅ **All your ads** in a table showing:
  - Title
  - City
  - Phone
  - Price
  - Posted date
  - Delete button

**To delete an ad:**
1. Click the red **DELETE** button
2. A popup asks: "Delete ad: [Title]?"
3. Click **Delete** to confirm
4. Ad is removed ✓

---

## Step 5: Search & Filter Ads

- **Search box**: Type title, phone, or city name
- **City filter**: Select a specific city
- Click **Filter** button
- Click **Refresh** to see all ads again

---

## For Production (Vercel)

After testing locally, to deploy to production:

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** `admin123` (same password)
   - Click **Add**
5. Your admin panel will work at: `yoursite.com/admin-panel.html`

---

## Troubleshooting

### Issue: "Invalid admin password"
- Check that `.env.local` file exists
- Make sure you typed the password correctly
- Restart your server after creating `.env.local`

### Issue: "Cannot connect to server"
- Make sure server is running (`npm start`)
- Check if it's running on `http://localhost:3000`
- Look at Terminal for any errors

### Issue: "No ads showing"
- Make sure you've posted ads first via `post-ad.html`
- Go to `http://localhost:3000/post-ad.html` and post a test ad
- Then go back to admin panel and click **Refresh**

---

## Quick Summary

| Step | What to Do |
|------|-----------|
| 1 | Create `.env.local` file with `ADMIN_PASSWORD=admin123` |
| 2 | Run `npm start` in terminal |
| 3 | Go to `http://localhost:3000/admin-panel.html` |
| 4 | Enter password: `admin123` |
| 5 | See all ads and click Delete to remove them |

---

**Questions?** Let me know if you get stuck on any step!
