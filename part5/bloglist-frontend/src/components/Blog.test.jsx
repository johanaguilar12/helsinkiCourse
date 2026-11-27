import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const sampleBlog = {
    id: 'blog-1',
    title: 'Component testing is done with react-testing-library',
    author: 'Dan Abramov',
    url: 'https://fullstackopen.com',
    likes: 7,
    user: {
      username: 'mluukkai',
      name: 'Matti Luukkainen'
    }
  }

  test('shows blog info and likes to unauthenticated users, without action buttons', () => {
    render(
      <MemoryRouter>
        <Blog blog={sampleBlog} user={null} />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Component testing is done with react-testing-library')
    expect(heading).toHaveTextContent('Dan Abramov')
    expect(screen.getByText('https://fullstackopen.com')).toBeVisible()
    expect(screen.getByText('7 likes')).toBeVisible()
    expect(screen.getByText('added by Matti Luukkainen')).toBeVisible()

    expect(screen.queryByRole('button', { name: 'like' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
  })

  test('shows only the like button to authenticated users who are not the creator', async () => {
    const handleLike = vi.fn()
    const nonCreator = {
      username: 'otheruser',
      name: 'Other User'
    }

    render(
      <MemoryRouter>
        <Blog blog={sampleBlog} user={nonCreator} handleLike={handleLike} />
      </MemoryRouter>
    )

    const likeButton = screen.getByRole('button', { name: 'like' })
    expect(likeButton).toBeVisible()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()

    const user = userEvent.setup()
    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLike.mock.calls).toHaveLength(2)
  })

  test('shows both like and remove buttons to the creator of the blog', () => {
    const creator = {
      username: 'mluukkai',
      name: 'Matti Luukkainen'
    }

    render(
      <MemoryRouter>
        <Blog blog={sampleBlog} user={creator} />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'remove' })).toBeVisible()
  })
})
