console.log('storage.js loaded');

/**
 * recupera la lista de noticias favoritas guardadas en LocalStorage.
 * @returns {Array} lista de artículos favoritos.
 */
function getFavorites() {
    const favorites = localStorage.getItem('global_news_favorites');
    return favorites ? JSON.parse(favorites) : [];
}

/**
 * Guarda un artículo completo en la lista de favoritos si no existe previamente.
 * @param {Object} article El objeto de la noticia entregado por la API.
 */
function saveFavorite(article) {
    const favorites = getFavorites();
    
    const exists = favorites.some(fav => fav.id === article.id);
    
    if (!exists) {
        favorites.push(article);
        localStorage.setItem('global_news_favorites', JSON.stringify(favorites));
        console.log(`❤️ Noticia guardada en favoritos: ${article.title}`);
    }
}

/**
 * elimina una noticia de la lista de favoritos mediante su ID.
 * @param {string|number} articleId - El ID único de la noticia a remover.
 */
function removeFavorite(articleId) {
    let favorites = getFavorites();
    
    favorites = favorites.filter(fav => fav.id !== articleId);
    
    localStorage.setItem('global_news_favorites', JSON.stringify(favorites));
    console.log(`💔 Noticia eliminada de favoritos. ID: ${articleId}`);
}