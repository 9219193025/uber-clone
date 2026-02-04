import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ConfirmRideScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { ride, fare, distance, time } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Completed </Text>

      <View style={styles.card}>
        <Text>Ride: {ride.name}</Text>
        <Text>Distance: {distance} km</Text>
        <Text>Time: {time} min</Text>
        <Text style={styles.fare}>Total Fare: ₹{fare}</Text>
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
