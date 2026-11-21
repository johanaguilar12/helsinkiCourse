const CountryDetails = ({ country, weather, weatherError }) => {
  const languages = country.languages
    ? Object.values(country.languages)
    : []

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital {country.capital?.join(', ')}</p>
      <p>Area {country.area}</p>
      <h3>Languages</h3>
      <ul>
        {languages.map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img
        className="flag"
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
      />

      {country.capital?.[0] && (
        <>
          <h3>Weather in {country.capital[0]}</h3>
          {weatherError && <p>{weatherError}</p>}
          {weather && (
            <div>
              <p>Temperature {weather.main.temp} Celsius</p>
              {weather.weather[0]?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                />
              )}
              <p>Wind {weather.wind.speed} m/s</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CountryDetails
