document.addEventListener('DOMContentLoaded', () => {
    // === API KEYS ===
    const weatherApiKey = 'aa3d656bf84f1ed958b10c100b18337e';
    const geoapifyApiKey = 'c9b46510b1ae4ba7a2dcda99a0b81e68';

    // === DEFAULT LOCATION ===
    const defaultCoords = { lat: 46.65, lon: 20.26 };

    // === HTML ELEMENTS ===
    const cityInput = document.getElementById('city-input');
    const autocompleteResults = document.getElementById('autocomplete-results');
    
    // === MAP INITIALIZATION ===
    const map = L.map('map').setView([defaultCoords.lat, defaultCoords.lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    let marker = L.marker([defaultCoords.lat, defaultCoords.lon]).addTo(map);
    
    // === CITY SEARCH LOGIC ===
    let debounceTimer;
    cityInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = cityInput.value;
        if (query.length < 3) {
            hideAutocomplete();
            return;
        }
        // Debounce: wait 300ms after user stops typing
        debounceTimer = setTimeout(() => {
            fetchCities(query);
        }, 300);
    });

    async function fetchCities(query) {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${geoapifyApiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            displayAutocomplete(data.features);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    }
    
    function displayAutocomplete(features) {
        autocompleteResults.innerHTML = '';
        if (!features || features.length === 0) {
            hideAutocomplete();
            return;
        }
        
        features.forEach(feature => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = feature.properties.formatted;
            item.addEventListener('click', () => {
                const { lat, lon } = feature.properties;
                updateLocation(lat, lon);
                cityInput.value = feature.properties.city || feature.properties.name;
                hideAutocomplete();
            });
            autocompleteResults.appendChild(item);
        });
        autocompleteResults.style.display = 'block';
    }

    function hideAutocomplete() {
        autocompleteResults.innerHTML = '';
        autocompleteResults.style.display = 'none';
    }

    // === UPDATE LOCATION & FETCH WEATHER ===
    function updateLocation(lat, lon) {
        map.setView([lat, lon], 12);
        marker.setLatLng([lat, lon]);
        fetchWeather(lat, lon);
    }
    
    // === WEATHER FETCH & DISPLAY LOGIC (All original functions) ===
    async function fetchWeather(lat, lon) {
        document.querySelector('.location').textContent = 'Loading...';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=hu`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const data = await response.json();
            updateWeatherUI(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            document.querySelector('.location').textContent = 'Error loading data';
            document.querySelector('.icon').textContent = '❌';
        }
    }

    function updateWeatherUI(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeedKmh = Math.round(data.wind.speed * 3.6);
        const description = data.weather[0].description;
        const weatherId = data.weather[0].id;
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
    
    function getWeatherIcon(id) {
        if (id >= 200 && id < 300) return '⛈️';
        if (id >= 300 && id < 600) return '🌧️';
        if (id >= 600 && id < 700) return '❄️';
        if (id >= 700 && id < 800) return '🌫️';
        if (id === 800) return '☀️';
        if (id > 800) return '☁️';
        return '❓';
    }

    // --- INITIAL LOAD ---
    fetchWeather(defaultCoords.lat, defaultCoords.lon);

        // === INDULÓ ÁLLAPOT BEÁLLÍTÁSA (ez már megvan) ===
    // ...

        // === RESZPONZÍV TÉRKÉP JAVÍTÁS (ÚJ, KÉSLELTETETT VERZIÓ) ===
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            
            // EZ AZ ÚJ VARÁZSLAT
            // Adunk a böngészőnek 10ms-ot, hogy befejezze a layout átrendezését
            setTimeout(() => {
                map.invalidateSize(true); // A 'true' opció még alaposabb újrarajzolást kér
            }, 10); // Ez a 10ms-os késleltetés a trükk

        }, 150); // Picit növeljük a külső debounce időt is
    });

}); // Ez a script legvége