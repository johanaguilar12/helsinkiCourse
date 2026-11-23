const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'First test blog',
    author: 'Test Author',
    url: 'https://example.com/first',
    likes: 5,
  },
  {
    title: 'Second test blog',
    author: 'Another Author',
    url: 'https://example.com/second',
    likes: 3,
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const initializeBlogs = async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
}

module.exports = {
  blogsInDb,
  initialBlogs,
  initializeBlogs,
}
