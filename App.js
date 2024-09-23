import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8zIRtNYBqj-cR8YFbaQsR1JwNk1SVi3E",
  authDomain: "quanlynguoidung-81dbc.firebaseapp.com",
  projectId: "quanlynguoidung-81dbc",
  storageBucket: "quanlynguoidung-81dbc.appspot.com",
  messagingSenderId: "116025324067",
  appId: "1:116025324067:web:b9c7b4bffdb7a3852cb796",
  measurementId: "G-WVXRP74CGF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UserManagementApp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (err) {
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    if (!name || !email || !age) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), { name, email, age: parseInt(age) });
      fetchUsers();
      resetForm();
    } catch (err) {
      setError('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUserId || !name || !email || !age) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const userDoc = doc(db, "users", editingUserId);
    setLoading(true);
    try {
      await updateDoc(userDoc, { name, email, age: parseInt(age) });
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err); // Ghi log lỗi
      setError('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    setLoading(true);
    try {
      await deleteDoc(userDoc);
      fetchUsers();
    } catch (err) {
      setError('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setAge(user.age.toString());
  };

  const resetForm = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setAge('');
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.error}>{error}</Text>}
  
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name} - {item.email} - {item.age}</Text>
            <Button title="Edit" onPress={() => handleEditUser(item)} />
            <Button title="Delete" onPress={() => deleteUser(item.id)} />
          </View>
        )}
        ListHeaderComponent={(
          <View>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <Button title={editingUserId ? "Update User" : "Add User"} onPress={editingUserId ? updateUser : addUser} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  userItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  error: {
    color: 'red',
  },
});

export default UserManagementApp;
