import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { loadRehearsals } from '../storage/rehearsalStorage';

export default function HomeScreen({ navigation }) {
  const [rehearsals, setRehearsals] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRehearsals().then(setRehearsals);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choir Rehearsals</Text>
      <FlatList
        data={rehearsals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Details', { id: item.id })}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSub}>{item.date} · {item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{marginTop:20}}>No rehearsals scheduled yet.</Text>}
      />

      <View style={styles.footer}>
        <Button title="Create Rehearsal" onPress={() => navigation.navigate('Create')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontSize: 18 },
  itemSub: { color: '#666' },
  footer: { marginTop: 12 }
});
