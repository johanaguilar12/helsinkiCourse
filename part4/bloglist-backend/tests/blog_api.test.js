const { after, before, beforeEach, test } = require('node:test')
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

beforeEach(async () => {
  await helper.initializeBlogs()
})

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

test('a blog can be added', async () => {
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

test('a blog without title or url is rejected', async (t) => {
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

after(async () => {
  await mongoose.connection.close()
})
