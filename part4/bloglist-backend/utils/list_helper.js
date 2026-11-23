const dummy = (_blogs) => 1

const totalLikes = (blogs) =>
  blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const favorite = blogs.reduce((best, blog) =>
    blog.likes > best.likes ? blog : best
  )

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const counts = blogs.reduce((authors, blog) => {
    authors[blog.author] = (authors[blog.author] || 0) + 1
    return authors
  }, {})

  const author = Object.keys(counts).reduce((best, current) =>
    counts[current] > counts[best] ? current : best
  )

  return {
    author,
    blogs: counts[author],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = blogs.reduce((authors, blog) => {
    authors[blog.author] = (authors[blog.author] || 0) + (blog.likes || 0)
    return authors
  }, {})

  const author = Object.keys(likesByAuthor).reduce((best, current) =>
    likesByAuthor[current] > likesByAuthor[best] ? current : best
  )

  return {
    author,
    likes: likesByAuthor[author],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
