require('dotenv').config()

const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const User = require('../models/user')
const helper = require('./test_helper')

if (!process.env.TEST_MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('TEST_MONGODB_URI and JWT_SECRET must be configured for tests')
}

const api = supertest(app)
let users

const login = async (username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
  return response.body.token
}

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
  await Promise.all([User.init(), Note.init()])
})

beforeEach(async () => {
  users = await helper.initializeDatabase()
})

describe('user management', () => {
  test('creates a user without returning the password hash', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'newpass',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, newUser.username)
    assert.strictEqual(Object.hasOwn(response.body, 'passwordHash'), false)

    const storedUser = await User.findOne({ username: newUser.username })
    assert.notStrictEqual(storedUser.passwordHash, newUser.password)
    assert.ok(await bcrypt.compare(newUser.password, storedUser.passwordHash))

    const usersAtEnd = await helper.usersInDb()
    assert.ok(usersAtEnd.some((user) => user.username === newUser.username))
  })

  test('rejects duplicate usernames', async () => {
    const response = await api
      .post('/api/users')
      .send({
        username: 'owner',
        name: 'Duplicate User',
        password: 'newpass',
      })
      .expect(400)

    assert.match(response.body.error, /username.*unique/)
  })

  test('rejects short usernames and passwords', async () => {
    await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Short', password: 'pass' })
      .expect(400)

    await api
      .post('/api/users')
      .send({ username: 'validname', name: 'Valid', password: 'ab' })
      .expect(400)
  })

  test('lists users with populated notes and no password hashes', async () => {
    const response = await api.get('/api/users').expect(200)
    const owner = response.body.find((user) => user.username === 'owner')

    assert.strictEqual(owner.notes.length, 1)
    assert.strictEqual(owner.notes[0].content, 'A note owned by the first user')
    assert.strictEqual(Object.hasOwn(owner, 'passwordHash'), false)
  })
})

describe('authentication', () => {
  test('returns a token for valid credentials', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'owner', password: 'ownerpass' })
      .expect(200)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, 'owner')
  })

  test('rejects invalid credentials', async () => {
    await api
      .post('/api/login')
      .send({ username: 'owner', password: 'wrongpass' })
      .expect(401)
  })
})

describe('notes', () => {
  test('returns notes with populated user information', async () => {
    const response = await api.get('/api/notes').expect(200)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].user.username, 'owner')
    assert.strictEqual(response.body[0].user.name, 'Note Owner')
  })

  test('returns one note by id', async () => {
    const notes = await helper.notesInDb()
    const response = await api.get(`/api/notes/${notes[0].id}`).expect(200)
    assert.strictEqual(response.body.id, notes[0].id)
  })

  test('creates a note for the authenticated user and links it in both documents', async () => {
    const token = await login('owner', 'ownerpass')
    const response = await api
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'A newly created owned note', important: false })
      .expect(201)

    assert.strictEqual(response.body.user.username, 'owner')

    const savedUser = await User.findById(users[0]._id)
    const savedNote = await Note.findById(response.body.id)
    assert.ok(savedUser.notes.some((id) => id.equals(savedNote._id)))
    assert.ok(savedNote.user.equals(savedUser._id))
  })

  test('requires authentication to create a note', async () => {
    await api
      .post('/api/notes')
      .send({ content: 'A note without authentication' })
      .expect(401)
  })

  test('updates a note for its owner', async () => {
    const token = await login('owner', 'ownerpass')
    const notes = await helper.notesInDb()

    const response = await api
      .put(`/api/notes/${notes[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ important: false })
      .expect(200)

    assert.strictEqual(response.body.important, false)
  })

  test('does not allow another user to update a note', async () => {
    const token = await login('other', 'otherpass')
    const notes = await helper.notesInDb()

    await api
      .put(`/api/notes/${notes[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ important: false })
      .expect(403)

    const savedNote = await Note.findById(notes[0].id)
    assert.strictEqual(savedNote.important, true)
  })

  test('deletes a note for its owner and removes the user reference', async () => {
    const token = await login('owner', 'ownerpass')
    const notes = await helper.notesInDb()

    await api
      .delete(`/api/notes/${notes[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    assert.strictEqual((await helper.notesInDb()).length, 0)
    const savedUser = await User.findById(users[0]._id)
    assert.strictEqual(savedUser.notes.length, 0)
  })

  test('does not allow another user to delete a note', async () => {
    const token = await login('other', 'otherpass')
    const notes = await helper.notesInDb()

    await api
      .delete(`/api/notes/${notes[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    assert.strictEqual((await helper.notesInDb()).length, 1)
  })

  test('requires authentication to update or delete a note', async () => {
    const notes = await helper.notesInDb()

    await api
      .put(`/api/notes/${notes[0].id}`)
      .send({ important: false })
      .expect(401)

    await api
      .delete(`/api/notes/${notes[0].id}`)
      .expect(401)
  })

  test('rejects an invalid bearer token', async () => {
    const notes = await helper.notesInDb()

    await api
      .delete(`/api/notes/${notes[0].id}`)
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})
