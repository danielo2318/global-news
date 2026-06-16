window.currentNewsList = [];

async function fetchNewsByCountry(countryCode, category = 'all') {
    const spanishCountries = ['mx', 'es', 'ar', 'co', 'cl', 'pe', 've'];
    const lang = spanishCountries.includes(countryCode.toLowerCase()) ? 'es' : 'en';
    const apiKey = typeof config !== 'undefined' ? config.currents_key : 'TU_CURRENTS_API_KEY_AQUI'; 

    let url = `https://api.currentsapi.services/v1/latest-news?country=${countryCode}&language=${lang}&apiKey=${apiKey}`;
    
    if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'general') {
        url += `&category=${category.toLowerCase()}`;
    }

    console.log(`🌍 Conectando a API... País: ${countryCode} | Categoría: ${category}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.status === 'ok') {
            console.log("✅ Datos recibidos en news.js:", data.news);
            
            // Guardamos los datos globalmente ANTES de pintar
            window.currentNewsList = data.news;
            
            if (typeof renderNewsCards === 'function') {
                renderNewsCards(window.currentNewsList);
            } else {
                console.error("renderNewsCards no está definida.");
            }
        }
    } catch (error) {
        console.error("Error al obtener noticias:", error);
    }
}