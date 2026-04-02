const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Error connecting to MongoDB:', error.message))


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Must match: 2-3 digits, dash, then digits (total length >= 8)
        const regex = /^\d{2,3}-\d+$/

        return regex.test(value) && value.length >= 8
      },
      message: props =>
        `${props.value} is not a valid phone number! Format: 56-6789900965 or 560-56456776`,
    },
  },
})

module.exports = mongoose.model('Person', personSchema)