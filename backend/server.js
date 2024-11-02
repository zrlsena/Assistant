const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/task'); // Task modelini içe aktar
const Routine = require('./models/routine'); // Routine modelini içe aktar

const app = express();
app.use(express.json());

// MongoDB'ye bağlan
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Yeni görev ekleme
app.post('/tasks', async (req, res) => {
  const { task, time, date } = req.body;
  const newTask = new Task({ task, time, date });
  await newTask.save();
  res.status(201).send(newTask);
});

// Görevleri alma
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.send(tasks);
});

// Yeni rutin ekleme
app.post('/routines', async (req, res) => {
  const { name, date } = req.body;
  const newRoutine = new Routine({ name, date });
  await newRoutine.save();
  res.status(201).send(newRoutine);
});

// Rutinleri alma
app.get('/routines', async (req, res) => {
  const routines = await Routine.find();
  res.send(routines);
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
