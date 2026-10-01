const mongoose = require('mongoose');

const workoutLog = new mongoose.Schema({
    
    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        required: true
    },
   
    title: {
        type: String,
        required: true
    },
    
    completedAt: {
        type: Date,
        default: Date.now
    },
    
    exercises: [
        {
            exerciseId: String,
            name: String,
            sets: [
                {
                    setNumber: Number,
                    weight: Number,
                    reps: Number,
                    isCompleted: Boolean
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLog);