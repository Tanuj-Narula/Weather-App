const weatherApi = "https://api.open-meteo.com/v1/forecast"; 
const newLocationUrl ="https://geocoding-api.open-meteo.com/v1/search";
const userlocationApi = "https://api.geoapify.com/v1/geocode/reverse?";
let city = document.querySelector(".location"); 
let currentHours,currentMinutes,userlocationData,currentTime;
let Timedata, timeZone= '';

async function getUserCoords(){
  try {
      navigator.geolocation.getCurrentPosition(async (p)=>{
      params.latitude = p.coords.latitude;
      params.longitude = p.coords.longitude;
      await getuserlocationname(p.coords.latitude, p.coords.longitude);
      await getTime();
      await getForecast();
      if(userlocationData.features[0].properties.state){
        city.innerText =  userlocationData.features[0].properties.state.toUpperCase();   
      }
      else if(userlocationData.features[0].properties.city){
        city.innerText =  userlocationData.features[0].properties.city.toUpperCase();
      }
    }); 
  }catch (error) {
   console.log(error);
   alert(error);
   window.location.reload();
  }
}

async function getuserlocationname(latitude,longitude){
  try {
    let locationName =  await fetch(`${userlocationApi}lat=${latitude}&lon=${longitude}&apiKey=08ced47036fc4a89a307364d85b0c526`);
    userlocationData = await locationName.json();
    console.log(userlocationData);
    params.timezone = userlocationData.features[0].properties.timezone.name;
    timeZone = userlocationData.features[0].properties.timezone.name;
  } catch (error) {
    alert(error);
    console.log(error);
    window.location.reload();
  }
}

async function getTime(){
  try {
    let response = await fetch(`https://api.api-ninjas.com/v1/worldtime?timezone=${timeZone}&X-Api-Key=R2r3gufLzdh6BqOYswIltA==eoFTePNarkj1Acce`);
    Timedata = await response.json();
  } catch (error) {
    alert(error);
    console.log(error);
    window.location.reload();
  }
}


document.querySelector("button").addEventListener("click",(evt)=>{
    city.innerText = document.querySelector(".search").value.toUpperCase();
    locate();
    evt.preventDefault();
})


async function locate(){
  try {
    let url = `${newLocationUrl}?name=${city.innerText}&count=1`
    let response = await fetch(url);
    let newLocationData = await response.json();
    params.latitude = newLocationData.results[0].latitude;
    params.longitude= newLocationData.results[0].longitude;
    await getuserlocationname(newLocationData.results[0].latitude,newLocationData.results[0].longitude);
    await getTime();
    await getForecast();
    document.querySelector(".search").value = "";
  }catch (error) {
    alert(error);
    console.log(error);
    window.location.reload();
  }
}

const params = {
	"latitude": 0,
	"longitude": 0,
    "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "weather_code", "wind_speed_10m"],
	"hourly": ["temperature_2m", "weather_code", "wind_speed_10m","precipitation_probability","is_day"],
	"daily": ["temperature_2m_max", "temperature_2m_min", "sunrise", "sunset","weather_code"],
	"timezone": "GMT"
};

async function getForecast(){
  try {
    let url = `${weatherApi}?${new URLSearchParams(params).toString()}`;
    let response = await fetch(url);
    let weatherData = await response.json();
    console.log("weather data:" ,weatherData);
    updatetime(weatherData.current.time.slice(0,10),Timedata.hour,Timedata.minute);
    updateCurrentDetails(weatherData.current.temperature_2m,
        weatherData.current.apparent_temperature,
        weatherData.current.relative_humidity_2m,
        weatherData.current.wind_speed_10m,
        weatherData.daily.sunrise[0].slice(-5),
        weatherData.daily.sunset[0].slice(-5),
        weatherData.current,
        weatherData.hourly
    );  
    updateHourlyDetails(weatherData.hourly);
    updateDailyDetails(weatherData.daily);
    if(weatherData.current.is_day){
        updateDay(weatherData.current.weather_code);
    }else{
        updateNight(weatherData.current.weather_code);
    }
    }catch (error) {
        alert(error);
        console.log(error);
        window.location.reload();
    }
}

window.addEventListener("load",async ()=>{
  await getUserCoords();
})



