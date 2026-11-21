import { useEffect, useState } from 'react'
import axios from 'axios'
import CountryDetails from './components/CountryDetails'

const countriesUrl = 'https://studies.cs.helsinki.fi/restcountries/'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState('')

  useEffect(() => {
    axios
      .get(`${countriesUrl}api/all`)
      .then(response => setCountries(response.data))
      .catch(error => {
        console.error('Failed to load countries:', error)
      })
  }, [])

  const matches = query.trim()
    ? countries.filter(country =>
        country.name.common
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : []

  const countryToDisplay =
    selectedCountry && matches.length > 1
      ? selectedCountry
      : matches.length === 1
        ? matches[0]
        : null

  const weatherConfigurationError =
    import.meta.env.VITE_OPENWEATHER_API_KEY
      ? weatherError
      : 'Weather API key is not configured'

  useEffect(() => {
    if (!countryToDisplay?.capital?.[0]) {
      return
    }

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!apiKey) {
      return
    }

    const capital = countryToDisplay.capital[0]
    let cancelled = false

    axios
      .get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: capital,
          appid: apiKey,
          units: 'metric',
        },
      })
      .then(response => {
        if (!cancelled) {
          setWeather(response.data)
          setWeatherError('')
        }
      })
      .catch(error => {
        console.error('Failed to load weather:', error)
        if (cancelled) {
          return
        }

        setWeather(null)

        if (error.response?.status === 401) {
          setWeatherError(
            'OpenWeather rejected the API key. Check that it is correct and activated.'
          )
        } else if (error.response?.status === 404) {
          setWeatherError(`Weather data was not found for ${capital}.`)
        } else if (!error.response) {
          setWeatherError('Could not reach OpenWeather. Check your connection.')
        } else {
          setWeatherError(
            `OpenWeather returned an error (HTTP ${error.response.status}).`
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [countryToDisplay])

  let result

  if (!query.trim()) {
    result = null
  } else if (matches.length > 10) {
    result = <p>Too many matches, specify another filter</p>
  } else if (matches.length > 1) {
    result = (
      <ul>
        {matches.map(country => (
          <li key={country.cca3}>
            {country.name.common}{' '}
            <button
              onClick={() => {
                setSelectedCountry(country)
                setWeather(null)
                setWeatherError('')
              }}
            >
              show
            </button>
          </li>
        ))}
      </ul>
    )
  } else if (matches.length === 1) {
    result = (
      <CountryDetails
        country={matches[0]}
        weather={weather}
        weatherError={weatherConfigurationError}
      />
    )
  } else {
    result = <p>No matches</p>
  }

  return (
    <div>
      <h1>Countries</h1>
      <div>
        find countries{' '}
        <input
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setSelectedCountry(null)
            setWeather(null)
            setWeatherError('')
          }}
        />
      </div>
      {countryToDisplay ? (
        <CountryDetails
          country={countryToDisplay}
          weather={weather}
          weatherError={weatherConfigurationError}
        />
      ) : (
        result
      )}
    </div>
  )
}

export default App
