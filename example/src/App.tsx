import { useCallback, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-unified-google-autocomplete';
import type {
  GooglePlacesAutocompleteRef,
  ResultType,
  GooglePlaceDetail,
} from 'react-native-unified-google-autocomplete';

const API_KEY = 'API_KEY'; // Replace with your actual Google Places API key from Google Cloud Console

const GooglePlacesExample = () => {
  const [selectedPlace, setSelectedPlace] = useState<{
    description: string;
    location?: { latitude: number; longitude: number };
  } | null>(null);

  const autocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  const clearSearch = useCallback(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.setAddressText('');
      setSelectedPlace(null);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.getCurrentLocation();
    }
  }, []);

  const renderLeftButton = useCallback(() => {
    return (
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.buttonText}>📍</Text>
      </TouchableOpacity>
    );
  }, [getCurrentLocation]);

  const renderRightButton = useCallback(() => {
    return (
      <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
        <Text style={styles.buttonText}>✕</Text>
      </TouchableOpacity>
    );
  }, [clearSearch]);

  const onPress = useCallback(
    (data: ResultType, details: GooglePlaceDetail | null = null) => {
      console.log('Example App onPress called with:', { data, details });

      // Alert to make it very visible when onPress is called
      Alert.alert('Place Selected', `${data.description}`);

      setSelectedPlace({
        description: data.description || '',
        location: details?.geometry?.location
          ? {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            }
          : undefined,
      });
    },
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Google Places Autocomplete</Text>
      </View>

      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder="Search for a location"
        query={{
          key: API_KEY,
          language: 'en',
          components: Platform.OS === 'ios' ? 'country:us' : 'country:us',
        }}
        fetchDetails={true}
        onPress={onPress}
        onFail={(error) => console.error('Error fetching places:', error)}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        textInputProps={{
          autoCapitalize: 'none',
          autoCorrect: false,
        }}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
          types: 'restaurant',
        }}
        GooglePlacesDetailsQuery={{
          fields: 'geometry,formatted_address,name,place_id',
        }}
        predefinedPlaces={[
          {
            description: 'Home',
            geometry: {
              location: {
                lat: 37.7749,
                lng: -122.4194,
                latitude: 37.7749,
                longitude: -122.4194,
              },
            },
          },
          {
            description: 'Work',
            geometry: {
              location: {
                lat: 37.422,
                lng: -122.0841,
                latitude: 37.422,
                longitude: -122.0841,
              },
            },
          },
        ]}
        renderLeftButton={renderLeftButton}
        renderRightButton={renderRightButton}
      />

      {selectedPlace && (
        <View style={styles.selectedPlaceContainer}>
          <Text style={styles.selectedPlaceTitle}>Selected Location:</Text>
          <Text style={styles.selectedPlaceText}>
            {selectedPlace.description}
          </Text>
          {selectedPlace.location && (
            <Text style={styles.selectedPlaceCoords}>
              Lat: {selectedPlace.location.latitude.toFixed(6)}, Lng:{' '}
              {selectedPlace.location.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  autocompleteContainer: {
    flex: 0,
    position: 'relative',
    padding: 16,
    zIndex: 1,
  },
  textInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    fontSize: 16,
  },
  locationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  selectedPlaceContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPlaceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedPlaceText: {
    fontSize: 16,
    marginBottom: 8,
  },
  selectedPlaceCoords: {
    fontSize: 14,
    color: '#666',
  },
});

export default GooglePlacesExample;
