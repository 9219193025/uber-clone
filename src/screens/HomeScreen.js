import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

  const destination = route.params?.destination;

  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [rideInfo, setRideInfo] = useState(null);

  const rideTypes = [
    { id: 'mini', name: 'Mini', base: 30, rate: 10 },
    { id: 'sedan', name: 'Sedan', base: 40, rate: 14 },
    { id: 'suv', name: 'SUV', base: 60, rate: 18 },
  ];
  const [selectedRide, setSelectedRide] = useState(rideTypes[0]);

  // SAFE LOCATION HANDLING
 useEffect(() => {
  const getLocation=async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

    if(status!==granted) {
      console.log("Permission denied");
      return;
    }
    

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (loc?.coords?.latitude && loc?.coords?.longitude) {
        setLocation(loc.coords);
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  getLocation();
}, []);

   
  // SAFE ROUTE FETCH
  useEffect(() => {
    if (!destination?.latitude || !location?.latitude) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/` +
            `${location.longitude},${location.latitude};` +
            `${destination.longitude},${destination.latitude}` +
            `?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (!data?.routes || data.routes.length === 0) {
          console.log('No route found');
          return;
        }

        const route = data.routes[0];

        if (!route?.geometry?.coordinates) return;

        const coords = route.geometry.coordinates.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }));

        setRouteCoords(coords);

        const distanceKm = route.distance / 1000;
        const timeMin = Math.ceil(route.duration / 60);

        setRideInfo({
          distance: distanceKm.toFixed(2),
          time: timeMin,
        });

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
              edgePadding: {
                top: 100,
                right: 50,
                bottom: 250,
                left: 50,
              },
              animated: true,
            }
          );
        }
      } catch (error) {
        console.log('Route error:', error);
      }
    };

    fetchRoute();
  }, [destination, location]);

  const calculateFare = () => {
    if (!rideInfo?.distance) return 0;
    return (
      selectedRide.base +
      rideInfo.distance * selectedRide.rate
    ).toFixed(0);
  };

  // PREVENT MAP RENDER BEFORE LOCATION
  if (!location?.latitude) {
    return (
      <View style={styles.center}>
        <Text>Fetching Location...</Text>
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
        <Marker coordinate={location} title="You are here" />

        {destination?.latitude && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            pinColor="green"
            title={destination.name}
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      <View style={styles.panel}>
        <Pressable onPress={() => navigation.navigate('Search')}>
          <Text style={styles.title}>Where to?</Text>
        </Pressable>

        {rideInfo && (
          <>
            <Text>
              Distance: {rideInfo.distance} km | Time: {rideInfo.time} min
            </Text>

            <View style={styles.row}>
              {rideTypes.map((ride) => (
                <Pressable
                  key={ride.id}
                  style={[
                    styles.rideBtn,
                    selectedRide.id === ride.id && styles.selected,
                  ]}
                  onPress={() => setSelectedRide(ride)}
                >
                  <Text>{ride.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fare}>Fare: ₹{calculateFare()}</Text>

            <Pressable
              style={styles.confirm}
              onPress={() =>
                navigation.navigate('Ride', {
                  pickup: location,
                  ride: selectedRide,
                  fare: calculateFare(),
                  distance: rideInfo.distance,
                  time: rideInfo.time,
                  routeCoords: routeCoords
                })
              }
            >
              <Text style={{ color: 'white' }}>
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
  panel: {
    position: 'absolute',
    bottom: 40,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rideBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
  selected: { backgroundColor: '#d0ebff' },
  fare: { marginTop: 10, fontWeight: 'bold' },
  confirm: {
    marginTop: 12,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
