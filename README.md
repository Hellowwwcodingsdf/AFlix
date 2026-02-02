# ALFlix - Netflix-Style Streaming Platform

A production-ready streaming platform built with vanilla JavaScript, featuring TMDB API integration and VidSrc video playback.

## 🎬 Features

- **Netflix-Inspired Design**: Sleek, modern UI with smooth animations and transitions
- **Hero Carousel**: Featured content with dynamic backdrop images
- **Multiple Categories**: Trending, Popular, Top Rated, Action, Comedy, Horror, Romance, Documentaries
- **Search Functionality**: Real-time search across movies and TV shows
- **Video Playback**: Integrated VidSrc player supporting TMDB IDs
- **My List**: Save your favorite content locally
- **Responsive Design**: Fully responsive for desktop, tablet, and mobile
- **Smooth Scrolling**: Netflix-style horizontal content rows with navigation
- **Detailed Info Modals**: View comprehensive information about any title

## 🚀 Deployment Instructions

### Prerequisites

1. **TMDB API Key**: Get your free API key from [The Movie Database](https://www.themoviedb.org/settings/api)
2. **GitHub Account**: For repository hosting
3. **Netlify Account**: For deployment

### Step 1: Prepare Your Repository

1. Create a new repository on GitHub
2. Clone this repository or download the files
3. Upload all project files to your GitHub repository:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `env-config.js`
   - `netlify.toml`
   - `README.md`

### Step 2: Deploy to Netlify

1. **Log in to Netlify** at [netlify.com](https://www.netlify.com)

2. **Connect Your Repository**:
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your ALFlix repository

3. **Configure Build Settings**:
   - Build command: Leave empty (static site)
   - Publish directory: `.` (root directory)
   - Click "Deploy site"

### Step 3: Configure Environment Variables

This is the CRITICAL step for the site to work:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add the following environment variable:

   **Variable Name**: `TMDB_API_KEY`
   
   **Value**: Your TMDB API key (e.g., `1234567890abcdef1234567890abcdef`)

5. Click **Save**

### Step 4: Configure Snippet Injection

To properly inject the environment variable into your site:

1. In Netlify Dashboard, go to **Site settings** → **Build & deploy** → **Post processing**
2. Scroll to **Snippet injection**
3. Click **Add snippet**
4. Configure:
   - **Snippet name**: ENV Config
   - **Position**: Before </head>
   - **Script type**: JavaScript
   - **Content**:
   ```javascript
   <script>
   window.TMDB_API_KEY = '${TMDB_API_KEY}';
   </script>
   ```
5. Click **Save**

### Step 5: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

Your ALFlix site is now live! 🎉

## 🔐 Environment Variables Reference

| Variable Name | Description | Required | Example |
|--------------|-------------|----------|---------|
| `TMDB_API_KEY` | Your TMDB API key for fetching movie/TV data | **YES** | `1234567890abcdef...` |

## 🎨 Customization

### Changing the Site Name

1. Update `<title>` in `index.html`
2. Update `.logo` text in `index.html`
3. Optionally update the primary brand color in `styles.css` (`:root` variables)

### Changing VidSrc Server

The app uses VidSrc.xyz by default. To use alternative servers:

1. Open `app.js`
2. Locate the `playContent()` function
3. Change the `playerUrl` to use:
   - VidSrc Pro: `${CONFIG.VIDSRC_PRO_BASE}/movie/${tmdbId}`
   - VidSrc.to: `${CONFIG.VIDSRC_TO_BASE}/movie/${tmdbId}`

### Adding More Categories

1. Open `index.html`
2. Add a new row section (copy existing row structure)
3. Open `app.js`
4. Add a new `loadContent()` call in `initializeApp()`
5. Use TMDB genre IDs: [Genre List](https://developers.themoviedb.org/3/genres/get-movie-list)

## 🎯 VidSrc Integration

This project uses VidSrc APIs for video playback. VidSrc accepts TMDB IDs directly:

### Movie Format
```
https://vidsrc.xyz/embed/movie/{TMDB_ID}
```

### TV Show Format
```
https://vidsrc.xyz/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}
```

### Alternative Servers

- **VidSrc Pro**: `https://vidsrc.pro/embed/movie/{TMDB_ID}`
- **VidSrc.to**: `https://vidsrc.to/embed/movie/{TMDB_ID}`

All servers work with TMDB IDs, no additional API keys needed for video playback.

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚠️ Important Notes

1. **TMDB API Rate Limits**: The free tier allows 40 requests per 10 seconds
2. **VidSrc Availability**: Video availability depends on VidSrc's catalog
3. **Local Storage**: "My List" is stored in browser localStorage
4. **HTTPS Required**: Netlify provides HTTPS by default
5. **API Key Security**: Never commit API keys to public repositories

## 🐛 Troubleshooting

### Content Not Loading
- Verify `TMDB_API_KEY` is set correctly in Netlify
- Check browser console for API errors
- Ensure snippet injection is configured

### Videos Not Playing
- Check VidSrc server status
- Try alternative VidSrc servers
- Verify TMDB ID is correct

### Search Not Working
- Check API key is properly injected
- Verify network requests in browser DevTools
- Clear browser cache and retry

## 📄 License

This project is for educational purposes. Ensure compliance with:
- TMDB API Terms of Service
- VidSrc Terms of Service
- Applicable copyright laws

## 🤝 Contributing

Feel free to fork and customize for your needs!

## 📞 Support

For TMDB API issues: [TMDB Support](https://www.themoviedb.org/talk)
For Netlify deployment issues: [Netlify Docs](https://docs.netlify.com)

---

**Built with ❤️ for streaming enthusiasts**
