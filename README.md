# OpenWeatherMap Exporter

A simple node.js app for exporting fetched [openweathermap.org](http://openweathermap.org) data to [Open Metrics](https://openmetrics.io/) format required by Prometheus.

The app relies on environment variables for configuration. These shoud be placed inside the .env file and passed to the container at runtime using the `--env-file` flag.

```bash
OPEN_WEATHER_API_KEY=abcdef123456890
OPEN_WEATHER_LOCATION_ID=2636439
```

**To build**, you need the Docker environment installed. 

```bash
docker image build -t <username>/open-weather-exporter .
```

**To run** the container:

```bash
docker container run --detach --publish 9100:9100 --env-file .env <username>/open-weather-exporter 
```

**To test** the installation:
```bash
curl localhost:9100/metrics
```

```
#HELP sensor_air_temperature Air temperature in degrees Celsius (˚C)
#TYPE sensor_air_temperature guage
sensor_air_temperature{location="OpenWeather"} 18.62
#HELP sensor_air_relative_humidity Air relative humidity in percentage (%H)
#TYPE sensor_air_relative_humidity guage
sensor_air_relative_humidity{location="OpenWeather"} 77
#HELP sensor_air_pressure Air pressure in hectopascals (hPa)
#TYPE sensor_air_pressure guage
sensor_air_pressure{location="OpenWeather"} 1027
```