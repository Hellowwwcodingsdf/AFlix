// Configuration - Environment variables will be injected by Netlify
const CONFIG = {
    TMDB_API_KEY: window.TMDB_API_KEY || '',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    VIDSRC_BASE: 'https://vidsrc.xyz/embed',
    VIDSRC_PRO_BASE: 'https://vidsrc.pro/embed',
    VIDSRC_TO_BASE: 'https://vidsrc.to/embed'
};

// State management
const state = {
    featuredContent: null,
    myList: JSON.parse(localStorage.getItem('alfixMyList')) || [],
    currentCategory: 'home',
    searchResults: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    showLoading();
    
    try {
        // Load featured content for hero
        await loadFeaturedContent();
        
        // Load all content rows
        await Promise.all([
            loadContent('trending', 'trending/movie/week'),
            loadContent('popular', 'movie/popular'),
            loadContent('toprated', 'movie/top_rated'),
            loadContent('action', 'discover/movie', { with_genres: 28 }),
            loadContent('comedy', 'discover/movie', { with_genres: 35 }),
            loadContent('horror', 'discover/movie', { with_genres: 27 }),
            loadContent('romance', 'discover/movie', { with_genres: 10749 }),
            loadContent('documentary', 'discover/movie', { with_genres: 99 })
        ]);
        
        hideLoading();
    } catch (error) {
        console.error('Error initializing app:', error);
        hideLoading();
        showError('Failed to load content. Please check your API key configuration.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', handleCategoryChange);
    });
    
    // Search
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => handleSearch(e.target.value), 500);
    });
    
    // Hero buttons
    document.getElementById('playBtn').addEventListener('click', () => {
        if (state.featuredContent) {
            playContent(state.featuredContent);
        }
    });
    
    document.getElementById('infoBtn').addEventListener('click', () => {
        if (state.featuredContent) {
            showInfoModal(state.featuredContent);
        }
    });
    
    // Modal close buttons
    document.getElementById('closePlayer').addEventListener('click', closePlayerModal);
    document.getElementById('closeInfo').addEventListener('click', closeInfoModal);
    
    // Modal overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
    
    // Info modal buttons
    document.getElementById('infoPlayBtn').addEventListener('click', () => {
        const content = state.currentInfoContent;
        if (content) {
            closeInfoModal();
            playContent(content);
        }
    });
    
    document.getElementById('addToListBtn').addEventListener('click', () => {
        const content = state.currentInfoContent;
        if (content) {
            toggleMyList(content);
        }
    });
    
    // Slider buttons
    setupSliderButtons();
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function handleCategoryChange(e) {
    e.preventDefault();
    const category = e.target.dataset.category;
    
    // Update active link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    state.currentCategory = category;
    
    // Handle different categories
    if (category === 'mylist') {
        displayMyList();
    } else if (category === 'home') {
        location.reload();
    }
}

