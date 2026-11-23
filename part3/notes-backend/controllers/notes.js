const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor

notesRouter.get('/', async (_request, response) => {
  const notes = await Note.find({})
    .populate('user', { username: 1, name: 1 })

  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
    .populate('user', { username: 1, name: 1 })

  if (!note) {
    return response.status(404).end()
  }

  response.json(note)
})

notesRouter.post('/', userExtractor, async (request, response) => {
  const { content, important = false } = request.body || {}

  if (typeof content !== 'string' || content.trim().length < 5) {
    return response.status(400).json({
      error: 'content must be at least 5 characters',
    })
  }

  const note = new Note({
    content: content.trim(),
    important,
    user: request.user._id,
  })

  const savedNote = await note.save()
  request.user.notes.push(savedNote._id)
  await request.user.save()
  await savedNote.populate('user', { username: 1, name: 1 })

  response.status(201).json(savedNote)
})

notesRouter.put('/:id', userExtractor, async (request, response) => {
  const note = await Note.findById(request.params.id)
  const body = request.body || {}

  if (!note) {
    return response.status(404).end()
  }

  if (note.user.toString() !== request.user.id) {
    return response.status(403).json({ error: 'only the creator can update this note' })
  }

  if (body.content !== undefined) {
    note.content = body.content
  }

  if (body.important !== undefined) {
    note.important = body.important
  }

  const updatedNote = await note.save()
  await updatedNote.populate('user', { username: 1, name: 1 })
  response.json(updatedNote)
})

notesRouter.delete('/:id', userExtractor, async (request, response) => {
  const note = await Note.findById(request.params.id)

  if (!note) {
    return response.status(404).end()
  }

  if (note.user.toString() !== request.user.id) {
    return response.status(403).json({ error: 'only the creator can delete this note' })
  }

  await Note.findByIdAndDelete(note.id)
  await User.findByIdAndUpdate(request.user.id, { $pull: { notes: note._id } })

  response.status(204).end()
})

module.exports = notesRouter
