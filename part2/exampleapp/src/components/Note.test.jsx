import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import Note from './Note'

test('renders content', () => {
  const note = {
    id: '1',
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(
    <MemoryRouter>
      <Note note={note} />
    </MemoryRouter>
  )

  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
})

test('does not render this', () => {
  const note = {
    id: '1',
    content: 'This is a reminder',
    important: true
  }

  render(
    <MemoryRouter>
      <Note note={note} />
    </MemoryRouter>
  )

  const element = screen.queryByText('do not want this thing to be rendered')
  expect(element).toBeNull()
})

test('clicking the button calls event handler once', async () => {
  const note = {
    id: '1',
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const mockHandler = vi.fn()

  render(
    <MemoryRouter>
      <Note note={note} toggleImportanceOf={mockHandler} />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  const button = screen.getByText('make not important')
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})
