// GLOBAL VARIABLES
// api
var base = 'https://api.openweathermap.org/data/2.5/';
var key = '3aaffc607c675d1467c29c240ffee2e0';

// init variables
var cityName = '';
var cityLat = 0;
var cityLon = 0;
var currentWeatherDisplay = $('#currentWeather');

// local storage
if (!localStorage.getItem('searchHistory')) {
    var searchHistory = [];
} else {
    var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
};



// FUNCTIONS

function getCityData(api) {
    // USE FIRST API TO GET LATITUDE/LONGITUDE
    fetch(api)
        .then(response => response.json())
        .then(function (data) {
            // GRAB LATITUDE AND LONGITUDE FOR SECOND API CALL
            cityLat = data.coord.lat;
            cityLon = data.coord.lon;

            // GRAB INITIAL DATA
            cityName = data.name;
            
            // UPDATE PAGE WITH CITY NAME AND DATE
            showCityName(cityName);

            // GET FUTURE WEATHER DATA
            var weatherAPI = base + 'onecall?lat=' + cityLat + '&lon=' + cityLon + '&exclude=minutely,hourly&appid=' + key + '&units=imperial';

            console.log('Fetching data...')
            getWeatherData(weatherAPI)
        });
};

function getWeatherData(api) {
    // USE SECOND API TO GET RELEVANT WEATHER DATA
    fetch(api)
        .then(response => response.json())
        .then(function (data) {
            // CURRENT WEATHER
            cityWeatherIcon = data.current.weather.icon;
            cityTemp = data.current.temp;
            cityWind = data.current.wind_speed;
            cityHumidity = data.current.humidity;
            cityUV = data.current.uvi

            showCurrentWeather(cityWeatherIcon, cityTemp, cityWind, cityHumidity, cityUV);

            // 5-DAY FORECAST WEATHER
            showForecast(data);
        });
};


function showCityName(city) {
    // display city name and date
    var date = moment().format('MM/DD/YYYY');
    $('#currentCity').text(city + ' - ' + date);
};

function showCurrentWeather(icon, temp, wind, humidity, UV) {
    // replace text of main current weather card with data from API
    $('#currentTemp').text('Temp: ' + temp + '°F');
    $('#currentWind').text('Wind: ' + wind + ' MPH');
    $('#currentHum').text('Humidity: ' + humidity + '%');
    $('#currentUVTitle').text('UV Index: ');
    $('#currentUV').text(UV)
    // color code UV Index
    if (UV <= 5) {
        $('#currentUV').css('background-color', 'green');
    } else if (UV <= 7) {
        $('#currentUV').css('background-color', 'yellow');
    } else {
        $('#currentUV').css('background-color', 'red');
    };
};

function showForecast(data) {
    // show 5 days worth of forecast
    $('#5day').text('5 Day Forecast:')

    for (var i=1; i<6; i++) {
        var date = moment(data.daily[i].dt, 'X').format('MM/DD/YYYY')
        var temp = data.daily[i].temp.max;
        var wind = data.daily[i].wind_speed;
        var hum = data.daily[i].humidity;

        $('#date' + i).text(date);
        $('#temp' + i).text('Temp: ' + temp + '°F');
        $('#wind' + i).text('Wind: ' + wind + ' MPH');
        $('#hum' + i).text('Humidity: ' + hum + '%');
    };
};



// EVENT LISTENERS

$('#search-city').on('click', function() {
    // clear current search
    // $('#currentWeather').empty();
    // $('#futureForecast').empty();

    // parse the inputted city name and hit the API
    var searchTerm = $('#searchTerm').val();

    if (!searchTerm) {
        return
    };
    
    var cityAPI = base + 'weather?q=' + searchTerm + '&appid=' + key + '&units=imperial';
    getCityData(cityAPI);
});

$('#clear-history').on('click', function() {
    // empty search history div and clear local storage variable
    $('#search-history').empty();
    localStorage.removeItem('searchHistory');
});