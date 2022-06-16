const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(bodyParser.json())
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms  :post-data'))
morgan.token('post-data', function getPost(req) {
  return JSON.stringify(req.body)
})

const Person = require('./model/person')
const opts = { runValidators: true }

app.get('/', (request, response) => {
  response.send('<h1>API for phonebook!</h1>')
})

// get all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

// get person by Id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// delete person
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// create person
app.post('/api/persons', (request, response) => {
  const body = request.body

  const person = new Person ({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(
      error => {return response.status(400).json({ error: error.message })}
    )
})

// update person
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  console.log(body)
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})



const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})