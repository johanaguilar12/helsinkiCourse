const bcrypt = require('bcryptjs')
const Blog = require('../models/blog')
const User = require('../models/user')

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

const initialUsers = [
  {
    username: 'owner',
    name: 'Blog Owner',
    password: 'ownerpass',
  },
  {
    username: 'other',
    name: 'Other User',
    password: 'otherpass',
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const initializeBlogs = async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const users = await Promise.all(initialUsers.map(async (user) => {
    const passwordHash = await bcrypt.hash(user.password, 4)
    return User.create({
      username: user.username,
      name: user.name,
      passwordHash,
    })
  }))

  const blogs = await Blog.insertMany(
    initialBlogs.map((blog) => ({ ...blog, user: users[0]._id }))
  )

  users[0].blogs = blogs.map((blog) => blog._id)
  await users[0].save()
  return users
}

const nonExistingId = async () => {
  const blog = await Blog.create({
    title: 'Temporary blog',
    author: 'Test Author',
    url: 'https://example.com/temporary',
  })
  await Blog.findByIdAndDelete(blog.id)
  return blog.id
}

module.exports = {
  blogsInDb,
  initialUsers,
  initialBlogs,
  initializeBlogs,
  nonExistingId,
  usersInDb,
}
