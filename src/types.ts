import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type PlaceType =
  | 'accounting'
  | 'airport'
  | 'amusement_park'
  | 'aquarium'
  | 'art_gallery'
  | 'atm'
  | 'bakery'
  | 'bank'
  | 'bar'
  | 'beauty_salon'
  | 'bicycle_store'
  | 'book_store'
  | 'bowling_alley'
  | 'bus_station'
  | 'cafe'
  | 'campground'
  | 'car_dealer'
  | 'car_rental'
  | 'car_repair'
  | 'car_wash'
  | 'casino'
  | 'cemetery'
  | 'church'
  | 'city_hall'
  | 'clothing_store'
  | 'convenience_store'
  | 'courthouse'
  | 'dentist'
  | 'department_store'
  | 'doctor'
  | 'drugstore'
  | 'electrician'
  | 'electronics_store'
  | 'embassy'
  | 'fire_station'
  | 'florist'
  | 'funeral_home'
  | 'furniture_store'
  | 'gas_station'
  | 'gym'
  | 'hair_care'
  | 'hardware_store'
  | 'hindu_temple'
  | 'home_goods_store'
  | 'hospital'
  | 'insurance_agency'
  | 'jewelry_store'
  | 'laundry'
  | 'lawyer'
  | 'library'
  | 'light_rail_station'
  | 'liquor_store'
  | 'local_government_office'
  | 'locksmith'
  | 'lodging'
  | 'meal_delivery'
  | 'meal_takeaway'
  | 'mosque'
  | 'movie_rental'
  | 'movie_theater'
  | 'moving_company'
  | 'museum'
  | 'night_club'
  | 'painter'
  | 'park'
  | 'parking'
  | 'pet_store'
  | 'pharmacy'
  | 'physiotherapist'
  | 'plumber'
  | 'police'
  | 'post_office'
  | 'primary_school'
  | 'real_estate_agency'
  | 'restaurant'
  | 'roofing_contractor'
  | 'rv_park'
  | 'school'
  | 'secondary_school'
  | 'shoe_store'
  | 'shopping_mall'
  | 'spa'
  | 'stadium'
  | 'storage'
  | 'store'
  | 'subway_station'
  | 'supermarket'
  | 'synagogue'
  | 'taxi_stand'
  | 'tourist_attraction'
  | 'train_station'
  | 'transit_station'
  | 'travel_agency'
  | 'university'
  | 'veterinary_care'
  | 'zoo'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3'
  | 'administrative_area_level_4'
  | 'administrative_area_level_5'
  | 'archipelago'
  | 'colloquial_area'
  | 'continent'
  | 'country'
  | 'establishment'
  | 'finance'
  | 'floor'
  | 'food'
  | 'general_contractor'
  | 'geocode'
  | 'health'
  | 'intersection'
  | 'landmark'
  | 'locality'
  | 'natural_feature'
  | 'neighborhood'
  | 'place_of_worship'
  | 'plus_code'
  | 'point_of_interest'
  | 'political'
  | 'post_box'
  | 'postal_code'
  | 'postal_code_prefix'
  | 'postal_code_suffix'
  | 'postal_town'
  | 'premise'
  | 'room'
  | 'route'
  | 'street_address'
  | 'street_number'
  | 'sublocality'
  | 'sublocality_level_1'
  | 'sublocality_level_2'
  | 'sublocality_level_3'
  | 'sublocality_level_4'
  | 'sublocality_level_5'
  | 'subpremise'
  | 'town_square';

export type SearchType =
  | 'accounting'
  | 'airport'
  | 'amusement_park'
  | 'aquarium'
  | 'art_gallery'
  | 'atm'
  | 'bakery'
  | 'bank'
  | 'bar'
  | 'beauty_salon'
  | 'bicycle_store'
  | 'book_store'
  | 'bowling_alley'
  | 'bus_station'
  | 'cafe'
  | 'campground'
  | 'car_dealer'
  | 'car_rental'
  | 'car_repair'
  | 'car_wash'
  | 'casino'
  | 'cemetery'
  | 'church'
  | 'city_hall'
  | 'clothing_store'
  | 'convenience_store'
  | 'courthouse'
  | 'dentist'
  | 'department_store'
  | 'doctor'
  | 'drugstore'
  | 'electrician'
  | 'electronics_store'
  | 'embassy'
  | 'fire_station'
  | 'florist'
  | 'funeral_home'
  | 'furniture_store'
  | 'gas_station'
  | 'gym'
  | 'hair_care'
  | 'hardware_store'
  | 'hindu_temple'
  | 'home_goods_store'
  | 'hospital'
  | 'insurance_agency'
  | 'jewelry_store'
  | 'laundry'
  | 'lawyer'
  | 'library'
  | 'light_rail_station'
  | 'liquor_store'
  | 'local_government_office'
  | 'locksmith'
  | 'lodging'
  | 'meal_delivery'
  | 'meal_takeaway'
  | 'mosque'
  | 'movie_rental'
  | 'movie_theater'
  | 'moving_company'
  | 'museum'
  | 'night_club'
  | 'painter'
  | 'park'
  | 'parking'
  | 'pet_store'
  | 'pharmacy'
  | 'physiotherapist'
  | 'plumber'
  | 'police'
  | 'post_office'
  | 'primary_school'
  | 'real_estate_agency'
  | 'restaurant'
  | 'roofing_contractor'
  | 'rv_park'
  | 'school'
  | 'secondary_school'
  | 'shoe_store'
  | 'shopping_mall'
  | 'spa'
  | 'stadium'
  | 'storage'
  | 'store'
  | 'subway_station'
  | 'supermarket'
  | 'synagogue'
  | 'taxi_stand'
  | 'tourist_attraction'
  | 'train_station'
  | 'transit_station'
  | 'travel_agency'
  | 'university'
  | 'veterinary_care'
  | 'zoo';

