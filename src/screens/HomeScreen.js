import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import pickupIcon from '../../assets/pickup.png';
import dropIcon from '../../assets/drop.png';

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

  const destination = route.params?.destination;

  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [rideInfo, setRideInfo] = useState(null);

  // 🚗 Ride types
  const rideTypes = [
    { id: 'mini', name: 'Mini', base: 30, rate: 10 },
    { id: 'sedan', name: 'Sedan', base: 40, rate: 14 },
    { id: 'suv', name: 'SUV', base: 60, rate: 18 },
  ];
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);

  // 📍 Live location tracking
  useEffect(() => {
    let subscriber;

    const startWatching = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (newLocation) => {
          const coords = newLocation.coords;
          setLocation(coords);

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    };

    startWatching();
    return () => subscriber && subscriber.remove();
  }, []);

  // 🛣️ Fetch route when destination selected
  useEffect(() => {
    if (!destination?.latitude || !location) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/` +
            `${location.longitude},${location.latitude};` +
            `${destination.longitude},${destination.latitude}` +
            `?overview=full&geometries=geojson`
        );

        const data = await res.json();

        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          })
        );

        setRouteCoords(coords);

        // Auto zoom to show both points
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            }
          );
        }

        const distanceKm = data.routes[0].distance / 1000;
        const timeMin = Math.ceil(data.routes[0].duration / 60);

        setRideInfo({
          distance: distanceKm.toFixed(2),
          time: timeMin,
        });
      } catch (e) {
        console.log('Route error', e);
      }
    };

    fetchRoute();
  }, [destination, location]);

  const calculateFare = () => {
    if (!rideInfo) return 0;
    return (
      selectedRide.base +
      rideInfo.distance * selectedRide.rate
    ).toFixed(0);
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Fetching Live Location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Pickup */}
        <Marker coordinate={location}>
          <Image source={pickupIcon} style={{ width: 35, height: 35 }} />
        </Marker>

        {/* Drop */}
        {destination?.latitude && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
          >
            <Image source={dropIcon} style={{ width: 35, height: 35 }} />
          </Marker>
        )}

        {/* Route */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <Pressable onPress={() => navigation.navigate('Search')}>
          <Text style={styles.title}>Where to?</Text>
        </Pressable>

        {rideInfo && (
          <>
            <Text style={styles.info}>
              Distance: {rideInfo.distance} km | Time: {rideInfo.time} min
            </Text>

            <View style={styles.rideRow}>
              {rideTypes.map((ride) => (
                <Pressable
                  key={ride.id}
                  style={[
                    styles.rideOption,
                    selectedRide.id === ride.id && styles.selectedRide,
                  ]}
                  onPress={() => setSelectedRide(ride)}
                >
                  <Text>{ride.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fare}>Fare: ₹{calculateFare()}</Text>

            <Pressable
              style={styles.confirmBtn}
              onPress={() =>
                navigation.navigate('Ride', {
                  ride: selectedRide,
                  fare: calculateFare(),
                  distance: rideInfo.distance,
                  time: rideInfo.time,
                  pickup: location,
                })
              }
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Confirm {selectedRide.name}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  bottomPanel: {
    position: 'absolute',
    bottom: 40,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },

  title: { fontSize: 22, fontWeight: 'bold' },
  info: { marginTop: 6, color: 'gray' },
  fare: { marginTop: 10, fontSize: 18, fontWeight: 'bold' },

  rideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  rideOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },

  selectedRide: {
    backgroundColor: '#d0ebff',
    borderColor: 'blue',
  },

  confirmBtn: {
    marginTop: 12,
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
