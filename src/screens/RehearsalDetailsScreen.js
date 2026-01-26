import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getRehearsal, deleteRehearsal } from '../storage/rehearsalStorage';

export default function RehearsalDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [rehearsal, setRehearsal] = useState(null);

  useEffect(() => {
    getRehearsal(id).then(setRehearsal);
  }, [id]);

  if (!rehearsal) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{rehearsal.title}</Text>
      <Text style={styles.meta}>{rehearsal.date} · {rehearsal.time}</Text>
      <Text style={styles.meta}>Created: {rehearsal.createdAt}</Text>
      <View style={{marginTop:20}}>
        <Button title="Delete Rehearsal" color="#d00" onPress={async () => {
          await deleteRehearsal(id);
          navigation.navigate('Home');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  title: { fontSize:22, fontWeight:'600' },
  meta: { marginTop:8, color:'#555' }
});
