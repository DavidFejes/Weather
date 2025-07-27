document.addEventListener('DOMContentLoaded', () => {

    const apiKey = 'aa3d656bf84f1ed958b10c100b18337e'; // OpenWeatherMap API kulcs
    
    // Alapértelmezett koordináták: Szentes
    const defaultCoords = { lat: 46.65, lon: 20.26 };

    // --- TÉRKÉP INICIALIZÁLÁSA ---
    const map = L.map('map').setView([defaultCoords.lat, defaultCoords.lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    let marker = L.marker([defaultCoords.lat, defaultCoords.lon]).addTo(map);

    // --- FŐ IDŐJÁRÁS LOGIKA ---
    // Az 'async' jelzi, hogy ez a funkció aszinkron hívást tartalmaz (await)
    async function fetchWeather(lat, lon) {
        // Betöltés jelzése a felhasználónak
        document.querySelector('.location').textContent = 'Adatok betöltése...';
        
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=hu`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // A throw new Error megállítja a try blokk futását és a catch-be ugrik
                throw new Error(`HTTP hiba! Státusz: ${response.status}`);
            }
            const data = await response.json();
            updateWeatherUI(data); // Ha a válasz sikeres, frissítjük a felületet
        } catch (error) {
            console.error("Hiba történt az időjárás lekérése közben:", error);
            document.querySelector('.location').textContent = 'Hiba a lekérés során';
            document.querySelector('.icon').textContent = '❌';
        }
    }

    // --- KIJELZŐ FRISSÍTŐ FUNKCIÓ (display function) ---
    // Ez felelős az összes adat DOM-ba való beírásáért
    function updateWeatherUI(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeedKmh = Math.round(data.wind.speed * 3.6);
        const description = data.weather[0].description;
        const weatherId = data.weather[0].id;
        
        // A kapott UNIX időbélyeget (másodperc) ezredmásodperccé alakítjuk (*1000)
        // és egy helyi idő szerint olvasható formátummá (HH:MM)
        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

        document.querySelector('.location').textContent = `${data.name}, ${data.sys.country}`;
        document.querySelector('.temperature').textContent = `${temp}°`;
        document.querySelector('.icon').textContent = getWeatherIcon(weatherId);
        document.querySelector('.description').textContent = description;
        document.querySelector('.feels-like').textContent = `${feelsLike}°`;
        document.querySelector('.wind-speed').textContent = `${windSpeedKmh} km/h`;
        document.querySelector('.humidity').textContent = `${humidity}%`;
        document.querySelector('.pressure').textContent = `${pressure} hPa`;
        document.querySelector('.sunrise').textContent = sunriseTime;
        document.querySelector('.sunset').textContent = sunsetTime;
    }
    
    // --- IKON VÁLASZTÓ FUNKCIÓ ---
    // A kapott időjárás ID alapján kiválaszt egy emoji-t
    function getWeatherIcon(id) {
        if (id >= 200 && id < 300) return '⛈️'; // Vihar
        if (id >= 300 && id < 600) return '🌧️'; // Eső / Szitálás
        if (id >= 600 && id < 700) return '❄️'; // Hó
        if (id >= 700 && id < 800) return '🌫️'; // Köd, füst stb.
        if (id === 800) return '☀️';           // Tiszta égbolt
        if (id > 800) return '☁️';            // Felhős
        return '❓';                         // Ismeretlen
    }

    // --- ESEMÉNYFIGYELŐ A TÉRKÉP KATTINTÁSOKRA ---
    map.on('click', function(e) {
        const clickedLat = e.latlng.lat;
        const clickedLon = e.latlng.lng;

        // 1. Áthelyezi a jelölőt az új helyre
        marker.setLatLng([clickedLat, clickedLon]);
        
        // 2. Lekéri az időjárást az új koordinátákra
        fetchWeather(clickedLat, clickedLon);
    });

    // --- KEZDETI BETÖLTÉS ---
    // Az oldal betöltésekor azonnal lekérjük az alapértelmezett hely időjárását
    fetchWeather(defaultCoords.lat, defaultCoords.lon);
});