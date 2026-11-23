const bcrypt = require('bcryptjs')
const Note = require('../models/note')
const User = require('../models/user')

const initialUsers = [
  {
    username: 'owner',
    name: 'Note Owner',
    password: 'ownerpass',
  },
  {
    username: 'other',
    name: 'Other User',
    password: 'otherpass',
  },
]

const initializeDatabase = async () => {
  await Note.deleteMany({})
  await User.deleteMany({})

  const users = await Promise.all(initialUsers.map(async (user) => {
    const passwordHash = await bcrypt.hash(user.password, 10)
    return User.create({
      username: user.username,
      name: user.name,
      passwordHash,
    })
  }))

  const note = await Note.create({
    content: 'A note owned by the first user',
    important: true,
    user: users[0]._id,
  })

  users[0].notes.push(note._id)
  await users[0].save()

  return users
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map((note) => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialUsers,
  initializeDatabase,
  notesInDb,
  usersInDb,
}
