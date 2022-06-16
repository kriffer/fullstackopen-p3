const mongoose = require('mongoose')
require('dotenv').config()

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = process.env.MONGODB_URI

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')
    console.log(name)
    console.log(number)
    const person = new Person({
      name: name,
      number: number,
    })

    return person.save()
  })
  .then(() => {
    console.log('person saved!')
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))