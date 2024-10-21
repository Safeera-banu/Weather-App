const container = document.querySelector('.container');
const searchButton = document.querySelector('.search-box button');
const searchInput = document.querySelector('.search-box input');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const loadingSpinner = document.querySelector('.loading-spinner');
const APIKey = 'dcc4da9ede1f9431798e70e72bf47eda';

function displayWeather(json) {
    weatherBox.classList.add('active');
    weatherDetails.classList.add('active');
    error404.classList.remove('active');

    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    const humidity = document.querySelector('.weather-box .humidity span');
    const wind = document.querySelector('.weather-box .wind span');

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = "images/clear.png";
            break;
        case 'Drizzle':
        case 'Rain':
            image.src = "images/rainy.png";
            break;
        case 'Snow':
            image.src = "images/snow.png";
            break;
        case 'Clouds':
            image.src = "images/clouds.png";
            break;
        case 'Mist':
        case 'Haze':
        case 'Fog':
            image.src = "images/mist.png";
            break;
        case 'Thunderstorm':
            image.src = "images/storm.png";
            break;
        case 'Tornado': 
            image.src = "images/tornado.png";
            break;
        case 'Dust':
        case 'Sand':
        case 'Ash':
            image.src = "images/dust.png";
            break;
        default:
            image.src = "images/cloud.png";
    }

    temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    description.innerHTML = `${json.weather[0].description}`;
    humidity.innerHTML = `${json.main.humidity}%`;
    wind.innerHTML = `${parseInt(json.wind.speed * 3.6)} Km/h`; // Convert m/s to km/h
}

function getWeather() {
    const city = searchInput.value.trim();  
    if (city === '') {
        alert('Please enter a valid city name.');
        return;
    }
        


    loadingSpinner.style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            loadingSpinner.style.display = 'none';
            if (json.cod == '404') {
                container.style.height = '400px';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                return;
            }
            displayWeather(json);  // Display current weather
            getWeatherForecast(city); // Fetch and display forecast
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error fetching data:', error);
        });
}


function getWeatherByLocation(lat, lon) {
    loadingSpinner.style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            loadingSpinner.style.display = 'none';
            if (json.cod == '404') {
                container.style.height = '400px';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                return;
            }
            displayWeather(json);
            
        })

        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error fetching data:', error);
        });
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByLocation(lat, lon);
            getWeatherForecastByLocation(lat, lon);
        }, error => {
            alert('Unable to retrieve your location. Please allow location access.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function getWeatherForecastByLocation(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            if (json.cod == '404') {
                container.style.height = '400px';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                return;
            }
            displayForecast(json);  // Display the forecast data
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

// Fetch 5-day weather forecast
function getWeatherForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            if (json.cod == '404') {
                container.style.height = '400px';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                return;
            }
            displayForecast(json);  // Display the forecast data
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}


function displayForecast(json) {
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Filter forecast data to get one forecast per day (at 12:00 PM)
    const dailyForecast = json.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecast.forEach(forecast => {
        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast');

        const date = new Date(forecast.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const iconCode = forecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        forecastElement.innerHTML = `
            <div class="day">${day}</div>
            <img src="${iconUrl}" alt="${forecast.weather[0].description}">
            <div class="temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="desc">${forecast.weather[0].description}</div>
        `;

        forecastContainer.appendChild(forecastElement);
    });
}


searchButton.addEventListener('click', getWeather);

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});

window.addEventListener('load', getCurrentLocationWeather);