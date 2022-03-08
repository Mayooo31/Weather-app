"use strict";

// Google API key for photo and current coords
const apiKey = "AIzaSyDZX8IQyuF5VpGmZ6TG7_przQBbM48w6ts";

// API key for weather info
const apiKeyWeather = "f4928461d9d6b08fe31a2fc25d5a91bd";

// Elements
const photoEl = document.querySelector(".photo");
const infoDailyEl = document.querySelector(".info-daily");
const infoCurrentEl = document.querySelector(".info-current");
const iconSearchEl = document.querySelector(".icon-search");
const inputSearchEl = document.querySelector(".input-search");
const cors = document.querySelector(".cors");
const city = document.querySelector(".city");
const date = document.querySelector(".date");
const time = document.querySelector(".time");
const btnUnits = document.querySelector(".units-button");
const icocMain = document.querySelector(".main-img");
const infoAboutMe = document.querySelector(".main-info");
const invis = document.querySelector(".invis");
const hidden = document.querySelector(".hidden");
const error = document.querySelector(".error");

/////////////////////////////////////////////////////////////

icocMain.addEventListener("click", function () {
  infoAboutMe.classList.toggle("hidden");
});
// icocMain.addEventListener("mouseenter", function () {
//   infoAboutMe.style.opacity = "1";
// });

// infoAboutMe.addEventListener("mouseleave", function () {
//   infoAboutMe.style.opacity = "0";
// });
// icocMain.addEventListener("mouseout", function () {
//   setTimeout(() => {
//     infoAboutMe.style.opacity = "0";
//   }, 100);
// });

/////////////////////////////////////////////////////////////
let interval;
iconSearchEl.addEventListener("click", function () {
  showCity(inputSearchEl.value);
  clearInterval(interval);
});

/////////////////////////////////////////////////////////////
inputSearchEl.addEventListener("keydown", enterKey);

function enterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    showCity(inputSearchEl.value);
    clearInterval(interval);
    inputSearchEl.value = "";
  }
}
////////////////////////////////////////////////////////////////

function setClock(data) {
  interval = setInterval(oneSec, 1000);
  function oneSec() {
    // console.log(offset);
    const curDate = new Date();
    const minute = curDate.getMinutes();
    const hour1 = curDate.getHours() + (data.timezone_offset / 60 / 60 - 1);
    const noDecimalNumber = Number(hour1.toFixed(0));
    const hour = noDecimalNumber < 1 ? 24 + noDecimalNumber : noDecimalNumber;
    const timeToAMorPM = hour >= 24 ? hour - 24 : hour;

    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const ampm = timeToAMorPM >= 12 ? "PM" : "AM";

    // console.log(hoursIn12HrFormat, minute, second);

    let timeItem = `<div class="time-photo">${
      hoursIn12HrFormat < 10 ? "0" + hoursIn12HrFormat : hoursIn12HrFormat
    }:${minute < 10 ? "0" + minute : minute} ${ampm}</div>`;

    time.innerHTML = timeItem;
  }
  oneSec();
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

navigator.geolocation.getCurrentPosition(
  function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    // console.log(latitude, longitude);

    const positionByCoords = async function (lat, long) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`
      );
      const data = await res.json();
      const myPosition = data.results[0].address_components[3].short_name;
      // console.log(myPosition);
      showCity(myPosition);
    };
    positionByCoords(latitude, longitude);
  },
  function () {
    console.log("Could not get your position!");
  }
);

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
let units = "metric";
let curId = "";
let unit = "&#176;C";
let unitSpeed = "km/h";

const change = function () {
  // units = "imperial" ? "metric" : "imperial";
  if (units === "metric") {
    units = "imperial";
    unit = "&#176;F";
    unitSpeed = "mil/h";
    showId(curId);
    clearInterval(interval);

    console.log(units);
  } else {
    units = "metric";
    unit = "&#176;C";
    unitSpeed = "km/h";
    showId(curId);
    clearInterval(interval);
  }
};

btnUnits.addEventListener("click", change);

const showCity = async function (city) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${city}&inputtype=textquery&key=${apiKey}`
    );
    const data = await res.json();
    if (data.status !== "OK") {
      error.style.display = "block";

      setTimeout(() => {
        error.style.display = "none";
      }, 4000);
    }

    const placeId = data.candidates[0].place_id;
    curId = placeId;
    // console.log(placeId);

    showId(placeId);
  } catch (err) {
    console.error(err);
  }
};

