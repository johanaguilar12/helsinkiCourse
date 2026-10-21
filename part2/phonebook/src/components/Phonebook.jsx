export const Filter = ({ value, onChange }) => (
  <div>
    filter shown with:{' '}
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  </div>
)

export const PersonForm = ({
  name,
  number,
  onNameChange,
  onNumberChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit}>
    <div>
      name:{' '}
      <input
        value={name}
        onChange={event => onNameChange(event.target.value)}
      />
    </div>
    <div>
      number:{' '}
      <input
        value={number}
        onChange={event => onNumberChange(event.target.value)}
      />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Person = ({ person }) => (
  <li>
    {person.name} {person.number}
  </li>
)

export const Persons = ({ persons }) => (
  <ul>
    {persons.map(person => (
      <Person key={person.id} person={person} />
    ))}
  </ul>
)
