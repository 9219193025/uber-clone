import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ConfirmRideScreen from '../screens/ConfirmRideScreen';
import RideScreen from '../screens/RideScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ConfirmRide" component={ConfirmRideScreen} />
        <Stack.Screen name="Ride" component={RideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