const showId = async function (id) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&inputtype=textquery&key=${apiKey}`
    );
    const data = await res.json();
    curPlaceIntoDOM(data.result);
    // console.log(data);

    const lat = data.result.geometry.location.lat;
    const lng = data.result.geometry.location.lng;
    // console.log(lat, lng);

    const photosArray = data.result.photos;
    let photo = photosArray.find(function (mov, i) {
      if (mov.width / mov.height >= 1.41) return data.result.photos[i];
    });
    photo = photo.photo_reference;
    // console.log(photo);

    const showWeater = async function (lt, lg) {
      try {
        // btnUnits.addEventListener("click", function () {});

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lt}&lon=${lg}&exclude=hourly,minutely&units=${units}&appid=${apiKeyWeather}`
        );

        const data = await res.json();
        // console.log(data);

        setClock(data);
        timeIntoDOM(data);
        weekIntoDOM(data.daily);
        dayIntoDOM(data);
      } catch (err) {
        console.error(err);
      }
    };
    showWeater(lat, lng);

    const showPhoto = async function (photoOf) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoOf}&key=${apiKey}`
        );
        const urlPhoto = await res.url;
        // console.log(urlPhoto);

        photoEl.innerHTML = `<img src="${urlPhoto}"/>`;
      } catch (err) {
        console.error(err);
      }
    };

    showPhoto(photo);
  } catch (err) {
    console.error(err);
  }
};

let corsItem = "";
let cityItem = "";

const curPlaceIntoDOM = function (data) {
  // console.log(data);
  corsItem = `<div class="cors-photo">${data.geometry.location.lat.toFixed(
    4
  )}N ${data.geometry.location.lng.toFixed(4)}E</div>`;

  cityItem = `<div class="city-photo">${data.formatted_address}</div>`;

  cors.innerHTML = corsItem;
  city.innerHTML = cityItem;
};

const timeIntoDOM = function (data) {
  let dateItem = `<div class="date-photo">${moment(
    data.current.dt * 1000 + data.timezone_offset * 1000 - 3600
  ).format("MMMM Do YYYY")}</div>`;

  date.innerHTML = dateItem;
};

const weekIntoDOM = function (data) {
  // console.log(data);
  let weatherItem = "";

  data.forEach(function (day, i) {
    if (i === 7) return;
    if (i === 0) {
      weatherItem += `<div class="weather-item">
      <div class="day"><span>Today</span></div>
      <img
        src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
        alt="icon of weather"
        class="icon-weather"
      />
      <div class="temp">${day.temp.day.toFixed(1)}${unit}</div>
      <div class="temp">${day.temp.night.toFixed(1)}${unit}</div>
    </div>`;
    } else {
      weatherItem += `<div class="weather-item">
      <div class="day">${window.moment(day.dt * 1000).format("ddd")}</div>
      <img
        src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
        alt="icon of weather"
        class="icon-weather"
      />
      <div class="temp">${day.temp.day.toFixed(1)}${unit}</div>
      <div class="temp">${day.temp.night.toFixed(1)}${unit}</div>
    </div>`;
    }
  });
  infoDailyEl.innerHTML = weatherItem;
};

const dayIntoDOM = function (data) {
  // console.log(data);
  let weatherItemCurrent = `
  <div class="current-item current--1">
               <p class="current-temp">${data.current.temp.toFixed(
                 1
               )}${unit}</p>
                <p class="current-feels_like"><span>feels like:</span> ${data.current.feels_like.toFixed(
                  1
                )}${unit}</p>
              </div>
           <div class="current-item current--2">
            <p class="current-description">${
              data.current.weather[0].description
            }</p>
            <img
              src="http://openweathermap.org/img/wn/${
                data.current.weather[0].icon
              }@2x.png"
              alt="icon of weather"
              class="icon-weather--current"
            />
          </div>

          <div class="swiper mySwiper">
            <div class="swiper-wrapper">
              <div class="swiper-slide"><ul>
              <li class="current-feels_like">
                <span>highest temperature:</span>
                ${data.daily[0].temp.max.toFixed(1)}${unit}
              </li>
              <li class="current-feels_like">
                <span>lowest temperature:</span>
                ${data.daily[0].temp.min.toFixed(1)}${unit}
              </li>
              <li class="current-feels_like"><span>humidity:</span> ${
                data.current.humidity
              }%</li>
              </ul></div>
              <div class="swiper-slide"><ul>
              <li class="current-feels_like"><span>sunrise:</span> ${moment(
                data.current.sunrise * 1000 +
                  data.timezone_offset * 1000 -
                  3600000
              ).format("HH:mm a")}</li>
              <li class="current-feels_like"><span>sunset:</span> ${moment(
                data.current.sunset * 1000 +
                  data.timezone_offset * 1000 -
                  3600000
              ).format("HH:mm a")}</li>
              <li class="current-feels_like"><span>wind speed:</span> ${data.current.wind_speed.toFixed(
                1
              )} ${unitSpeed}</li>
              </ul></div>
              <div class="swiper-slide">
              <ul>
              <li class="current-feels_like"><span>timezone:</span> ${
                data.timezone
              }</li>
               <li class="current-feels_like"><span>timezone offset:</span> UTC ${
                 data.timezone_offset / 60 / 60 > 0
                   ? "+" + data.timezone_offset / 60 / 60
                   : data.timezone_offset / 60 / 60
               }</li>
                 <li class="current-feels_like">
                 <span>pressure:</span> ${data.current.pressure} hPa
               </li>
               </ul></div>
            </div>
            <div class="swiper-button-next "></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
          </div>`;

  infoCurrentEl.innerHTML = weatherItemCurrent;

  // Swiper.js script :)

  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
};
