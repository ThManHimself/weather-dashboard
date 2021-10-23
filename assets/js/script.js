const searchedCity = document.getElementById('searchedCity');
const citySearchFormEl = document.getElementById('city-search');
const submitCitySearch = document.getElementById('city-search-btn');
let searchHistory = [];


const formSubmitHandler = (e) => {
    e.preventDefault();
    let cityName = searchedCity.value.trim();
    // if there was input into the search field, get the data of that city
    if (cityName) {
        queryWeatherData(cityName);
        cityName.value = '';
    } else {
        alert('Enter a city name, stoopid!');
    }
    citySearchFormEl.reset();
};

function queryWeatherData(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=8bc0c59529456976b25bd3e2e58f2ccd`)
    .then(response => {
        // save searched city to localStorage with saveSearchHistory()
        saveSearchHistory(cityName);
        return response.json()
    })
    .then(cityData => {
        console.log(cityData);
        // retrieve the data we need from what was returned from the fetch requests
        const latitude = cityData.coord.lat
        const longitude = cityData.coord.lon
        const weatherTypePicture = cityData.weather[0].icon
        const typePicture = document.getElementById('typePicture');
        // give the element a picture based on the current weather
        typePicture.setAttribute('src', `http://openweathermap.org/img/wn/${weatherTypePicture}@2x.png`)

        // fetch weather data for searched city
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=imperial&exclude=minutely,hourly,alerts&appid=8bc0c59529456976b25bd3e2e58f2ccd`)
        .then(weatherData => {
            return weatherData.json();
        })
        .then(weatherData => {
            fiveDayforecast(weatherData)
            const date = new Date(weatherData.current.dt * 1000);
            const currentDate = Intl.DateTimeFormat('en-US').format(date);

            // get the UV index 
            const UVI = Math.round(weatherData.current.uvi);

            // if the UV Index is low
            if (UVI < 3) {
                document.getElementById('UVI').classList.remove("moderateRiskUVI", "moderateHighRiskUVI", "highRiskUVI", "extremeRiskUVI");
                document.getElementById('UVI').classList.add("lowRiskUVI");
            } else if (UVI >=3 && UVI < 5) {
                document.getElementById('UVI').classList.remove("lowRiskUVI", "moderateHighRiskUVI", "highRiskUVI", "extremelRiskUVI");
                document.getElementById('UVI').classList.add("moderateRiskUVI");
            } else if (UVI >=5 && UVI < 7) {
                document.getElementById('UVI').classList.remove("lowRiskUVI", "moderateRiskUVI", "highRiskUVI", "extremelRiskUVI");
                document.getElementById('UVI').classList.add("moderateHighRiskUVI");
            } else if (UVI >=7 && UVI <= 10) {
                document.getElementById('UVI').classList.remove("lowRiskUVI", "moderateRiskUVI", "moderateHighRiskUVI","extremelRiskUVI");
                document.getElementById('UVI').classList.add("highRiskUVI");
            } else {
                document.getElementById('UVI').classList.remove("lowRiskUVI", "moderateRiskUVI", "moderateHighRiskUVI", "highRiskUVI");
                document.getElementById('UVI').classList.add("extremelRiskUVI");
            }

            // current weather data
            document.getElementById('searchedCityName').innerHTML = '' + cityName + currentDate + '';
            document.getElementById('humidityNow').innerHTML = 'Humidity: ' + weatherData.current.humidity + '%';
            document.getElementById('windNow').innerHTML = 'Wind: ' + weatherData.current.wind_speed + ' MPH';
            document.getElementById('tempNow').innerHTML = 'Temp: ' + weatherData.current.temp + '&#8457';
            document.getElementById('UVI').innerHTML = 'UV Index: ' + weatherData.current.uvi;

            // reload saved button from localStorage and put load on the page
            getSearchHistory();
        })
    });
};



// for use in queryWeatherData()
function fiveDayforecast(forecast) {
    // clear 5-day forecast data, if there is any
    $('#fiveDayContainer').empty();
    // replace old data with newly searched data(from fetch request in queryWeatherData())
    for (let i = 0; i < 5; i++) {
        displayDailyforecast(forecast.daily[i]);
    }
};

// for use in fiveDayforecast()
function displayDailyforecast(fiveDayData) {
    // retrieve the data we need from what was returned from the fetch requests
    const date = Intl.DateTimeFormat('en-US').format(new Date(fiveDayData.dt * 1000));
    const typePicture = fiveDayData.weather[0].icon;
    const TEMP = fiveDayData.temp.day;
    const HUMIDITY = fiveDayData.humidity;
    const WIND = fiveDayData.wind_speed;

    // dynamically create cards for each of the next 5 days weather
    const dailyCard = `
        <div class="column col s12 m6">
            <div class="card">
                <ul class="list-group list-group-flush">
                    <h4 class="list-group-item date">${date}</h4>
                    <img class="list-group-item weather-icon" src="http://openweathermap.org/img/wn/${typePicture}@2x.png" alt="Picture of the weather type">
                    <li class="list-group-item temp">Temperature: ${TEMP} </li>
                    <li class="list-group-item wind">Wind Speed: ${WIND} </li>
                    <li class="list-group-item humidity">Humidity: ${HUMIDITY}% </li>
                </ul>
            </div>
        </div>
    `;

    // append the card to the parent element
    $('#fiveDayContainer').append(dailyCard);
};



// save search history to load on next visit to website
function saveSearchHistory(cityName) {
    searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    console.log(searchHistory);

    if (!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
};

// get search history from localStorage
function getSearchHistory() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    console.log(searchHistory);

    // clear SH buttons of any content they have
    $('#searchHistoryBtns').empty();
    // if there is search history in localStorage
    if (searchHistory.length > 0) {
        // take each one
        for(let i = 0; i < searchHistory.length; i++) {
            // create a button element for it
            let historyItem = $('<button>').attr('class', 'btn btn-secondary searchHistoryBtns').text(searchHistory[i]);
            // and append it to the parent element
            $('#searchHistoryBtns').append(historyItem);
        }
    }
};

// load search history from localStorage
getSearchHistory();



// add event listener to search form
citySearchFormEl.addEventListener('submit', formSubmitHandler);



// Search city weather data when a city search button is clicked
$(document).on('click', '.searchHistoryBtns', function(onClick) {
    onClick.preventDefault();
    console.log(this.textContent);
    this.value = '';
    console.log(this);
    console.log(this.textContent);
    const displayClickedCity = this.textContent;
    queryWeatherData(displayClickedCity);
});
