const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body || {}
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: request.user._id,
  })

  const savedBlog = await blog.save()
  request.user.blogs.push(savedBlog._id)
  await request.user.save()
  await savedBlog.populate('user', { username: 1, name: 1 })

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  if (!blog.user || blog.user.toString() !== request.user.id) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(blog.id)
  await User.findByIdAndUpdate(request.user.id, { $pull: { blogs: blog._id } })

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body || {}
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedBlog) {
    return response.status(404).end()
  }

  await updatedBlog.populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})

module.exports = blogsRouter
