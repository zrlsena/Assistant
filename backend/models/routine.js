const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Routine = mongoose.model('Routine', routineSchema);

module.exports = Routine;
