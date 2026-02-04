import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';


export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();


  const searchPlace = async (text) => {
    setQuery(text);

    if (text.length < 3) {
      setPlaces([]);
      return;
    }

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=6`
      );
      const data = await res.json();
      setPlaces(data.features);
    } catch (e) {
      console.log('Fetch error:', e);
    }
  };

  const selectPlace = (item) => {
  const name =
    item.properties.name || item.properties.city || 'Selected place';

  const [lng, lat] = item.geometry.coordinates;

  navigation.navigate('Home', {
    destination: {
      latitude: lat,
      longitude: lng,
      name,
    },
  });
  };


  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Where to?"
        value={query}
        onChangeText={searchPlace}
        style={styles.input}
      />

      <FlatList
        data={places}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => selectPlace(item)}>
            <Text>
              {item.properties.name || item.properties.city},{" "}
              {item.properties.country}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
