import {NavigationContainer} from '@react-navigation/native';
import{createnativeStackNavigator} from "@react-navigation/native-stack"

import HomeScreen from '../screens/HomeScreen';
import RideScreen from '../screens/RideScreen';
import ConfirmRideScreen from '../screens/ConfirmRideScreen';

const Stack = createnativeStackNavigator();
export default function AppNavigator() {
  return (<NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ConfirmRide" component={ConfirmRideScreen} />
      <Stack.Screen name="Ride" component={RideScreen} />
    </Stack.Navigator>
  </NavigationContainer>
  );

}