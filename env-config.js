// This script is injected by Netlify to provide environment variables
// During build, Netlify will replace ${TMDB_API_KEY} with your actual API key

window.TMDB_API_KEY = '365763a878a8f9fe9ab725c84e864923';

// Validation check
if (!window.TMDB_API_KEY || window.TMDB_API_KEY === '365763a878a8f9fe9ab725c84e864923') {
    console.error('⚠️ TMDB_API_KEY not configured!');
    console.error('Please set TMDB_API_KEY in Netlify Environment Variables');
    console.error('Go to: Site Settings → Environment Variables → Add Variable');
    console.error('Variable Name: TMDB_API_KEY');
    console.error('Get your key from: https://www.themoviedb.org/settings/api');
}
