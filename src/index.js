import React, { useState, useEffect, Fragment } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import axios from "axios";

var API_Key = "883371a749318126cbf0149cc39a7aba";

function App() {
    const [forecasts, setForecasts] = useState([]);

    useEffect(() => {
        axios
            .get("https://api.openweathermap.org/data/2.5/onecall", {
                params: {
                    lat: 37.773972,
                    lon: -122.431297,
                    appid: API_Key,
                    units: "imperial"
                }
            })
            .then(res => {
                const newDailyforecasts = res.data.daily.map(obj => obj);
                const newHourlyforecasts = res.data.hourly.map(obj => obj);

                const current_hour = new Date().getHours();
                const day1 = newHourlyforecasts.slice(0, 24 - current_hour);
                const day2 = newHourlyforecasts.slice(24 - current_hour, 24 + (24 - current_hour));
                const day3 = newHourlyforecasts.slice(24 + (24 - current_hour));

                const newHFs = [day1, day2, day3];

                const zippedforecasts = newDailyforecasts.map((day, index) => {
                    return newHFs[index] ? { dailyForecast: day, hourlyForecast: newHFs[index] } : { dailyForecast: day };
                });

                setForecasts(zippedforecasts);
            });
    }, []);

    return (
        <div>
            <Week forecasts={forecasts} />
        </div>
    );
}

function GetDays() {
    const days = {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat"
    };

    const curr = new Date();
    const today = curr.getDay();

    const week = [];
    var i;
    for (i = 0; i < 7; i++) {
        if (today + i < 7) {
            week.push(today + i);
        } else {
            week.push(today + i - 7);
        }
    }

    const weekdays = week.map(day => days[day]);
    weekdays.push(weekdays[0]);

    return weekdays;
}

function Week(props) {
    const [days] = useState(GetDays());

    return (
        <div>
            <h3>Weekly forecast for </h3>
            <h1>San Francisco, CA</h1>
            {props.forecasts.map((day, index) => (
                <Day key={index} forecasts={day} day={days[index]} />
            ))}
        </div>
    );
}

function Day(props) {
    const [displayHourly, setDisplayhourly] = useState(false);
    const iconlink = "http://openweathermap.org/img/wn/".concat(props.forecasts.dailyForecast.weather[0].icon.concat("@2x.png"));
    const iconurlbase = "http://openweathermap.org/img/wn/";

    const showHourly = () => {
        setDisplayhourly(!displayHourly);
    };

    function hourtime(utctime) {
        const time = new Date(0);
        time.setUTCSeconds(utctime);
        const options = {
            hour: "numeric",
            hour12: true
        };
        const hour = time.toLocaleString("en-US", options);
        hour.toString();
        return hour;
    }

    return (
        <div className="daycontainer border">
            <div className="day">
                <span>{props.day}</span>
            </div>
            {!displayHourly ? (
                <div>
                    {props.forecasts.hourlyForecast ? (
                        <div>
                            <a href="#" onClick={showHourly}>
                                Show Hourly Forecast
                            </a>
                        </div>
                    ) : undefined}
                    <div className="graphic">
                        <img src={iconlink} alt="the weather looks like this" />
                    </div>

                    <div className="temps">
                        <span className="hightemp">{Math.round(props.forecasts.dailyForecast.temp.max)}</span>
                        <span className="lowtemp">{Math.round(props.forecasts.dailyForecast.temp.min)}</span>
                    </div>
                </div>
            ) : (
                <div className="hourcontainer">
                    {props.forecasts.hourlyForecast ? (
                        <div>
                            <a href="#" onClick={showHourly}>
                                Show Daily Forecast
                            </a>
                        </div>
                    ) : undefined}
                    <ul>
                        {props.forecasts.hourlyForecast.map((hour, index) => (
                            <li key={index}>
                                {hourtime(hour.dt)}
                                <img src={iconurlbase.concat(hour.weather[0].icon).concat(".png")} alt="here be an img" />
                                {Math.round(hour.temp)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
