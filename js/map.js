

// asignar el token desde nuestro archivo de configuración
mapboxgl.accessToken = config.mapbox_token;

// inicializar el mapa global
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/satellite-streets-v12', 
    center: [-40, 35], 
    zoom: 2, 
    projection: 'globe' 
});

// configuración cuando el mapa termine de cargar
map.on('load', () => {
    console.log("Mapbox cargado y renderizado con éxito.");
    
    // Ocultar el placeholder para que se vea el globo interactivo real
    const placeholder = document.querySelector('.map-placeholder-bg');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    map.setFog({
        color: 'rgb(186, 210, 247)', 
        'high-color': 'rgb(36, 92, 223)', 
        'space-color': 'rgb(11, 11, 25)',
        'horizon-blend': 0.02
    });

    // array de países estratégicos
    const countries = [
        { name: 'México', code: 'mx', coords: [-102.5528, 23.6345] },
        { name: 'Estados Unidos', code: 'us', coords: [-95.7129, 37.0902] },
        { name: 'España', code: 'es', coords: [-3.7492, 40.4637] },
        { name: 'Francia', code: 'fr', coords: [2.2137, 46.2276] },
        { name: 'Japón', code: 'jp', coords: [138.2529, 36.2048] },
        { name: 'Brasil', code: 'br', coords: [-51.9253, -14.2350] }
    ];

    countries.forEach(country => {
        // Crear un popup con el nombre del país
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setText(country.name);

        const marker = new mapboxgl.Marker({ color: '#ff6600' })
            .setLngLat(country.coords)
            .setPopup(popup) // Añadimos el popup al marcador
            .addTo(map);

        // Mostrar el popup al pasar el ratón
        const markerEl = marker.getElement();
        markerEl.addEventListener('mouseenter', () => marker.togglePopup());
        markerEl.addEventListener('mouseleave', () => marker.togglePopup());

        markerEl.addEventListener('click', () => {
            console.log(`🌍 Conectando... Buscando noticias para: ${country.name} (${country.code})`);
            
            //guardamos el país globalmente para futuros filtros de categoría
            window.currentCountry = country.code; 
            
            // llamada directa: news.js hará todo el trabajo de recibir y renderizar
            fetchNewsByCountry(country.code, 'general');
        });
    });

    // Configurar controles de zoom
    document.getElementById('zoom-in')?.addEventListener('click', () => {
        map.zoomIn();
    });
    document.getElementById('zoom-out')?.addEventListener('click', () => {
        map.zoomOut();
    });
});