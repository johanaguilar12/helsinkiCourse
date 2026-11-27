const loginWith = async (page, username, password) => {
  await page.getByRole('link', { name: 'notes' }).click()
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createNote = async (page, content) => {
  await page.getByRole('link', { name: 'new note' }).click()
  await page.getByLabel('note content').fill(content)
  await page.getByRole('button', { name: 'save' }).click()
  await page.getByRole('link', { name: content }).waitFor()
}

module.exports = { loginWith, createNote }
