import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { saveRehearsal } from '../storage/rehearsalStorage';
import { format } from 'date-fns';

export default function CreateRehearsalScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  async function onSave() {
    if (!title || !date || !time) {
      alert('Please fill all fields');
      return;
    }

    const rehearsal = {
      id: String(Date.now()),
      title,
      date,
      time,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    await saveRehearsal(rehearsal);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="E.g., Weekly Practice" />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-10-10" />

      <Text style={styles.label}>Time (HH:MM)</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="19:00" />

      <Button title="Save Rehearsal" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  label: { marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }
});
