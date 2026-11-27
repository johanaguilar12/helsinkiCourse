import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> calls createBlog with the right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(
    <MemoryRouter>
      <BlogForm createBlog={createBlog} />
    </MemoryRouter>
  )

  const titleInput = screen.getByLabelText('title')
  const authorInput = screen.getByLabelText('author')
  const urlInput = screen.getByLabelText('url')
  const submitButton = screen.getByRole('button', { name: 'create' })

  await user.type(titleInput, 'Clean Architecture')
  await user.type(authorInput, 'Robert C. Martin')
  await user.type(urlInput, 'https://blog.cleancoder.com')
  await user.click(submitButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    url: 'https://blog.cleancoder.com'
  })
})
