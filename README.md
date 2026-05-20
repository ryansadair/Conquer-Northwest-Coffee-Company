# Conquer Northwest Coffee — GitHub Pages Site

A fully static website for **Conquer Northwest Coffee Company** built for GitHub Pages. No build tools, no dependencies — just HTML, CSS, and vanilla JS.

---

## 📁 File Structure

```
cnwc/
├── index.html          # Homepage
├── coffee.html         # Shop / blends page
├── discover.html       # Discover the PNW page
├── about.html          # Our story / about us
├── _config.yml         # GitHub Pages config
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Nav, scroll reveals, counter
└── README.md
```

---

## 🚀 Deploying to GitHub Pages

### Step 1 — Create a GitHub repository
1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it `conquernorthwestcoffee` (or anything you prefer)
4. Set it to **Public**
5. Click **Create repository**

### Step 2 — Upload the files
**Option A — GitHub Desktop (easiest):**
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Clone your new repo locally
3. Copy all files from this folder into the repo folder
4. Commit and push

**Option B — Drag & drop on GitHub.com:**
1. Open your repo on github.com
2. Click **Add file → Upload files**
3. Drag the entire contents of this folder in
4. Commit

**Option C — Command line:**
```bash
cd /path/to/cnwc
git init
git remote add origin https://github.com/YOUR_USERNAME/conquernorthwestcoffee.git
git add .
git commit -m "Initial site build"
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Click **Settings → Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch, **/ (root)** folder
5. Click **Save**
6. Your site will be live at `https://YOUR_USERNAME.github.io/conquernorthwestcoffee` in ~2 minutes

### Step 4 — Connect your custom domain
1. In **Settings → Pages**, enter your domain under **Custom domain** (e.g. `conquernorthwestcoffee.com`)
2. Log into your domain registrar (wherever you bought the domain)
3. Add these DNS records:

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | YOUR_USERNAME.github.io |

4. DNS changes can take up to 48 hours but usually resolve within 1–2 hours
5. Check **Enforce HTTPS** in Pages settings once the domain verifies

---

## 🛒 Setting Up the Shop (Shopify Buy Button)

The coffee page (`coffee.html`) has placeholder buttons. To make them functional:

### Step 1 — Shopify Starter Plan
1. Sign up at [shopify.com](https://shopify.com) — choose the **Starter** plan (~$5/month)
2. This gives you Buy Button functionality without a full storefront

### Step 2 — Install Dripshipper
1. In your Shopify admin, go to **Apps → App Store**
2. Search for **Dripshipper** and install (~$30/month)
3. Create your four blends (Deep Forest, Rocky Mountain, Coastal, I5) with your branding
4. Set your retail price (they suggest $14–16/bag; their cost is ~$6–8)

### Step 3 — Generate Buy Buttons
1. In Shopify admin, go to **Sales Channels → Buy Button**
2. For each product, create a Buy Button
3. Customize colors to match (gold: `#c49a3c`, background: `#1a2e1a`)
4. Copy the embed code

### Step 4 — Replace placeholders in coffee.html
Find each `<button class="shopify-placeholder">` block and replace with your Shopify embed code:

```html
<!-- REPLACE THIS: -->
<button class="shopify-placeholder">Add to Cart ...</button>

<!-- WITH YOUR SHOPIFY EMBED CODE: -->
<div id='product-component-XXXXXXXX'></div>
<script type='text/javascript'>
  // Shopify's generated script goes here
</script>
```

---

## 🌿 Amazon Associates Affiliate Links

The gear section on the homepage uses placeholder Amazon links. To earn commissions:

1. Sign up at [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Once approved, get your **Associate Tag** (looks like `cnwc-20`)
3. In `index.html`, find all `tag=YOUR_AMAZON_TAG` and replace with your actual tag
4. You can also generate specific product links from the Associates dashboard for exact items (e.g. a specific Hario V60 or Osprey pack)

---

## 📊 Adding Google Analytics

Paste this before `</head>` in each HTML file (replace `G-XXXXXXXXXX` with your Measurement ID):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## ✏️ Common Customizations

### Update the tree count
In `index.html`, `about.html`, and `coffee.html`, search for `838` and update the number monthly.

### Change prices
In `coffee.html`, find `$14.00` and update as needed.

### Add your own photos
Replace Unsplash image URLs in the `background-image` CSS with your own photos. Upload images to a `/images/` folder in the repo and reference them as `images/your-photo.jpg`.

### Update contact email
Search for `hello@conquernorthwestcoffee.com` across all files and replace with your actual email.

### Social links
Both Instagram (`conquernorthwestcoffee`) and Facebook (`conquernorthwestcoffee`) links are already set correctly based on your existing accounts.

---

## 💰 Monthly Cost Summary

| Item | Cost |
|------|------|
| GitHub Pages hosting | **Free** |
| Custom domain (if renewing) | ~$12/yr |
| Shopify Starter | $5/mo |
| Dripshipper | $30/mo |
| **Total** | **~$35–36/mo** |

Break-even: ~4 bags sold per month at $14 retail.

---

## 📬 Questions?

Built for Conquer Northwest Coffee Company, LLC. © 2025.
