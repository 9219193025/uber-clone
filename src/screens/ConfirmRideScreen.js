import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ConfirmRideScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const params = route.params || {};
  const ride = params.ride;
  const fare = params.fare;
  const distance = params.distance;
  const time = params.time;

  // Safety guard
  if (!ride) {
    return (
      <View style={styles.center}>
        <Text>Loading Trip Summary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Completed</Text>

      <View style={styles.card}>
        <Text>Ride: {ride?.name || '-'}</Text>
        <Text>Distance: {distance || 0} km</Text>
        <Text>Time: {time || 0} min</Text>
        <Text style={styles.fare}>Total Fare: ₹{fare || 0}</Text>
      </View>

      <Pressable
        style={styles.btn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={{ color: 'white' }}>Book Another Ride</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    width: '80%',
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
  },
  fare: { marginTop: 10, fontWeight: 'bold' },
  btn: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
  },
});
