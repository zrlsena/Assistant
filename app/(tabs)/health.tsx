import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { db } from '../../firebaseConfig'; // Firebase konfigürasyon dosyanı import et
import { collection, getDoc, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'; // Firestore fonksiyonlarını import et

// Sağlık günlük girişleri için bir tür tanımlayın
interface HealthLog {
  id: string;
  date: string;
  weight: string;
  waterIntake: string;
  exercise: string;
}

export default function HealthScreen() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [logToEdit, setLogToEdit] = useState<HealthLog | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [waterIntake, setWaterIntake] = useState<string>('');
  const [exercise, setExercise] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Günlük kayıtlarını çekmek için bir fonksiyon
  const fetchLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'healthLogs'));
      const fetchedLogs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HealthLog[];
      console.log("Fetched Logs: ", fetchedLogs); // Logları konsola yazdır
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error fetching logs: ", error);
      Alert.alert('Error', 'Failed to fetch logs.');
    }
  };

  useEffect(() => {
    fetchLogs(); 
  }, []);

  // Günlük verisini göndermek için bir fonksiyon
  const handleLogSubmit = async () => {
    if (!weight || !waterIntake || !exercise) {
        setError('Please fill in all fields.');
        return;
    }

    const newLog: HealthLog = {
        id: logToEdit ? logToEdit.id : Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        weight,
        waterIntake,
        exercise,
    };

    try {
        if (logToEdit) {
            const logRef = doc(db, 'healthLogs', logToEdit.id);
            const docSnap = await getDoc(logRef); // Check if the document exists

            if (!docSnap.exists()) {
                Alert.alert('Error', 'Log not found for updating.');
                return; // Exit if the log does not exist
            }

            await updateDoc(logRef, {
                weight: newLog.weight,
                waterIntake: newLog.waterIntake,
                exercise: newLog.exercise,
                date: newLog.date,
            });

            setLogs(logs.map(log => (log.id === logToEdit.id ? newLog : log)));
            setLogToEdit(null); // Reset editing state
        } else {
            const docRef = await addDoc(collection(db, 'healthLogs'), newLog as any);
            setLogs([...logs, { ...newLog, id: docRef.id }]);
        }

        // Clear input fields
        setWeight('');
        setWaterIntake('');
        setExercise('');
        setError('');
        Alert.alert('Success', 'Health log submitted successfully!');
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating log: ", error.message);
            Alert.alert('Error', `Failed to update log: ${error.message}`);
        } else {
            console.error("Unexpected error: ", error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    }
};

const handleEdit = (log: HealthLog) => {
    setLogToEdit(log); // Set the log to edit
    setWeight(log.weight); // Populate the input fields with the current log data
    setWaterIntake(log.waterIntake);
    setExercise(log.exercise);
};


  

  // Günlük öğelerini render etmek için bir fonksiyon
  const renderLogItem = ({ item }: { item: HealthLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}><Text style={styles.bold}>Date:</Text> {item.date}</Text>
      <Text style={styles.logText}><Text style={styles.bold}>Weight:</Text> {item.weight} kg</Text>
      <Text style={styles.logText}><Text style={styles.bold}>Water Intake:</Text> {item.waterIntake} L</Text>
      <Text style={styles.logText}><Text style={styles.bold}>Exercise:</Text> {item.exercise} mins</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Healthy Vibes, Wealthy Lives!</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Water Intake (L)"
          value={waterIntake}
          onChangeText={setWaterIntake}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Exercise (mins)"
          value={exercise}
          onChangeText={setExercise}
          keyboardType="numeric"
        />
        <Button title={logToEdit ? "Update Log" : "Log Today’s Data"} onPress={handleLogSubmit} color="#9B1B30" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Text style={styles.subtitle}>Your Health Logs</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.logsContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 100,
  },
  form: {
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: 'black',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  logsContainer: {
    width: '100%',
  },
  logItem: {
    backgroundColor: '#333',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  logText: {
    color: '#fff',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
