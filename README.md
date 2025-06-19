# React Native Unified Google Autocomplete

A React Native component that provides a Google Places Autocomplete search box with unified support for both iOS and Android platforms.

## Features

- Google Places Autocomplete integration
- Support for both iOS and Android
- Customizable UI components
- Current location detection
- Predefined places support
- Debounce functionality for API requests
- TypeScript support

## Installation

```bash
npm install react-native-unified-google-autocomplete
# or
yarn add react-native-unified-google-autocomplete
```

## Usage

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-unified-google-autocomplete';

const GooglePlacesInput = () => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      query={{
        key: 'YOUR_API_KEY',
        language: 'en', // language of the results
      }}
      onPress={(data, details = null) => {
        console.log(data, details);
      }}
      onFail={(error) => console.error(error)}
      requestUrl={{
        url: 'https://maps.googleapis.com/maps/api',
        useOnPlatform: 'all'
      }}
      styles={{
        textInputContainer: {
          backgroundColor: 'rgba(0,0,0,0)',
          borderTopWidth: 0,
          borderBottomWidth: 0,
        },
        textInput: {
          marginLeft: 0,
          marginRight: 0,
          height: 38,
          color: '#5d5d5d',
          fontSize: 16,
        },
        predefinedPlacesDescription: {
          color: '#1faadb',
        },
      }}
    />
  );
};

export default GooglePlacesInput;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | string | 'Search' | Placeholder text for the search input |
| query | object | {} | Query object for Google Places API |
| onPress | function | | Callback when a place is selected |
| fetchDetails | boolean | false | Fetch additional place details when a place is selected |
| styles | object | {} | Custom styles for the component |
| textInputProps | object | {} | Props for the TextInput component |
| enablePoweredByContainer | boolean | true | Show "Powered by Google" logo |
| currentLocation | boolean | false | Show "Current location" button |
| currentLocationLabel | string | 'Current location' | Label for current location button |
| debounce | number | 0 | Debounce time in ms for search requests |
| minLength | number | 0 | Minimum length of text to trigger a search |
| predefinedPlaces | array | [] | Array of predefined places to show in results |
| predefinedPlacesAlwaysVisible | boolean | false | Always show predefined places |
| nearbyPlacesAPI | string | 'GooglePlacesSearch' | Which API to use for nearby places |
| GooglePlacesSearchQuery | object | {} | Query for Google Places Search API |
| GooglePlacesDetailsQuery | object | {} | Query for Google Places Details API |
| GoogleReverseGeocodingQuery | object | {} | Query for Google Reverse Geocoding API |
| filterReverseGeocodingByTypes | array | [] | Filter reverse geocoding results by types |
| listViewDisplayed | 'auto' \| boolean | 'auto' | Show/hide the results list |
| renderRow | function | | Custom render function for result rows |
| renderLeftButton | function | | Custom render function for left button |
| renderRightButton | function | | Custom render function for right button |
| renderDescription | function | | Custom render function for place descriptions |
| listEmptyComponent | component | null | Component to render when no results are found |
| listLoaderComponent | component | null | Component to render when results are loading |
| textInputHide | boolean | false | Hide the text input |
| suppressDefaultStyles | boolean | false | Disable default styles |
| enableHighAccuracyLocation | boolean | false | Enable high accuracy for location detection |
| isNewPlacesAPI | boolean | false | Use the new Places API |
| fields | string | | Fields to request from the Places API |

## Methods

You can access the component's methods using a ref:

```jsx
import React, { useRef } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-unified-google-autocomplete';

const GooglePlacesInput = () => {
  const ref = useRef();

  return (
    <>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder='Search'
        query={{
          key: 'YOUR_API_KEY',
          language: 'en',
        }}
        onPress={(data, details = null) => {
          console.log(data, details);
        }}
      />
      <Button 
        title="Set Address" 
        onPress={() => ref.current?.setAddressText('Some Address')} 
      />
    </>
  );
};
```

Available methods:
- `setAddressText(address)`: Set the address text
- `getAddressText()`: Get the current address text
- `getCurrentLocation()`: Trigger current location detection

## License

MIT