export interface Point {
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
}

export interface Viewport {
  northeast: Point;
  southwest: Point;
}

export interface Geometry {
  location: Point;
  viewport?: Viewport;
}

export interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings?: any[];
  secondary_text: string;
  secondary_text_matched_substrings?: any[];
  terms?: any[];
  types?: PlaceType[];
}

export interface GooglePlaceData {
  description: string;
  id: string;
  matched_substrings: any[];
  place_id: string;
  reference: string;
  structured_formatting: StructuredFormatting;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: PlaceType[];
}

export interface PlusCode {
  compound_code: string;
  global_code: string;
}

export interface GooglePlaceDetail {
  address_components: AddressComponent[];
  adr_address: string;
  formatted_address: string;
  geometry: {
    location: Point;
    viewport: Viewport;
  };
  icon: string;
  id: string;
  name: string;
  place_id: string;
  plus_code: PlusCode;
  reference: string;
  scope: string;
  types: PlaceType[];
  url: string;
  utc_offset: number;
  vicinity: string;
  // New Places API parameters
  addressComponents: AddressComponent[];
  adrFormatAddress: string;
  formattedAddress: string;
  location: Point;
}

export interface PredefinedPlace {
  description: string;
  geometry: {
    location: Point;
  };
  [key: string]: any;
}

export interface RequestUrl {
  url: string;
  useOnPlatform: 'web' | 'all';
  headers?: Record<string, string>;
}

export interface GooglePlacesAutocompleteProps {
  placeholder?: string;
  query?: {
    key: string;
    language?: string;
    components?: string;
    types?: string;
    location?: string;
    radius?: string;
    [key: string]: any;
  };
  fetchDetails?: boolean;
  autoFillOnNotFound?: boolean;
  getDefaultValue?: () => string;
  listViewDisplayed?: 'auto' | boolean;
  debounce?: number;
  enablePoweredByContainer?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  timeout?: number;
  onTimeout?: () => void;
  onNotFound?: (data: any) => void;
  onFail?: (error: string) => void;
  onPress?: (data: GooglePlaceData, detail: GooglePlaceDetail | null) => void;
  textInputProps?: TextInputProps;
  listEmptyComponent?: ReactNode;
  listLoaderComponent?: ReactNode;
  inbetweenCompo?: ReactNode;
  textInputHide?: boolean;
  keepResultsAfterBlur?: boolean;
  isRowScrollable?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  listUnderlayColor?: string;
  listHoverColor?: string;
  styles?: {
    container?: StyleProp<ViewStyle>;
    textInputContainer?: StyleProp<ViewStyle>;
    textInput?: StyleProp<TextStyle>;
    listView?: StyleProp<ViewStyle>;
    row?: StyleProp<ViewStyle>;
    loader?: StyleProp<ViewStyle>;
    description?: StyleProp<TextStyle>;
    separator?: StyleProp<ViewStyle>;
    poweredContainer?: StyleProp<ViewStyle>;
    powered?: StyleProp<ViewStyle>;
    predefinedPlacesDescription?: StyleProp<TextStyle>;
    rowContainer?: StyleProp<ViewStyle>;
  };
  suppressDefaultStyles?: boolean;
  numberOfLines?: number;
  renderDescription?: (data: any) => string;
  renderRow?: (data: any, index: number) => ReactNode;
  renderLeftButton?: () => ReactNode;
  renderRightButton?: () => ReactNode;
  renderHeaderComponent?: () => ReactNode;
  predefinedPlaces?: PredefinedPlace[];
  predefinedPlacesAlwaysVisible?: boolean;
  currentLocation?: boolean;
  currentLocationLabel?: string;
  enableHighAccuracyLocation?: boolean;
  nearbyPlacesAPI?: 'None' | 'GoogleReverseGeocoding' | 'GooglePlacesSearch';
  filterReverseGeocodingByTypes?: PlaceType[];
  GooglePlacesSearchQuery?: {
    rankby?: 'prominence' | 'distance';
    radius?: string;
    types?: SearchType;
  };
  GooglePlacesDetailsQuery?: {
    fields?: string;
    [key: string]: any;
  };
  GoogleReverseGeocodingQuery?: {
    [key: string]: any;
  };
  requestUrl?: RequestUrl;
  preProcess?: (text: string) => string;
  disableScroll?: boolean;
  isNewPlacesAPI?: boolean;
  fields?: string;
}

export interface GooglePlacesAutocompleteRef {
  setAddressText: (address: string) => void;
  getAddressText: () => string;
  getCurrentLocation: () => void;
  [key: string]: any;
}

// Define proper types for results and requests
export interface RequestType extends XMLHttpRequest {
  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null;
}

export interface ResultType {
  description?: string;
  place_id?: string;
  isLoading?: boolean;
  isPredefinedPlace?: boolean;
  isCurrentLocation?: boolean;
  formatted_address?: string;
  name?: string;
  types?: PlaceType[];
  id?: string;
  reference?: string;
  matched_substrings?: any[];
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
    main_text_matched_substrings?: any[];
    secondary_text_matched_substrings?: any[];
  };
  [key: string]: any; // Allow other properties
}

// Define GeolocationPosition and GeolocationPositionError if not available
export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface GeolocationPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}
