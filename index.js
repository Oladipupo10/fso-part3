
require('dotenv').config()

const express = require('express')

const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/person')
const path = require('path')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Morgan logging (with body)
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))





// Root
app.get('/', (req, res) => {
  res.send('<h1>Phonebook Backend</h1>')
})

// GET all persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// GET one person

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

// INFO for person

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      const date = new Date()
      res.send(`
        <p>Phonebook has infomation for ${count} people</p>
        <p>${date}</p>
      `)
    })
    .catch(error => next(error))
})

// fall back for react in exercise 3.21
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'build', 'index.html'))
})
// ADD person
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
})

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// UNKNOWN ENDPOINT
app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  next(error)
}

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body
  // exercise 3.17 update phone entry of the existing number
  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        // 🔥 UPDATE instead of creating
        return Person.findByIdAndUpdate(
          existingPerson._id,
          { number },
          { new: true, runValidators: true, context: 'query' }
        ).then(updated => res.json(updated))
      }

      // ✅ CREATE new if not exists
      const person = new Person({ name, number })

      return person.save().then(saved => res.json(saved))
    })
    .catch(error => next(error))
})
// error handler
app.use((error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updated => res.json(updated))
    .catch(error => next(error))
})


app.use(errorHandler)
// SERVER
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})


