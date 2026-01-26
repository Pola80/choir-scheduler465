import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateRehearsalScreen from './src/screens/CreateRehearsalScreen';
import RehearsalDetailsScreen from './src/screens/RehearsalDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Create" component={CreateRehearsalScreen} />
        <Stack.Screen name="Details" component={RehearsalDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
