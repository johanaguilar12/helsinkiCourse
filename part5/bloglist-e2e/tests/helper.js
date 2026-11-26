const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByLabel('title:').fill(title)
  await page.getByLabel('author:').fill(author)
  await page.getByLabel('url:').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.locator('.blog-summary', { hasText: `${title} ${author}` }).waitFor()
}

const likeBlog = async (page, title, times) => {
  const blogElement = page.locator('.blog', { hasText: title })
  const viewButton = blogElement.getByRole('button', { name: 'view' })
  if (await viewButton.isVisible()) {
    await viewButton.click()
  }

  for (let count = 1; count <= times; count += 1) {
    await blogElement.getByRole('button', { name: 'like' }).click()
    await blogElement.getByText(`likes ${count}`).waitFor()
  }
}

module.exports = { loginWith, createBlog, likeBlog }
