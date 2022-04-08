const express = require('express')
const router = express.Router()

// MySQL start
const db = require('../../models')
const Todo = db.Todo

router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/new', async (req, res) => {
  const UserId = req.user.id
  let { name, isDone } = req.body
  isDone = isDone === 'on'
  await Todo.create({ name, isDone, UserId })
  res.redirect('/')
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('edit', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id
    let { name, isDone } = req.body
    isDone = isDone === 'on'
    await Todo.update({ name, isDone }, { where: { id } })
    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id
    await Todo.destroy({ where: { id } })
    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
