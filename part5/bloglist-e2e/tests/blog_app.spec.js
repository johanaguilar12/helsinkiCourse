const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrongpassword')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'Playwright End-to-End Testing',
        author: 'Microsoft',
        url: 'https://playwright.dev'
      })

      await expect(
        page.locator('.blog-summary', { hasText: 'Playwright End-to-End Testing Microsoft' })
      ).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, {
        title: 'React Patterns',
        author: 'Dan Abramov',
        url: 'https://overreacted.io'
      })

      const blogElement = page.locator('.blog', { hasText: 'React Patterns' })
      await blogElement.getByRole('button', { name: 'view' }).click()
      await expect(blogElement.getByText('likes 0')).toBeVisible()

      await blogElement.getByRole('button', { name: 'like' }).click()
      await expect(blogElement.getByText('likes 1')).toBeVisible()
    })

    test('the user who created a blog can delete it', async ({ page }) => {
      await createBlog(page, {
        title: 'Blog To Be Deleted',
        author: 'Matti Luukkainen',
        url: 'https://fullstackopen.com'
      })

      const blogElement = page.locator('.blog', { hasText: 'Blog To Be Deleted' })
      await blogElement.getByRole('button', { name: 'view' }).click()

      page.once('dialog', dialog => dialog.accept())
      await blogElement.getByRole('button', { name: 'remove' }).click()

      await expect(page.locator('.blog', { hasText: 'Blog To Be Deleted' })).toHaveCount(0)
    })

    test('only the creator can see the delete button of a blog', async ({ page, request }) => {
      await request.post('/api/users', {
        data: {
          name: 'Other User',
          username: 'otheruser',
          password: 'otherpassword'
        }
      })

      await createBlog(page, {
        title: 'Creator Exclusive Blog',
        author: 'Matti Luukkainen',
        url: 'https://fullstackopen.com/en/part5'
      })

      const creatorView = page.locator('.blog', { hasText: 'Creator Exclusive Blog' })
      await creatorView.getByRole('button', { name: 'view' }).click()
      await expect(creatorView.getByRole('button', { name: 'remove' })).toBeVisible()

      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'otheruser', 'otherpassword')
      await expect(page.getByText('Other User logged in')).toBeVisible()

      const otherUserView = page.locator('.blog', { hasText: 'Creator Exclusive Blog' })
      await otherUserView.getByRole('button', { name: 'view' }).click()
      await expect(otherUserView.getByText('https://fullstackopen.com/en/part5')).toBeVisible()
      await expect(otherUserView.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are ordered according to likes with the most liked first', async ({ page }) => {
      await createBlog(page, {
        title: 'First blog',
        author: 'Author One',
        url: 'https://example.com/1'
      })
      await createBlog(page, {
        title: 'Second blog',
        author: 'Author Two',
        url: 'https://example.com/2'
      })
      await createBlog(page, {
        title: 'Third blog',
        author: 'Author Three',
        url: 'https://example.com/3'
      })

      await likeBlog(page, 'Second blog', 3)
      await likeBlog(page, 'Third blog', 2)
      await likeBlog(page, 'First blog', 1)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Second blog')
      await expect(blogs.nth(1)).toContainText('Third blog')
      await expect(blogs.nth(2)).toContainText('First blog')
    })
  })
})
