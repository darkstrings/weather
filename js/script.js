const main = document.querySelector(".weather");
const cityDisplay = document.querySelector(".city");
const tempDisplay = document.querySelector(".temp");
const descriptionDisplay = document.querySelector(".description");
const humidityDisplay = document.querySelector(".humidity");
const windDisplay = document.querySelector(".wind");
const searchBtn = document.querySelector(".search button");
const searchInput = document.querySelector(".search-bar");
const icon = document.querySelector(".icon");
const warningLine = document.querySelector(".warning_line");
const alertLabel = document.querySelector(".alert_label");
import { WEATHER_API_KEY } from "./wxApiKey.js";

searchBtn.addEventListener("click", function () {
  const cityOrZip = searchInput.value;
  getWeather(cityOrZip);
});

searchInput.addEventListener("keyup", function (e) {
  if (e.key == "Enter") {
    const cityOrZip = searchInput.value;
    getWeather(cityOrZip);
  }
});

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      getWeather(lat, lng);
    },

    (error) => {
      console.error("Error getting user location:", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

///////////////////////GET WEATHER////////////
////////separate API calls for current weather and alerts. And different calls for zip, city/state and coords.

async function getWeather(input1, input2) {
  let dataAlerts;
  let dataCurrent;

  if (isNaN(input1) && !input2) {
    const responseCurrent = await fetch(
      `https://api.weatherbit.io/v2.0/current?city=${input1}&key=${WEATHER_API_KEY}&include=minutely&units=i`
    );
    const responseAlerts = await fetch(`https://api.weatherbit.io/v2.0/alerts?city=${input1}&key=${WEATHER_API_KEY}`);
    dataAlerts = await responseAlerts.json();
    dataCurrent = await responseCurrent.json();
  } else if (!isNaN(input1) && !input2) {
    const responseCurrent = await fetch(
      `https://api.weatherbit.io/v2.0/current?postal_code=${input1}&key=${WEATHER_API_KEY}&include=minutely&units=i`
    );
    const responseAlerts = await fetch(`https://api.weatherbit.io/v2.0/alerts?postal_code=${input1}&key=${WEATHER_API_KEY}`);
    dataAlerts = await responseAlerts.json();
    dataCurrent = await responseCurrent.json();
  } else {
    !isNaN(input1) && !isNaN(input2);

    const responseCurrent = await fetch(
      `https://api.weatherbit.io/v2.0/current?lat=${input1}&lon=${input2}&key=${WEATHER_API_KEY}&include=minutely&units=i`
    );
    const responseAlerts = await fetch(`https://api.weatherbit.io/v2.0/alerts?lat=${input1}&lon=${input2}&key=${WEATHER_API_KEY}`);
    dataAlerts = await responseAlerts.json();
    dataCurrent = await responseCurrent.json();
  }

  displayWeather(dataCurrent);
  displayAlerts(dataAlerts);
}

//////////////////////////DISPLAY CURRENT DATA

function displayWeather(data) {
  cityDisplay.innerHTML = `${data.data[0].city_name}, ${data.data[0].state_code}`;
  tempDisplay.innerHTML = `${Math.floor(data.data[0].app_temp)}°F`;
  descriptionDisplay.innerHTML = `${data.data[0].weather.description} `;
  icon.src = `https://cdn.weatherbit.io/static/img/icons/${data.data[0].weather.icon}.png`;
  windDisplay.innerHTML = `Winds: ${data.data[0].wind_cdir} at ${data.data[0].wind_spd} MPH`;
  humidityDisplay.innerHTML = `Relative Humidity ${data.data[0].rh}%`;
  main.classList.remove("loading");
  document.body.style.backgroundImage = `url(https://source.unsplash.com/1600x900/?${data.name}`;
}

///////////////////////////DISPLAY ALERTS

function displayAlerts(data) {
  const alertNum = data.alerts.length;
  if (alertNum === 0) {
    warningLine.innerHTML = `None`;
  } else {
    warningLine.innerHTML = "";
    alertLabel.innerHTML = `${alertNum} ${alertNum === 1 ? "Alert" : "Alerts"}`;
    data.alerts.forEach((alert) => {
      warningLine.insertAdjacentHTML("beforeend", `<li class="alert_li"><b> ${alert.title}</b></li>`);
    });
  }
}
