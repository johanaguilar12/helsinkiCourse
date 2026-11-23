const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const config = require('../utils/config')

mongoose.set('strictQuery', false)

const api = supertest(app)

before(async () => {
  await mongoose.connect(config.MONGODB_URI)
})

describe('when there are blogs saved', () => {
  beforeEach(async () => {
    await helper.initializeBlogs()
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
  })

  describe('adding a blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: 'A new test blog',
        author: 'A Test Author',
        url: 'https://example.com/new',
        likes: 9,
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      assert.ok(blogsAtEnd.some((blog) => blog.title === newBlog.title))
      assert.strictEqual(response.body.title, newBlog.title)
    })

    test('likes defaults to zero when omitted', async () => {
      const newBlog = {
        title: 'A blog without likes',
        author: 'A Test Author',
        url: 'https://example.com/no-likes',
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
      const savedBlog = await Blog.findById(response.body.id)
      assert.strictEqual(savedBlog.likes, 0)
    })

    test('fails with status code 400 if title or url is missing', async (t) => {
      const requiredProperties = ['title', 'url']

      for (const property of requiredProperties) {
        await t.test(`without ${property}`, async () => {
          const newBlog = {
            title: 'A valid title',
            author: 'A Test Author',
            url: 'https://example.com/valid',
          }
          delete newBlog[property]

          await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

          const blogsAtEnd = await helper.blogsInDb()
          assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
      }
    })
  })

  describe('deleting a blog', () => {
    test('succeeds with status code 204 for a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      assert.ok(blogsAtEnd.every((blog) => blog.id !== blogToDelete.id))
    })

    test('fails with status code 404 if the blog does not exist', async () => {
      const id = await helper.nonExistingId()

      await api
        .delete(`/api/blogs/${id}`)
        .expect(404)
    })

    test('fails with status code 400 if the id is invalid', async () => {
      await api
        .delete('/api/blogs/not-an-id')
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
