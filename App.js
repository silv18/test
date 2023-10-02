// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthenticationScreen from './AuthenticationScreen';
import ScannerScreen from './scanner'; // Import the correct component name or the correct file path.
import TableauScreen from './Tableau';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Authentication">
        <Stack.Screen name="Authentication" component={AuthenticationScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Tableau" component={TableauScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
