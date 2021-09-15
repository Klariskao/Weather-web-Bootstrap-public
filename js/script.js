class Geo {
    key = "&key=0826219a14f94bfbb49a56b9902f31e8"
    url = "https://api.opencagedata.com/geocode/v1/json"

    getUrl = (place) => `${this.url}?q=${encodeURIComponent(place)}&limit=1${this.key}`

    makeRequest = async (place) => {
        try {
            const fetchResult = fetch(this.getUrl(place))
            const response = await fetchResult;
            const jsonData = await response.json();
            return jsonData;
        }
        catch(error) {
            console.log(error)
        }
    }

    getLatLon = (json) => {
        json.then((json) => {
            try {
                let lat = this.degreeConvertion(json.results[0].annotations.DMS.lat)
                this.lat = lat
                let lon = this.degreeConvertion(json.results[0].annotations.DMS.lng)
                this.lon = lon

                this.location = json.results[0].components.city ? json.results[0].components.city : json.results[0].components.town
                this.country = json.results[0].components.country
            }
            catch {
                alert("The location wasn't found.\nTry searching for something else.")
            }
        })
    }
    
    degreeConvertion = (input) => {
        let parts = (input).split(/[^\d\w\.]+/)
        let degrees = parts[0]
        let direction = parts[3]
        if (direction == "S" || direction == "W") {
            degrees = degrees * -1
        }
        return degrees
    }
}

class Weather {
    constructor(lat, lon) {
        this.lat = lat
        this.lon = lon
    }

    key = "c08b3f72d1bbfdc53e34c571a5cc5c86"
    url = "https://api.openweathermap.org/data/2.5/onecall"

    metricUnit = "imperial"
    temperatureUnit = "°F"
    speedUnit = "m/h"
          
    getIcon = (id) => `http://openweathermap.org/img/wn/${id}@2x.png`
    getUrl = () => `${this.url}?lat=${this.lat}&lon=${this.lon}&units=${this.metricUnit}&exclude=minutely&appid=${this.key}`
    
    makeRequest = async () => {
        try {
            const fetchResult = fetch(this.getUrl())
            const response = await fetchResult;
            const jsonData = await response.json();
            return jsonData;
        }
        catch(error) {
            console.log(error)
        }
    }
    
    uvIndex = (uv) => {
        let index
            if(uv < 3) {
                index = 'Low'
            }
            else if(uv < 6) {
                index = 'Moderate'
            } 
            else if(uv < 8) {
                index = 'High'
            }
            else if(uv < 11) {
                index = 'Very High'
            }
            else {
                index = 'Extreme'
            }
            return index
    }
    
    degreesToCardinal = (deg) => {
        let directions = ['\u2191', '\u2197', '\u2192', '\u2198', '\u2193', '\u2199', '\u2190', '\u2196']
        let ix = Math.round(deg / (360.0 / 8))
        return directions[ix % 8]
    }

    getMinutes = (date) => {
        if(date.getUTCMinutes() > 9) {
            return date.getUTCMinutes()
        }
        else{
            return `0${date.getUTCMinutes()}` 
        }
    }
      
    weatherCurrent = (json) => {
        json.then((json) => {
            //set background image of tables based on weather
            let backCurr1 = document.getElementById("current1")
            backCurr1.style.backgroundImage = `url('styles/images/${json.current.weather[0].main}.jpg')`
            let backCurr2 = document.getElementById("current2")
            backCurr2.style.backgroundImage = `url('styles/images/${json.current.weather[0].main}.jpg')`

            //Fill table 1 of current weather except for location and country
            let currentPic = document.getElementById("currentPic")
            currentPic.src = `http://openweathermap.org/img/wn/${json.current.weather[0].icon}@2x.png`
            let temperatureCurrent = document.getElementById("temperatureCurrent")
            temperatureCurrent.innerHTML = `${Math.round(json.current.temp)}${this.temperatureUnit}`
            let description = document.getElementById("description")
            description.innerHTML = (json.current.weather[0].description).charAt(0).toUpperCase() + (json.current.weather[0].description).slice(1)
            let minMax = document.getElementById("minMax")
            minMax.innerHTML = `${Math.round(json.daily[0].temp.max)} / ${Math.round(json.daily[0].temp.min)}${this.temperatureUnit}`
            let feelsLike = document.getElementById("feelsLike")
            feelsLike.innerHTML = `Feels like ${Math.round(json.current.feels_like)}${this.temperatureUnit}`

            //Fill table 2 of current weather
            let UVindex = document.getElementById("UVindex")
            UVindex.innerHTML = `${this.uvIndex(json.current.uvi)} (${Math.round(json.current.uvi)})`
            let humidity = document.getElementById("humidity")
            humidity.innerHTML = `${json.current.humidity}%`
            let windSpeed = document.getElementById("windSpeed")
            windSpeed.innerHTML = `${Math.round(json.current.wind_speed)} ${this.speedUnit}`
            let windDirection = document.getElementById("windDirection")
            windDirection.innerHTML = `${this.degreesToCardinal(json.current.wind_deg)}`
            let sunrise = document.getElementById("sunrise")
            let d = new Date((json.current.sunrise + json.timezone_offset) * 1000)
            sunrise.innerHTML = `${d.getUTCHours()}:${this.getMinutes(d)}`
            let sunset = document.getElementById("sunset")
            d = new Date((json.current.sunset + json.timezone_offset) * 1000)
            sunset.innerHTML = `${d.getUTCHours()}:${this.getMinutes(d)}`
        })
    }
}

