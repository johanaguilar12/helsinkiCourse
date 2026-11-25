import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const sampleBlog = {
    id: 'blog-1',
    title: 'Component testing is done with react-testing-library',
    author: 'Matti Luukkainen',
    url: 'https://fullstackopen.com',
    likes: 7,
    user: {
      username: 'mluukkai',
      name: 'Matti Luukkainen'
    }
  }

  test('renders title and author, but does not render url or likes by default', () => {
    const { container } = render(<Blog blog={sampleBlog} />)

    const summary = container.querySelector('.blog-summary')
    expect(summary).toHaveTextContent('Component testing is done with react-testing-library')
    expect(summary).toHaveTextContent('Matti Luukkainen')

    expect(screen.queryByText('https://fullstackopen.com')).toBeNull()
    expect(screen.queryByText('likes 7')).toBeNull()
    expect(container.querySelector('.blog-details')).toBeNull()
  })

  test('renders url and likes when the view button is clicked', async () => {
    render(<Blog blog={sampleBlog} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    expect(screen.getByText('https://fullstackopen.com')).toBeVisible()
    expect(screen.getByText('likes 7')).toBeVisible()
  })

  test('calls the like event handler twice when the like button is clicked twice', async () => {
    const handleLike = vi.fn()
    render(<Blog blog={sampleBlog} handleLike={handleLike} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLike.mock.calls).toHaveLength(2)
  })
})
