const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const config = require('../utils/config')

mongoose.set('strictQuery', false)

const api = supertest(app)
let users

const login = async (username = 'owner', password = 'ownerpass') => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
  return response.body.token
}

before(async () => {
  await mongoose.connect(config.MONGODB_URI)
  await Promise.all([Blog.init(), User.init()])
})

describe('user management', () => {
  beforeEach(async () => {
    users = await helper.initializeBlogs()
  })

  test('creates a user and does not return their password hash', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, newUser.username)
    assert.strictEqual(Object.hasOwn(response.body, 'passwordHash'), false)

    const savedUser = await User.findById(response.body.id)
    assert.notStrictEqual(savedUser.passwordHash, newUser.password)
    assert.ok(await bcrypt.compare(newUser.password, savedUser.passwordHash))
  })

  test('rejects missing and short usernames or passwords', async () => {
    const invalidUsers = [
      { name: 'Missing username', password: 'password' },
      { username: 'missingpassword', name: 'Missing Password' },
      { username: 'ab', name: 'Short username', password: 'password' },
      { username: 'longenough', name: 'Short password', password: 'ab' },
    ]

    for (const invalidUser of invalidUsers) {
      const response = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
      assert.ok(response.body.error)
    }
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

  test('lists users with their populated blogs and no password hashes', async () => {
    const response = await api.get('/api/users').expect(200)
    const owner = response.body.find((user) => user.username === 'owner')

    assert.strictEqual(owner.blogs.length, helper.initialBlogs.length)
    assert.strictEqual(owner.blogs[0].title, helper.initialBlogs[0].title)
    assert.strictEqual(Object.hasOwn(owner, 'passwordHash'), false)
  })
})

describe('authentication', () => {
  beforeEach(async () => {
    await helper.initializeBlogs()
  })

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

describe('when there are blogs saved', () => {
  beforeEach(async () => {
    users = await helper.initializeBlogs()
  })

  describe('viewing blogs', () => {
    test('blogs are returned as JSON with the correct count', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('blogs use id as their identifier', async () => {
      const response = await api.get('/api/blogs')

      response.body.forEach((blog) => {
        assert.ok(blog.id)
        assert.strictEqual(Object.hasOwn(blog, '_id'), false)
      })
    })

    test('blogs include populated creator details', async () => {
      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body[0].user.username, 'owner')
      assert.strictEqual(response.body[0].user.name, 'Blog Owner')
    })
  })

  describe('adding a blog', () => {
    test('fails with status code 401 if no token is provided', async () => {
      await api
        .post('/api/blogs')
        .send({
          title: 'Unauthorized blog',
          author: 'A Test Author',
          url: 'https://example.com/unauthorized',
        })
        .expect(401)

      assert.strictEqual((await helper.blogsInDb()).length, helper.initialBlogs.length)
    })

    test('succeeds with valid data and assigns the authenticated user', async () => {
      const token = await login()
      const newBlog = {
        title: 'A new test blog',
        author: 'A Test Author',
        url: 'https://example.com/new',
        likes: 9,
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      assert.ok(blogsAtEnd.some((blog) => blog.title === newBlog.title))
      assert.strictEqual(response.body.user.username, 'owner')

      const savedUser = await User.findById(users[0]._id)
      assert.ok(savedUser.blogs.some((id) => id.equals(response.body.id)))
    })

    test('likes defaults to zero when omitted', async () => {
      const token = await login()
      const newBlog = {
        title: 'A blog without likes',
        author: 'A Test Author',
        url: 'https://example.com/no-likes',
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
      const savedBlog = await Blog.findById(response.body.id)
      assert.strictEqual(savedBlog.likes, 0)
    })

    test('fails with status code 400 if title or url is missing', async () => {
      const token = await login()
      const requiredProperties = ['title', 'url']

      for (const property of requiredProperties) {
        const newBlog = {
          title: 'A valid title',
          author: 'A Test Author',
          url: 'https://example.com/valid',
        }
        delete newBlog[property]

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      }
    })

    test('rejects a malformed token', async () => {
      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Invalid token blog',
          author: 'A Test Author',
          url: 'https://example.com/invalid',
        })
        .expect(401)
    })
  })

  describe('deleting a blog', () => {
    test('succeeds with status code 204 for its creator', async () => {
      const token = await login()
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      assert.ok(blogsAtEnd.every((blog) => blog.id !== blogToDelete.id))
      const savedUser = await User.findById(users[0]._id)
      assert.ok(savedUser.blogs.every((id) => id.toString() !== blogToDelete.id))
    })

    test('fails with status code 401 if no token is provided', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .expect(401)

      assert.strictEqual((await helper.blogsInDb()).length, helper.initialBlogs.length)
    })

    test('fails with status code 403 if another user tries to delete the blog', async () => {
      const token = await login('other', 'otherpass')
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)

      assert.strictEqual((await helper.blogsInDb()).length, helper.initialBlogs.length)
    })

    test('fails with status code 404 if the blog does not exist', async () => {
      const token = await login()
      const id = await helper.nonExistingId()

      await api
        .delete(`/api/blogs/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })

    test('fails with status code 400 if the id is invalid', async () => {
      const token = await login()

      await api
        .delete('/api/blogs/not-an-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 and returns the updated blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const update = { likes: blogToUpdate.likes + 1 }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, update.likes)
      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
      assert.strictEqual(updatedBlog.likes, update.likes)
      assert.strictEqual(updatedBlog.title, blogToUpdate.title)
      assert.strictEqual(updatedBlog.user.toString(), users[0]._id.toString())
    })

    test('fails with status code 404 if the blog does not exist', async () => {
      const id = await helper.nonExistingId()

      await api
        .put(`/api/blogs/${id}`)
        .send({ likes: 10 })
        .expect(404)
    })

    test('fails with status code 400 if the id is invalid', async () => {
      await api
        .put('/api/blogs/not-an-id')
        .send({ likes: 10 })
        .expect(400)
    })

    test('fails with status code 400 if updated data is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .put(`/api/blogs/${blogsAtStart[0].id}`)
        .send({ title: null })
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