class Dropdown {
    static getUrl = (place) => `http://api.geonames.org/searchJSON?name_startsWith=${place}&featureClass=P&orderby=relevance&maxRows=10&username=klariskao`

    static makeRequest = async (place) => {
        try {
            const fetchResult = fetch(this.getUrl(place))
            const response = await fetchResult
            const jsonData = await response.json()
            return jsonData
        }
        catch(error) {
            console.log(error)
        }
    }

    static renderDropdown = (promise) => {
        promise.then((promise) => {
            //render dropdown option elements
            var drop = document.getElementById("dropdown")
            //check if dropdown already rendered
            //if yes, delete it and render new one
            try {
                drop.innerHTML = ""
            }
            catch {
                //continue
            }
            console.log(promise)
            for (let i = 0; i < 10 && i < promise.totalResultsCount; i++) {
                let option = document.createElement("option")
                console.log(i)
                console.log(`${promise.geonames[i].toponymName}, ${promise.geonames[i].adminName1}, ${promise.geonames[i].countryName}`)
                option.value = `${promise.geonames[i].toponymName}, ${promise.geonames[i].adminName1}, ${promise.geonames[i].countryName}` 
                drop.appendChild(option)
                console.log(drop.childNodes)
            }
        })
    }
}

renderCurrent = async () => {
    //wait for geo JSON Promise to fulfill
    var x = await geoJson

    //render tables
    let location = document.getElementById("location")
    location.innerHTML = `${geo.location ? geo.location : "Unspecified"}`
    let country = document.getElementById("country")
    country.innerHTML = `${geo.country}`

    var weather = new Weather(geo.lat, geo.lon)
    const data = weather.makeRequest()
    weather.weatherCurrent(data)
}

toggleCurrent = () => {
    let current = document.getElementById("temperatureCurrent").innerHTML
    current = current.split("°")

        if(current[1] == "F") {
            current[0] = Math.round((current[0] - 32) * 5 / 9)
            current = current[0] + "°C"
            document.getElementById("temperatureCurrent").innerHTML = current
        }
        else {
            current[0] = Math.round(current[0] * 9 / 5 + 32)
            current = current[0] + "°F"
            document.getElementById("temperatureCurrent").innerHTML = current
        }

    let minMax = document.getElementById("minMax").innerHTML
    minMax = minMax.split(/[^\dCF-]+/)

        if(minMax[2] == "F") {
            minMax[0] = Math.round((minMax[0] - 32) * 5 / 9)
            minMax[1] = Math.round((minMax[1] - 32) * 5 / 9)

            minMax = `${minMax[0]} / ${minMax[1]}°C`
            document.getElementById("minMax").innerHTML = minMax
        }
        else {
            minMax[0] = Math.round((minMax[0] * 9 / 5) + 32)
            minMax[1] = Math.round((minMax[1] * 9 / 5) + 32)

            minMax = `${minMax[0]} / ${minMax[1]}°F`
            document.getElementById("minMax").innerHTML = minMax
        }

    let feelsLike = document.getElementById("feelsLike").innerHTML
    feelsLike = feelsLike.split(/[^\w\d]+/)

        if(feelsLike[3] == "F") {
            feelsLike[2] = Math.round((feelsLike[2] - 32) * 5 / 9)
            feelsLike = `Feels Like ${feelsLike[2]}°C`
            document.getElementById("feelsLike").innerHTML = feelsLike
        }
        else {
            feelsLike[2] = Math.round(feelsLike[2] * 9 / 5 + 32)
            feelsLike = `Feels Like ${feelsLike[2]}°F`
            document.getElementById("feelsLike").innerHTML = feelsLike
        }
    
    let windSpeed = document.getElementById("windSpeed").innerHTML
    windSpeed = windSpeed.split(" ")

        if(windSpeed[1] == "m/h") {
            windSpeed[0] = Math.round(windSpeed[0] / 2.237)
            windSpeed = windSpeed[0] + " m/s"
            document.getElementById("windSpeed").innerHTML = windSpeed
        }
        else {
            windSpeed[0] = Math.round(windSpeed[0] * 2.237)
            windSpeed = windSpeed[0] + " m/h"
            document.getElementById("windSpeed").innerHTML = windSpeed
        }
}

//create geo object and fetch geo JSON
//assign lat, lon, location and country
//properties to the geo object
var geo = new Geo
const geoJson = geo.makeRequest("London")
geo.getLatLon(geoJson)

//allow search by pressing ENTER in search field
//trigger search button click function
var locationInputCurrent = document.getElementById("locationInputCurrent")
locationInputCurrent.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        document.getElementById("searchCurrent").click()
    }
})

//listen for search button click
var searchCurrent = document.getElementById("searchCurrent")
searchCurrent.addEventListener("click", async function() {
    var inputVal = document.getElementById("locationInputCurrent").value
    
    //check if input isn't empty
    //if it is, don't do anything
    if(inputVal) {
        const geoJson = geo.makeRequest(inputVal)
        await geoJson
        geo.getLatLon(geoJson)
        //display info for new location
        renderCurrent()
        //clear search field
        document.getElementById("locationInputCurrent").value = "" 
    }
})

//fetch suggestions for search on input change
var typedCurrent = document.getElementById("locationInputCurrent")
typedCurrent.addEventListener("input", async function() {
    var inputVal = document.getElementById("locationInputCurrent").value
    //make a JSON request on input change
    var response = Dropdown.makeRequest(inputVal)
    //show search suggestions
    Dropdown.renderDropdown(response)
})