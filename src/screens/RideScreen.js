import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import { View, StyleSheet, Image } from "react-native";
import getRhumbLineBearing from "geolib/es/getRhumbLineBearing";

const RideScreen = ({ route }) => {

  const { driverLocation, pickupLocation } = route.params;

  const mapRef = useRef(null);

  const [driverRouteCoords, setDriverRouteCoords] = useState([]);
  const [heading, setHeading] = useState(0);

  const driverAnim = useRef(
    new AnimatedRegion({
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  //  Fetch Driver → Pickup Route
  const fetchDriverRoute = async () => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/
      ${driverLocation.longitude},${driverLocation.latitude};
      ${pickupLocation.longitude},${pickupLocation.latitude}
      ?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data?.routes || data.routes.length === 0) return;

      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })
      );

      setDriverRouteCoords(coords);
      animateDriver(coords);

    } catch (err) {
      console.log("Route fetch error", err);
    }
  };

  //  Move Driver in Zig-Zag Path
  const animateDriver = async (coords) => {
    for (let i = 0; i < coords.length - 1; i++) {

      const bearing = getRhumbLineBearing(
        coords[i],
        coords[i + 1]
      );

      setHeading(bearing);

      driverAnim.timing({
        latitude: coords[i + 1].latitude,
        longitude: coords[i + 1].longitude,
        duration: 800,
        useNativeDriver: false,
      }).start();

      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  useEffect(() => {
    fetchDriverRoute();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >

        {/*  Pickup Point */}
        <Marker coordinate={pickupLocation} />

        {/*  Driver Marker */}
        <Marker.Animated
          coordinate={driverAnim}
          rotation={heading}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Image
             source={require("../../assets/car.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </Marker.Animated>

        {/*  Road Route */}
        <Polyline
          coordinates={driverRouteCoords}
          strokeWidth={4}
          strokeColor="blue"
        />

      </MapView>
    </View>
  );
};

export default RideScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});