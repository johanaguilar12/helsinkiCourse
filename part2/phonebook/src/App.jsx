import { useState } from 'react'
import { Filter, PersonForm, Persons } from './components/Phonebook'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
  ])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

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
