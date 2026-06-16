
function renderNewsCards(articles) {
    const container = document.getElementById('news-feed-container');
    if (!container) return;
    
    container.innerHTML = ''; 

    if (!articles || articles.length === 0) {
        container.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-muted);">No se encontraron noticias.</p>`;
        return;
    }

    const favorites = typeof getFavorites === 'function' ? getFavorites() : [];
    const currentCat = document.querySelector('.category-pill.active')?.innerText || 'World';

    articles.forEach((article, index) => {
        const card = document.createElement('article');
        card.classList.add('news-card');

        // Verificamos si es favorito usando tu lógica de ID
        const isFav = favorites.some(fav => fav.id === article.id);
        const heartClass = isFav ? 'bi-heart-fill' : 'bi-heart';
        const imageUrl = (article.image && article.image !== 'None') ? article.image : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500';

        card.innerHTML = `
            <div class="news-card-img" style="background-image: url('${imageUrl}');">
                <span class="news-card-tag">${currentCat}</span>
            </div>
            <div class="news-card-body">
                <span class="news-card-meta">${article.author || 'Global News'} • ${article.published ? article.published.substring(0,10) : 'Recent'}</span>
                <h3 class="news-card-title">${article.title}</h3>
                <div class="news-card-footer">
                    <button class="card-btn-read" data-index="${index}">Read Summary</button>
                    <button class="card-btn-fav" data-index="${index}">
                        <i class="bi ${heartClass}"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Evento Delegado ÚNICO: Controla clics de "Favoritos" y "Leer" en contenido dinámico
const newsFeedContainer = document.getElementById('news-feed-container');
if (newsFeedContainer) {
    newsFeedContainer.addEventListener('click', (e) => {
        
        // si clicaron en Favoritos
        const favButton = e.target.closest('.card-btn-fav');
        if (favButton) {
            const index = favButton.dataset.index;
            const article = window.currentNewsList[index];
            
            if (article) {
                // revisamos si ya existe usando getFavorites y el ID
                const isFav = getFavorites().some(fav => fav.id === article.id);
                
                if (isFav) {
                    removeFavorite(article.id);
                } else {
                    saveFavorite(article);
                }
                
                // cambio visual
                const icon = favButton.querySelector('i');
                icon.classList.toggle('bi-heart');
                icon.classList.toggle('bi-heart-fill');
            }
            return;
        }

        // 2. si clicaron en Leer (Abre el Panel Lateral)
        const readButton = e.target.closest('.card-btn-read');
        if (readButton) {
            const index = readButton.dataset.index;
            const article = window.currentNewsList[index];
            
            if (article) {
                const readingPanel = document.getElementById('reading-panel');
                document.getElementById('reading-title').innerText = article.title;
                document.getElementById('reading-source').innerHTML = `<i class="bi bi-journal-bookmark-fill"></i> ${article.author || 'Global News'}`;
                
                const imageUrl = (article.image && article.image !== 'None') ? article.image : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500';
                document.getElementById('reading-hero').style.backgroundImage = `url('${imageUrl}')`;
                
                document.getElementById('reading-body').innerHTML = `
                    <p>${article.description || 'Sin descripción detallada disponible para esta noticia.'}</p>
                `;
                
                const linkBtn = document.getElementById('reading-link');
                if(linkBtn) linkBtn.href = article.url;
                
                readingPanel.classList.add('open');
            }
        }
    });
}

// función exclusiva de Categorías
function conectarBotonesCategorias() {
    const categoryButtons = document.querySelectorAll('.category-pill');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            let cat = button.dataset.category.toLowerCase();
            if (cat === 'all' || cat === 'world') cat = 'general';
            
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            fetchNewsByCountry(window.currentCountry || 'mx', cat);
            
            // Auto expandir en móvil
            const sidebar = document.getElementById('app-sidebar');
            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.add('expanded');
            }
        });
    });
}

window.addEventListener('load', () => {
    conectarBotonesCategorias();
    
    // Fetch initial news for default country (e.g., Global/US) if nothing is loaded
    if (typeof fetchNewsByCountry === 'function') {
        fetchNewsByCountry('us', 'general');
    }

    // Funcionalidad de Búsqueda Tradicional
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0 && typeof fetchNewsByKeyword === 'function') {
                    // Quitar categorías activas
                    document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
                    
                    const badge = document.getElementById('selected-country-badge');
                    if (badge) badge.innerText = `Búsqueda: ${query}`;
                    
                    // Cambiar a pestaña News
                    document.getElementById('tab-news')?.click();
                    
                    fetchNewsByKeyword(query);
                    
                    // Auto expandir en móvil
                    const sidebar = document.getElementById('app-sidebar');
                    if (sidebar && window.innerWidth <= 768) {
                        sidebar.classList.add('expanded');
                    }
                    
                    // Quitar el teclado en móviles
                    searchInput.blur();
                }
            }
        });
    }

    // Agregar gestos táctiles (Swipe) para deslizar el menú en celulares y PC (mouse)
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
        let startY;
        
        sidebar.addEventListener('pointerdown', (e) => {
            // Ignorar el botón del sol/luna
            if (e.target.closest('.theme-toggle-btn')) {
                startY = null;
                return;
            }
            
            // Detectar inicio de arrastre desde la cabecera o la rayita
            if (e.target.closest('.drag-handle') || e.target.closest('.sidebar-header')) {
                startY = e.clientY;
                // Evitar que el texto se sombree de azul al arrastrar con el mouse
                if (e.pointerType === 'mouse') {
                    document.body.style.userSelect = 'none';
                }
            } else {
                startY = null;
            }
        });

        window.addEventListener('pointerup', (e) => {
            document.body.style.userSelect = ''; // Restaurar selección
            
            if (!startY) return;
            let endY = e.clientY;
            let diffY = startY - endY;
            
            if (diffY > 20) {
                // Arrastró hacia arriba (expandir)
                sidebar.classList.add('expanded');
            } else if (diffY < -20) {
                // Arrastró hacia abajo (contraer)
                sidebar.classList.remove('expanded');
            } else if (Math.abs(diffY) <= 20) {
                // Si fue solo un clic normal en la cabecera, alternamos
                sidebar.classList.toggle('expanded');
            }
            
            startY = null;
        });
    }
});

function renderFavorites() {
    const container = document.getElementById('favorites-feed-container');
    if (!container) return;
    
    container.innerHTML = '';
    const favorites = typeof getFavorites === 'function' ? getFavorites() : [];
    
    if (favorites.length === 0) {
        container.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-muted);">No tienes noticias favoritas aún.</p>`;
        return;
    }

    favorites.forEach((article, index) => {
        const card = document.createElement('article');
        card.classList.add('news-card');
        
        const imageUrl = (article.image && article.image !== 'None') ? article.image : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500';

        card.innerHTML = `
            <div class="news-card-img" style="background-image: url('${imageUrl}');">
            </div>
            <div class="news-card-body">
                <span class="news-card-meta">${article.author || 'Global News'} • ${article.published ? article.published.substring(0,10) : 'Recent'}</span>
                <h3 class="news-card-title">${article.title}</h3>
                <div class="news-card-footer">
                    <button class="card-btn-read" data-id="${article.id}">Read Summary</button>
                    <button class="card-btn-fav active" data-id="${article.id}">
                        <i class="bi bi-heart-fill text-orange"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

const tabFavorites = document.getElementById('tab-favorites');
if (tabFavorites) {
    tabFavorites.addEventListener('click', renderFavorites);
}

const favoritesFeedContainer = document.getElementById('favorites-feed-container');
if (favoritesFeedContainer) {
    favoritesFeedContainer.addEventListener('click', (e) => {
        const favButton = e.target.closest('.card-btn-fav');
        if (favButton) {
            const articleId = favButton.dataset.id;
            if (typeof removeFavorite === 'function') {
                removeFavorite(articleId);
                renderFavorites(); 
            }
            return;
        }

        const readButton = e.target.closest('.card-btn-read');
        if (readButton) {
            const articleId = readButton.dataset.id;
            const favorites = typeof getFavorites === 'function' ? getFavorites() : [];
            const article = favorites.find(f => f.id === articleId);
            if (article) {
                const readingPanel = document.getElementById('reading-panel');
                document.getElementById('reading-title').innerText = article.title;
                document.getElementById('reading-source').innerHTML = `<i class="bi bi-journal-bookmark-fill"></i> ${article.author || 'Global News'}`;
                
                const imageUrl = (article.image && article.image !== 'None') ? article.image : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500';
                document.getElementById('reading-hero').style.backgroundImage = `url('${imageUrl}')`;
                
                document.getElementById('reading-body').innerHTML = `
                    <p>${article.description || 'Sin descripción detallada disponible para esta noticia.'}</p>
                `;
                
                const linkBtn = document.getElementById('reading-link');
                if(linkBtn) linkBtn.href = article.url;
                
                readingPanel.classList.add('open');
            }
        }
    });
}