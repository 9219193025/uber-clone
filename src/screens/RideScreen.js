import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import carIcon from '../../assets/car.png';
import { Image } from 'react-native';




export default function RideScreen() {
  const route = useRoute();
  const { ride, fare, distance, time, pickup } = route.params;
  const mapRef = useRef(null);
  const navigation = useNavigation();



  //  Driver starts a bit away from pickup
  const [driverLocation, setDriverLocation] = useState({
    latitude: pickup.latitude + 0.01,
    longitude: pickup.longitude + 0.01,
  });

  const [status, setStatus] = useState('Searching for driver...');

  //  Simulate driver movement
  useEffect(() => {
  setTimeout(() => setStatus('Driver on the way 🚗'), 2000);

  const interval = setInterval(() => {
    setDriverLocation((prev) => {
      const latDiff = pickup.latitude - prev.latitude;
      const lngDiff = pickup.longitude - prev.longitude;

      return {
        latitude: prev.latitude + latDiff * 0.2,
        longitude: prev.longitude + lngDiff * 0.2,
      };
    });
  }, 2000);

  // Driver arrived
  setTimeout(() => {
    setStatus('Driver arrived ');
  }, 12000);

  // Trip started
  setTimeout(() => {
    setStatus('Trip started ');
  }, 15000);

  // Trip completed → go to summary
  setTimeout(() => {
    clearInterval(interval);

    navigation.replace('ConfirmRide', {
      ride,
      fare,
      distance,
      time,
    });
  }, 22000);

  return () => clearInterval(interval);
}, []);

  return (
    
  <View style={{ flex: 1 }}>
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      initialRegion={{
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Pickup marker */}
      <Marker coordinate={pickup} title="Your Location" />

      {/* Driver marker */}
     <Marker coordinate={driverLocation} title="Driver">
  <Image source={carIcon} style={{ width: 40, height: 40 }} />
</Marker>

    </MapView>

    {/* Info card */}
    <View style={styles.infoCard}>
      <Text style={styles.title}>{status}</Text>
      <Text>Ride: {ride.name}</Text>
      <Text>Fare: ₹{fare}</Text>
      <Text>Distance: {distance} km</Text>
    </View>
  </View>
);

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '80%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
  },
  fare: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  driver: {
    marginTop: 15,
    color: 'gray',
  },
  infoCard: {
  position: 'absolute',
  bottom: 30,
  left: 20,
  right: 20,
  backgroundColor: 'white',
  padding: 15,
  borderRadius: 10,
  elevation: 10,
},

});