async function handleSearch(query) {
    if (!query.trim()) {
        return;
    }
    
    try {
        const response = await fetch(
            `${CONFIG.TMDB_BASE_URL}/search/multi?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
        );
        const data = await response.json();
        
        state.searchResults = data.results.filter(item => 
            item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        displaySearchResults();
    } catch (error) {
        console.error('Search error:', error);
    }
}

function displaySearchResults() {
    const contentRows = document.querySelector('.content-rows');
    
    if (state.searchResults.length === 0) {
        return;
    }
    
    // Hide all rows and show search results
    document.querySelectorAll('.row').forEach(row => {
        row.style.display = 'none';
    });
    
    let searchRow = document.getElementById('searchRow');
    if (!searchRow) {
        searchRow = document.createElement('div');
        searchRow.id = 'searchRow';
        searchRow.className = 'row';
        searchRow.innerHTML = `
            <h3 class="row-title">Search Results</h3>
            <div class="row-slider">
                <div class="row-content" data-row="search"></div>
            </div>
        `;
        contentRows.insertBefore(searchRow, contentRows.firstChild);
    }
    
    searchRow.style.display = 'block';
    const container = searchRow.querySelector('.row-content');
    container.innerHTML = '';
    
    state.searchResults.forEach(item => {
        const card = createContentCard(item);
        container.appendChild(card);
    });
}

// Load featured content for hero section
async function loadFeaturedContent() {
    try {
        const response = await fetch(
            `${CONFIG.TMDB_BASE_URL}/trending/movie/week?api_key=${CONFIG.TMDB_API_KEY}`
        );
        const data = await response.json();
        
        // Get a random featured movie
        const featured = data.results[Math.floor(Math.random() * Math.min(5, data.results.length))];
        state.featuredContent = featured;
        
        // Get additional details
        const detailsResponse = await fetch(
            `${CONFIG.TMDB_BASE_URL}/movie/${featured.id}?api_key=${CONFIG.TMDB_API_KEY}&append_to_response=videos`
        );
        const details = await detailsResponse.json();
        
        displayFeaturedContent(featured, details);
    } catch (error) {
        console.error('Error loading featured content:', error);
    }
}

function displayFeaturedContent(content, details) {
    const hero = document.getElementById('hero');
    const backdropPath = content.backdrop_path || content.poster_path;
    
    if (backdropPath) {
        hero.style.backgroundImage = `url(${CONFIG.TMDB_IMAGE_BASE}/original${backdropPath})`;
    }
    
    document.querySelector('.hero-title').textContent = content.title || content.name;
    document.querySelector('.hero-rating').textContent = `★ ${content.vote_average.toFixed(1)}`;
    document.querySelector('.hero-year').textContent = (content.release_date || content.first_air_date || '').split('-')[0];
    
    if (details.runtime) {
        document.querySelector('.hero-runtime').textContent = `${details.runtime} min`;
    }
    
    const description = content.overview || '';
    document.querySelector('.hero-description').textContent = description.length > 200 
        ? description.substring(0, 200) + '...' 
        : description;
}

// Load content for different rows
async function loadContent(rowId, endpoint, params = {}) {
    try {
        const queryParams = new URLSearchParams({
            api_key: CONFIG.TMDB_API_KEY,
            ...params
        });
        
        const response = await fetch(`${CONFIG.TMDB_BASE_URL}/${endpoint}?${queryParams}`);
        const data = await response.json();
        
        displayContent(rowId, data.results);
    } catch (error) {
        console.error(`Error loading ${rowId}:`, error);
    }
}

function displayContent(rowId, items) {
    const container = document.querySelector(`[data-row="${rowId}"]`);
    if (!container) return;
    
    container.innerHTML = '';
    
    items.slice(0, 15).forEach(item => {
        const card = createContentCard(item);
        container.appendChild(card);
    });
}

function createContentCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    const posterPath = item.backdrop_path || item.poster_path;
    if (posterPath) {
        card.style.backgroundImage = `url(${CONFIG.TMDB_IMAGE_BASE}/w500${posterPath})`;
    } else {
        card.style.backgroundColor = '#1a1a1a';
    }
    
    const title = item.title || item.name;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
    
    card.innerHTML = `
        <div class="card-info">
            <div class="card-title">${title}</div>
            <div class="card-meta">
                <span class="card-rating">★ ${rating}</span>
                <span class="card-year">${year}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showInfoModal(item));
    
    return card;
}

// Play content
function playContent(content) {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    
    // Determine media type and ID
    const mediaType = content.media_type || 'movie';
    const tmdbId = content.id;
    
    // Use VidSrc with TMDB ID
    // VidSrc.xyz format: https://vidsrc.xyz/embed/movie/TMDB_ID or /tv/TMDB_ID
    let playerUrl = '';
    
    if (mediaType === 'tv') {
        // For TV shows, default to season 1 episode 1
        playerUrl = `${CONFIG.VIDSRC_BASE}/tv/${tmdbId}/1/1`;
    } else {
        playerUrl = `${CONFIG.VIDSRC_BASE}/movie/${tmdbId}`;
    }
    
    player.src = playerUrl;
    
    // Update player info
    document.getElementById('playerTitle').textContent = content.title || content.name;
    document.getElementById('playerYear').textContent = (content.release_date || content.first_air_date || '').split('-')[0];
    document.getElementById('playerRating').textContent = `★ ${content.vote_average.toFixed(1)}`;
    document.getElementById('playerDescription').textContent = content.overview || 'No description available.';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePlayerModal() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    
    player.src = '';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Info modal
async function showInfoModal(content) {
    state.currentInfoContent = content;
    const modal = document.getElementById('infoModal');
    
    // Determine media type
    const mediaType = content.media_type || (content.title ? 'movie' : 'tv');
    const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
    
    try {
        // Fetch detailed information
        const response = await fetch(
            `${CONFIG.TMDB_BASE_URL}/${endpoint}/${content.id}?api_key=${CONFIG.TMDB_API_KEY}&append_to_response=credits`
        );
        const details = await response.json();
        
        // Update modal content
        const infoHero = document.getElementById('infoHero');
        const backdropPath = details.backdrop_path || details.poster_path;
        
        if (backdropPath) {
            infoHero.style.backgroundImage = `url(${CONFIG.TMDB_IMAGE_BASE}/original${backdropPath})`;
        }
        
        document.getElementById('infoTitle').textContent = details.title || details.name;
        document.getElementById('infoYear').textContent = (details.release_date || details.first_air_date || '').split('-')[0];
        document.getElementById('infoRating').textContent = `★ ${details.vote_average.toFixed(1)}`;
        
        if (details.runtime) {
            document.getElementById('infoRuntime').textContent = `${details.runtime} min`;
        } else if (details.episode_run_time && details.episode_run_time.length > 0) {
            document.getElementById('infoRuntime').textContent = `${details.episode_run_time[0]} min/ep`;
        } else {
            document.getElementById('infoRuntime').textContent = '';
        }
        
        document.getElementById('infoDescription').textContent = details.overview || 'No description available.';
        
        // Cast
        const cast = details.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
        document.getElementById('infoCast').textContent = cast;
        
        // Genres
        const genres = details.genres?.map(g => g.name).join(', ') || 'N/A';
        document.getElementById('infoGenres').textContent = genres;
        
        // Update add to list button
        updateAddToListButton();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading content details:', error);
    }
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    state.currentInfoContent = null;
}

function closeAllModals() {
    closePlayerModal();
    closeInfoModal();
}

// My List functionality
function toggleMyList(content) {
    const index = state.myList.findIndex(item => item.id === content.id);
    
    if (index > -1) {
        state.myList.splice(index, 1);
    } else {
        state.myList.push(content);
    }
    
    localStorage.setItem('alfixMyList', JSON.stringify(state.myList));
    updateAddToListButton();
}

function updateAddToListButton() {
    const button = document.getElementById('addToListBtn');
    const content = state.currentInfoContent;
    
    if (!content) return;
    
    const isInList = state.myList.some(item => item.id === content.id);
    
    if (isInList) {
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
        button.title = 'Remove from My List';
    } else {
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        `;
        button.title = 'Add to My List';
    }
}

function displayMyList() {
    const contentRows = document.querySelector('.content-rows');
    
    // Hide all rows
    document.querySelectorAll('.row').forEach(row => {
        row.style.display = 'none';
    });
    
    // Show or create My List row
    let myListRow = document.getElementById('myListRow');
    if (!myListRow) {
        myListRow = document.createElement('div');
        myListRow.id = 'myListRow';
        myListRow.className = 'row';
        myListRow.innerHTML = `
            <h3 class="row-title">My List</h3>
            <div class="row-slider">
                <div class="row-content" data-row="mylist"></div>
            </div>
        `;
        contentRows.insertBefore(myListRow, contentRows.firstChild);
    }
    
    myListRow.style.display = 'block';
    const container = myListRow.querySelector('.row-content');
    container.innerHTML = '';
    
    if (state.myList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Your list is empty. Add content to watch later!</p>';
    } else {
        state.myList.forEach(item => {
            const card = createContentCard(item);
            container.appendChild(card);
        });
    }
}

// Slider functionality
function setupSliderButtons() {
    document.querySelectorAll('.row-slider').forEach(slider => {
        const leftBtn = slider.querySelector('.slider-btn-left');
        const rightBtn = slider.querySelector('.slider-btn-right');
        const content = slider.querySelector('.row-content');
        
        if (leftBtn && rightBtn && content) {
            leftBtn.addEventListener('click', () => {
                content.scrollBy({ left: -600, behavior: 'smooth' });
            });
            
            rightBtn.addEventListener('click', () => {
                content.scrollBy({ left: 600, behavior: 'smooth' });
            });
        }
    });
}

// Loading states
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

function showError(message) {
    alert(message); // In production, use a better error UI
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});
