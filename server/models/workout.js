const mongoose = require('mongoose');
const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    sets: {
        type: Number,
        required: [true, 'Please add a number of sets'],
        default: 1
    },
    reps: {
        type: Number,
        required: [true, 'Please add a number of reps'],
        default: 1
    },
    weight: {
        type: Number,
        required: [true, 'Please add a weight'],
        default: 0
    }
})

const workoutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    day: {
        type: String,
        required: [true, 'Please add a day'],
        enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    },
    target: {
        type: String,
        trim: true,
        default: ''
    },
    exercises: [exerciseSchema]
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Workout', workoutSchema)