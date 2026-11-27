const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

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

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Blogs' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrongpassword')

      const alert = page.getByRole('alert')
      await expect(alert).toContainText('wrong username or password')
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

      await expect(page.getByRole('link', { name: 'Playwright End-to-End Testing' })).toBeVisible()
    })

    test('a logged-in user can like a blog', async ({ page }) => {
      await createBlog(page, {
        title: 'React Patterns',
        author: 'Dan Abramov',
        url: 'https://overreacted.io'
      })

      await page.getByRole('link', { name: 'React Patterns' }).click()
      await expect(page.getByText('0 likes')).toBeVisible()

      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('1 likes')).toBeVisible()
    })

    test('a logged-in user can delete a blog', async ({ page }) => {
      await createBlog(page, {
        title: 'Blog To Be Deleted',
        author: 'Matti Luukkainen',
        url: 'https://fullstackopen.com'
      })

      await page.getByRole('link', { name: 'Blog To Be Deleted' }).click()

      page.once('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByRole('heading', { name: 'Blogs' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Blog To Be Deleted' })).toHaveCount(0)
    })
  })
})
