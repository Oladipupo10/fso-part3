const mongoose = require('mongoose')


const password = process.argv[2]

// your MongoDB URL
const url = `mongodb+srv://fullstack:${password}@phonebook-db.60mybd2.mongodb.net/?appName=phonebook-db`



mongoose.connect(url)
  .then(() => {console.log('connected!!')})
  .catch(err => console.log(err))


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true
  }
})
const Person = mongoose.model('Person', personSchema)

// SHOW ALL
if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p.name, p.number)
    })
    mongoose.connection.close()
  })
}

// ADD NEW
if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(() => {
    console.log(`✅ added ${person.name} number ${person.number}`)
    mongoose.connection.close()
  })
}