import { useEffect, useState } from 'react'
import axios from 'axios'
import { Filter, PersonForm, Persons } from './components/Phonebook'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    axios
      .get('http://localhost:3001/persons')
      .then(response => setPersons(response.data))
      .catch(error => {
        console.error('Failed to load persons from the server:', error)
        setLoadError(
          'Could not load the phonebook. Make sure the JSON Server is running.'
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const addPerson = event => {
    event.preventDefault()

    const normalizedName = newName.trim()
    const nameExists = persons.some(
      person => person.name.toLowerCase() === normalizedName.toLowerCase()
    )

    if (nameExists) {
      window.alert(`${normalizedName} is already added to phonebook`)
      return
    }

    const person = {
      name: normalizedName,
      number: newNumber.trim(),
      id: Math.max(0, ...persons.map(person => person.id)) + 1,
    }

    setPersons(persons.concat(person))
    setNewName('')
    setNewNumber('')
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.trim().toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      {loading && <p>Loading phonebook...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      <Filter value={filter} onChange={setFilter} />
      <h3>Add a new</h3>
      <PersonForm
        name={newName}
        number={newNumber}
        onNameChange={setNewName}
        onNumberChange={setNewNumber}
        onSubmit={addPerson}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} />
    </div>
  )
}

export default App
