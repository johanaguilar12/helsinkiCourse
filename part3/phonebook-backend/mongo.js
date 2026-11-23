require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const main = async () => {
  const args = process.argv.slice(2)

  if (args.length !== 1 && args.length !== 3) {
    throw new Error(
      'Usage: node mongo.js <password> [name number]; provide only the password to list entries'
    )
  }

  if (args.length === 3 && (!args[1].trim() || !args[2].trim())) {
    throw new Error('Name and number must not be empty')
  }

  const uriString = process.env.MONGODB_URI

  if (!uriString) {
    throw new Error('MONGODB_URI is not set in the environment or .env file')
  }

  const uri = new URL(uriString)
  uri.password = args[0]

  try {
    await mongoose.connect(uri.toString())

    if (args.length === 1) {
      const persons = await Person.find({})
      console.log('phonebook:')
      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      return
    }

    const [name, number] = args.slice(1)
    await new Person({ name: name.trim(), number: number.trim() }).save()
    console.log(`added ${name.trim()} number ${number.trim()} to phonebook`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch(error => {
  console.error(`Phonebook operation failed: ${error.message}`)
  process.exitCode = 1
})
