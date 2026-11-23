const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (_request, response, next) => {
  Blog.find({})
    .then((blogs) => {
      response.json(blogs)
    })
    .catch((error) => next(error))
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  blog.save()
    .then((savedBlog) => {
      response.status(201).json(savedBlog)
    })
    .catch((error) => next(error))
})

module.exports = blogsRouter
