import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, FlatList, TextInput, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface Task {
  time: string;
  task: string;
  id: string;
}

interface DailyTasks {
  tasks: Task[];
  routines: Routine[];
}

interface Data {
  [date: string]: DailyTasks;
}

interface Routine {
  name: string;
  id: string;
  completed: boolean;
}

const HomeScreen: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [newTask, setNewTask] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [routineName, setRoutineName] = useState<string>('');
  const [taskModalVisible, setTaskModalVisible] = useState<boolean>(false);

  const initialData: Data = {};
  const [data, setData] = useState<Data>(initialData);

  const deleteTask = (id: string) => {
    const updatedTasks = data[selectedDate].tasks.filter(task => task.id !== id);
    setData(prevData => ({
      ...prevData,
      [selectedDate]: { ...prevData[selectedDate], tasks: updatedTasks },
    }));
  };

  const moveTaskToNextDay = (id: string) => {
    const taskToMove = data[selectedDate].tasks.find(task => task.id === id);
    if (taskToMove) {
      deleteTask(id);
      const nextDate = format(new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      setData(prevData => ({
        ...prevData,
        [nextDate]: {
          tasks: [...(prevData[nextDate]?.tasks || []), taskToMove],
          routines: prevData[nextDate]?.routines || [],
        },
      }));
      Alert.alert('The task has been moved to the next day!');
    }
  };

  const toggleRoutineCompletion = (id: string) => {
    const updatedRoutines = data[selectedDate].routines.map(routine =>
      routine.id === id ? { ...routine, completed: !routine.completed } : routine
    );
    setData(prevData => ({
      ...prevData,
      [selectedDate]: { ...prevData[selectedDate], routines: updatedRoutines },
    }));
  };

  const addRoutine = () => {
    if (routineName.trim()) {
      const newRoutine: Routine = {
        name: routineName.trim(),
        id: (Math.random() * 1000).toString(),
        completed: false,
      };

      const currentDate = new Date(selectedDate);
      for (let i = 0; i < 21; i++) {
        const futureDate = format(new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        setData(prevData => ({
          ...prevData,
          [futureDate]: {
            ...prevData[futureDate],
            routines: [
              ...(prevData[futureDate]?.routines || []),
              newRoutine,
            ],
          },
        }));
      }

      setRoutineName('');
      setModalVisible(false);
    } else {
      Alert.alert('Please enter a routine!');
    }
  };

  const deleteRoutine = (id: string) => {
    const currentDate = new Date(selectedDate);
    
    for (let i = 0; i < 21; i++) {
      const futureDate = format(new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const updatedRoutines = data[futureDate]?.routines.filter(routine => routine.id !== id) || [];
      setData(prevData => ({
        ...prevData,
        [futureDate]: {
          ...prevData[futureDate],
          routines: updatedRoutines,
        },
      }));
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Have a nice day';
    } else {
      return 'Good evening';
    }
  };

  const greeting = getGreeting();

  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: '#007BFF' },
    ...Object.keys(data).reduce((acc, date) => {
      const hasTasks = data[date]?.tasks?.length > 0;
      const allRoutinesCompleted = data[date]?.routines?.length > 0 && data[date]?.routines?.every(routine => routine.completed);
      const hasRoutines = data[date]?.routines?.length > 0;
  
      if (hasTasks || hasRoutines) {
        return {
          ...acc,
          [date]: {
            marked: hasTasks, 
            ...(allRoutinesCompleted ? { selected: true, selectedColor: 'green' } : {}),
          },
        };
      }
  
      return acc;
    }, {}),
  };
  

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskId = (Math.random() * 1000).toString();
      const updatedTasks = [
        ...data[selectedDate]?.tasks || [],
        { time: selectedTime, task: newTask.trim(), id: newTaskId },
      ];
      setData(prevData => ({
        ...prevData,
        [selectedDate]: { 
          tasks: updatedTasks,
          routines: prevData[selectedDate]?.routines || [],
        },
      }));
      setNewTask('');
      setSelectedTime('09:00');
      setTaskModalVisible(false);
    } else {
      Alert.alert('Please enter a task!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>{greeting}, Sena!</Text>
      <Calendar 
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        style={styles.calendar}
      />
      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <FlatList
          data={data[selectedDate]?.tasks || []}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text>{item.time}</Text>
              <Text>{item.task}</Text>
              <TouchableOpacity onPress={() => moveTaskToNextDay(item.id)}>
                <Ionicons name="arrow-forward" size={20} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setTaskModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.routinesContainer}>
        <Text style={styles.sectionTitle}>Routines</Text>
        <FlatList
          data={data[selectedDate]?.routines || []}
          renderItem={({ item }) => (
            <View >
              <TouchableOpacity onPress={() => toggleRoutineCompletion(item.id)}  style={styles.routineItem}>
                <Ionicons
                  name={item.completed ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={item.completed ? 'green' : 'gray'}
                />
              
              <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => deleteRoutine(item.id)}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Routine</Text>
        </TouchableOpacity>
      </View>
      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={newTask}
              onChangeText={setNewTask}
            />
            <Picker
              selectedValue={selectedTime}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTime(itemValue)}
            >
              {[...Array(24)].map((_, index) => (
                <Picker.Item key={index} label={`${index}:00`} value={`${index}:00`} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.button} onPress={addTask}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTaskModalVisible(false)}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Routine</Text>
            <TextInput
              style={styles.input}
              placeholder="Routine Name"
              value={routineName}
              onChangeText={setRoutineName}
            />
            <TouchableOpacity style={styles.button} onPress={addRoutine}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor:'white',

  },
  calendar: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderColor: '#9B1B30',
    borderWidth: 1,
},
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 100,
  },
  tasksContainer: {
    marginBottom: 32,
    marginTop:52,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#9B1B30',

  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderColor: '#9B1B30',
    borderWidth: 1,
  },
  routinesContainer: {
    marginBottom: 32,
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#9B1B30',
    borderWidth: 1,
  },
  addButton: {
    padding: 12,
    backgroundColor: '#EAB8D1',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 8,
    borderColor: '#EAB8D1',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    color: '#9B1B30',
  },
  picker: {
    width: '100%',
    marginBottom: 16,
    borderColor: '#EAB8D1',
  },
  button: {
    padding: 12,
    backgroundColor: '#F5E6D3',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default HomeScreen;
