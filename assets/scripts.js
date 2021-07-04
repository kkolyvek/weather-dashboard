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
        // .then(response => response.json())
        .then(function (response) {
            if (response.status === 404) {
                alert('Please enter a valid city!');
            };
            return response.json()
        })
        .then(function (data) {
            // GRAB LATITUDE AND LONGITUDE FOR SECOND API CALL
            cityLat = data.coord.lat;
            cityLon = data.coord.lon;

            // GRAB INITIAL DATA
            cityName = data.name;
            
            // UPDATE PAGE WITH CITY NAME AND DATE
            showCityName(cityName);


            // if api fetch worked, save to local storage
            if (cityName) {
                searchHistory.unshift(cityName);
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                showHistory(searchHistory);
            };


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
            cityWeatherIcon = data.current.weather[0].icon;
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
    // Update city with weather icon
    var iconURL = 'http://openweathermap.org/img/wn/' + icon + '@2x.png';
    $('#currentCity').append('  <img src="' + iconURL + '"/>');
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
        $('#currentUV').css('color', 'black');
    } else {
        $('#currentUV').css('background-color', 'red');
    };
};

function showForecast(data) {
    // show 5 days worth of forecast
    $('#5day').text('5 Day Forecast:')

    for (var i=1; i<6; i++) {
        var iconURL = 'http://openweathermap.org/img/wn/' + data.daily[i].weather[0].icon + '.png';
        var date = moment(data.daily[i].dt, 'X').format('MM/DD/YYYY')
        var temp = data.daily[i].temp.max;
        var wind = data.daily[i].wind_speed;
        var hum = data.daily[i].humidity;

        $('#icon' + i).attr({'src':iconURL, 'alt':data.daily[i].weather[0].description});
        $('#date' + i).text(date);
        $('#temp' + i).text('Temp: ' + temp + '°F');
        $('#wind' + i).text('Wind: ' + wind + ' MPH');
        $('#hum' + i).text('Humidity: ' + hum + '%');
    };
};

function showHistory(history) {
    // empty existing list
    $('#search-history').empty();

    for (var i=0; i<history.length; i++) {
        // create element
        var wrapper = $('<a></a>');
        var iconSpan = $('<span></span>');
        var icon = $('<i></i>');

        // add necessary styling
        wrapper.addClass('panel-block');
        iconSpan.addClass('panel-icon');
        // icon.addClass('fas fa-map-marked-alt');
        icon.attr({'class':'fas fa-map-marked-alt', 'aria-hidden':'true'});

        // append element
        iconSpan.append(icon);
        wrapper.append(iconSpan);
        wrapper.append(history[i]);
        $('#search-history').append(wrapper);
    };
};

// EVENT LISTENERS

$('#search-city').on('click', function() {
    // parse the inputted city name and hit the API
    var searchTerm = $('#searchTerm').val();

    if (!searchTerm) {
        return
    };
    
    var cityAPI = base + 'weather?q=' + searchTerm + '&appid=' + key + '&units=imperial';
    getCityData(cityAPI);

    // clear search bar
    $('#searchTerm').val('');
});

$('#search-history').on('click', function(event) {
    if (event.target.matches('.panel-block')) {
        // ping API again for whatever city is in the search history
        var cityAPI = base + 'weather?q=' + event.target.text + '&appid=' + key + '&units=imperial';
        getCityData(cityAPI);
    };
});

$('#clear-history').on('click', function() {
    // empty search history div and clear local storage variable
    $('#search-history').empty();

    // empty the history array and remove from local storage
    searchHistory = [];
    localStorage.removeItem('searchHistory');
});





// display search history on load
showHistory(searchHistory);