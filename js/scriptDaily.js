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

    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"]
                
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

    weatherDaily = (json) => {
        json.then((json) => {
            //check if tables already rendered
            //if yes, delete them and render new ones
            try {
                let div = document.getElementById("daily-row")
                div.innerHTML = ""
            }
            catch {
                //continue
            }
            for(let i = 1; i < 7; i++){
                //create new container and table with classes
                var div = document.createElement('div')
                div.classList.add("column")
                div.classList.add("weather")
                var table = document.createElement('table')
                table.classList.add("weather-table")

                //create table rows(data fields) containing data
                for (let j = 0; j < 4; j++){
                    var tr = document.createElement('tr')
                    var td = document.createElement('td') 
                    
                    switch(j) {
                        case 0:
                            let d = new Date((json.daily[i].dt + json.timezone_offset) * 1000)
                            let date = [this.days[d.getUTCDay()], this.months[d.getUTCMonth()], d.getUTCDate()]
                            var text = document.createTextNode(`${date[0]}\n${date[1]} ${date[2]}`)
                            break
                        case 1:
                            td.id = `daily-temp-${i}`
                            var temp = [Math.round(json.daily[i].temp.min), Math.round(json.daily[i].temp.max)]
                            var text = document.createTextNode(`${temp[0]} / ${temp[1]}${this.temperatureUnit}`)
                            break
                        case 2:
                            td.style.padding = "0%"
                            var img = document.createElement('img')
                            img.src = `http://openweathermap.org/img/wn/${json.daily[i].weather[0].icon}@2x.png`
                            var pic = document.createElement('pic') 
                            pic.appendChild(img)
                            td.appendChild(pic)
                            var text = document.createTextNode("")
                            break
                        case 3:
                            td.classList.add("last")
                            var ii = document.createElement('i')
                            ii.classList.add("fa")
                            ii.classList.add("fa-tint")
                            td.appendChild(ii)
                            var text = document.createTextNode(` ${Math.round(json.daily[i].pop * 100)}%`)
                    }

                    div.appendChild(table)
                    table.appendChild(tr)
                    tr.appendChild(td)
                    td.appendChild(text)
                }
                document.getElementById("daily-row").appendChild(div)
            }
            
        })
    }
}

renderDaily = async () => {
    //wait for geo JSON Promise to fulfill
    var x = await geoJson

    //render location stub
    let stub = document.getElementById("daily-results")
    stub.innerHTML = `Showing results for ${geo.location}, ${geo.country}.
    Looking for a different place? Try searching again in the format City, Country.`
        

    //render tables
    var weather = new Weather(geo.lat, geo.lon)
    const data = weather.makeRequest()
    weather.weatherDaily(data)
}

toggleDaily = () => {
    for(let i = 1; i < 7; i++) {
        let current = document.getElementById(`daily-temp-${i}`).innerHTML
        current = current.split(/[^\dCF-]+/)

        if(current[2] == "F") {
            current[0] = Math.round((current[0] - 32) * 5 / 9)
            current[1] = Math.round((current[1] - 32) * 5 / 9)

            current = `${current[0]} / ${current[1]}°C`
            document.getElementById(`daily-temp-${i}`).innerHTML = current
        }
        else {
            current[0] = Math.round((current[0] * 9 / 5) + 32)
            current[1] = Math.round((current[1] * 9 / 5) + 32)

            current = `${current[0]} / ${current[1]}°F`
            document.getElementById(`daily-temp-${i}`).innerHTML = current
        }
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
var locationInputDaily = document.getElementById("locationInputDaily")
locationInputDaily.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        document.getElementById("searchDaily").click()
    }
})

//listen for search button click
var searchDaily = document.getElementById("searchDaily")
searchDaily.addEventListener("click", async function() {
    var inputVal = document.getElementById("locationInputDaily").value
    
    //check if input isn't empty
    //if it is, don't do anything
    if(inputVal) {
        const geoJson = geo.makeRequest(inputVal)
        await geoJson
        geo.getLatLon(geoJson)
        //display info for new location
        renderDaily()
        //clear search field
        document.getElementById("locationInputDaily").value = "" 
    }
})
