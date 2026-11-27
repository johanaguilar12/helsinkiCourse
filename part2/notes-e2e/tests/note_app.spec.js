const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
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

  test('front page can be opened', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Notes app' })).toBeVisible()
    await expect(
      page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')
    ).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'salainen')
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'wrong')

    const alert = page.getByRole('alert')
    await expect(alert).toContainText('wrong credentials')
    await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new note can be created', async ({ page }) => {
      await createNote(page, 'a note created by playwright')
      await expect(page.getByRole('link', { name: 'a note created by playwright' })).toBeVisible()
    })

    describe('and several notes exist', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note')
        await createNote(page, 'second note')
        await createNote(page, 'third note')
      })

      test('one of those can be made nonimportant', async ({ page }) => {
        await page.getByRole('link', { name: 'second note' }).click()
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByRole('button', { name: 'make important' })).toBeVisible()
      })
    })
  })
})
