import { Platform } from 'react-native';
import type {
  GooglePlaceData,
  GooglePlaceDetail,
  ResultType,
  PlaceType,
  PredefinedPlace,
  RequestUrl,
} from './types';

/**
 * Helper function to convert ResultType to GooglePlaceData
 * @param data - The ResultType data to convert
 * @returns GooglePlaceData object
 */
export const toGooglePlaceData = (data: ResultType): GooglePlaceData => {
  return {
    description: data.description || '',
    id: data.id || '',
    matched_substrings: data.matched_substrings || [],
    place_id: data.place_id || '',
    reference: data.reference || '',
    structured_formatting: {
      main_text: data.structured_formatting?.main_text || '',
      main_text_matched_substrings:
        data.structured_formatting?.main_text_matched_substrings || [],
      secondary_text: data.structured_formatting?.secondary_text || '',
      secondary_text_matched_substrings:
        data.structured_formatting?.secondary_text_matched_substrings || [],
    },
  };
};

/**
 * Helper function to convert ResultType to GooglePlaceDetail
 * @param data - The ResultType data to convert
 * @returns GooglePlaceDetail object
 */
export const toGooglePlaceDetail = (data: ResultType): GooglePlaceDetail => {
  return {
    address_components: [],
    adr_address: '',
    formatted_address: data.formatted_address || '',
    geometry: {
      location: {
        lat: data.geometry?.location?.lat || 0,
        lng: data.geometry?.location?.lng || 0,
        latitude: data.geometry?.location?.lat || 0,
        longitude: data.geometry?.location?.lng || 0,
      },
      viewport: {
        northeast: {
          lat: 0,
          lng: 0,
          latitude: 0,
          longitude: 0,
        },
        southwest: {
          lat: 0,
          lng: 0,
          latitude: 0,
          longitude: 0,
        },
      },
    },
    icon: '',
    id: data.id || '',
    name: data.name || '',
    place_id: data.place_id || '',
    plus_code: {
      compound_code: '',
      global_code: '',
    },
    reference: data.reference || '',
    scope: 'GOOGLE',
    types: data.types || [],
    url: '',
    utc_offset: 0,
    vicinity: '',
    // New Places API parameters
    addressComponents: [],
    adrFormatAddress: '',
    formattedAddress: data.formatted_address || '',
    location: {
      lat: data.geometry?.location?.lat || 0,
      lng: data.geometry?.location?.lng || 0,
      latitude: data.geometry?.location?.lat || 0,
      longitude: data.geometry?.location?.lng || 0,
    },
  };
};

/**
 * Filter results by types
 * @param unfilteredResults - The unfiltered results array
 * @param types - Array of place types to filter by
 * @returns Filtered results array
 */
export const filterResultsByTypes = (
  unfilteredResults: any[],
  types: PlaceType[]
): ResultType[] => {
  if (!types || types.length === 0) return unfilteredResults;

  const results = [];
  for (let i = 0; i < unfilteredResults.length; i++) {
    let found = false;

    for (let j = 0; j < types.length; j++) {
      const item = unfilteredResults[i];
      if (
        item &&
        item.types &&
        item.types.indexOf &&
        item.types.indexOf(types[j]) !== -1
      ) {
        found = true;
        break;
      }
    }

    if (found === true) {
      results.push(unfilteredResults[i]);
    }
  }
  return results;
};

/**
 * Filter results by place predictions (for New Places API)
 * @param unfilteredResults - The unfiltered results array
 * @returns Filtered results array
 */
export const filterResultsByPlacePredictions = (unfilteredResults: any[]): ResultType[] => {
  const results = [];
  for (let i = 0; i < unfilteredResults.length; i++) {
    const item = unfilteredResults[i];
    if (item && item.placePrediction) {
      const prediction = item.placePrediction;
      const mainText = prediction.structuredFormat?.mainText?.text || '';
      const secondaryText =
        prediction.structuredFormat?.secondaryText?.text || '';

      results.push({
        description: prediction.text?.text || '',
        place_id: prediction.placeId || '',
        reference: prediction.placeId || '',
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
        types: prediction.types || [],
      });
    }
  }
  return results;
};

/**
 * Check if navigator is available for geolocation
 * @returns True if navigator and geolocation are available
 */
export const hasNavigator = (): boolean => {
  if (typeof navigator !== 'undefined' && navigator?.geolocation) {
    return true;
  } else {
    console.warn(
      'If you are using React Native v0.60.0+ you must follow these instructions to enable currentLocation: https://git.io/Jf4AR'
    );
    return false;
  }
};

/**
 * Check if the new focus is in autocomplete result list
 * @param params - Object containing relatedTarget and optional currentTarget
 * @returns True if the new focus is within the result list
 */
export const isNewFocusInAutocompleteResultList = ({
  relatedTarget,
}: {
  relatedTarget: any;
  currentTarget?: any;
}): boolean => {
  if (!relatedTarget) return false;

  // Safe check for web platform
  if (
    typeof Platform !== 'undefined' &&
    Platform.OS === 'web' &&
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).document !== 'undefined'
  ) {
    const doc = (globalThis as any).document;
    const resultList = doc.getElementById?.('result-list-id');
    if (
      resultList &&
      resultList.contains &&
      resultList.contains(relatedTarget)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Get request URL based on platform
 * @param requestUrl - The requestUrl configuration object
 * @returns The determined request URL
 */
export const getRequestUrl = (
  requestUrl: RequestUrl | undefined
): string => {
  if (requestUrl) {
    if (requestUrl.useOnPlatform === 'all') {
      return requestUrl.url;
    }
    if (requestUrl.useOnPlatform === 'web') {
      return typeof Platform !== 'undefined'
        ? Platform.select({
            web: requestUrl.url,
            default: 'https://maps.googleapis.com/maps/api',
          })
        : 'https://maps.googleapis.com/maps/api';
    }
    // Default return for when requestUrl exists but doesn't match the conditions above
    return 'https://maps.googleapis.com/maps/api';
  } else {
    return 'https://maps.googleapis.com/maps/api';
  }
};

/**
 * Get request headers
 * @param requestUrl - The requestUrl configuration object
 * @returns The request headers
 */
export const getRequestHeaders = (
  requestUrl: RequestUrl | undefined
): Record<string, string> => {
  return requestUrl?.headers || {};
};

/**
 * Set request headers on an XMLHttpRequest object
 * @param request - The XMLHttpRequest object
 * @param headers - The headers to set
 */
export const setRequestHeaders = (
  request: XMLHttpRequest,
  headers: Record<string, string>
): void => {
  Object.keys(headers).forEach((headerKey) => {
    const value = headers[headerKey];
    if (value !== undefined) {
      request.setRequestHeader(headerKey, value);
    }
  });
};

/**
 * Check if request should use with credentials
 * @param url - The request URL
 * @returns True if the request should use credentials
 */
export const requestShouldUseWithCredentials = (url: string): boolean =>
  url === 'https://maps.googleapis.com/maps/api';

/**
 * Builds the data source for the FlatList from the results and predefined places
 * @param results - The results from the Google Places API
 * @param predefinedPlaces - Array of predefined places
 * @param currentLocation - Whether to include current location
 * @param currentLocationLabel - Label for current location
 * @param predefinedPlacesAlwaysVisible - Whether predefined places should always be visible
 * @param text - The current text in the input field
 * @returns The combined list of predefined places and results
 */
export const buildRowsFromResults = (
  results: ResultType[],
  predefinedPlaces: PredefinedPlace[] = [],
  currentLocation: boolean = false,
  currentLocationLabel: string = 'Current location',
  predefinedPlacesAlwaysVisible: boolean = false,
  text?: string
): ResultType[] => {
  let res: ResultType[] = [];
  const shouldDisplayPredefinedPlaces = text
    ? results.length === 0 && text.length === 0
    : results.length === 0;
  
  if (shouldDisplayPredefinedPlaces || predefinedPlacesAlwaysVisible === true) {
    // Filter out any potentially undefined or null places and map to ResultType
    const validPredefinedPlaces: ResultType[] = (predefinedPlaces || [])
      .filter((place) => place != null && place.description != null)
      .map((place) => ({
        // Start with spreading the predefined place properties
        ...place,
        // Explicitly define or provide default values for required ResultType properties
        description: place.description, // description is required in PredefinedPlace
        geometry: place.geometry || { location: { lat: 0, lng: 0 } }, // geometry is required in PredefinedPlace, provide default if somehow missing
        isPredefinedPlace: true,
        id: place.id || '', // Provide default empty string if id is missing
        place_id: place.place_id || '', // Provide default empty string if place_id is missing
        reference: place.reference || '', // Provide default empty string if reference is missing
        matched_substrings: place.matched_substrings || [], // Provide default empty array if missing
        structured_formatting: place.structured_formatting || { main_text: '', secondary_text: '' }, // Provide default if missing
      }));

    res = [
      ...validPredefinedPlaces,
    ];

    if (currentLocation === true && hasNavigator()) {
      res.unshift({
        description: currentLocationLabel || 'Current location',
        isCurrentLocation: true,
        // Provide default values for other ResultType properties for current location
        id: 'current_location',
        place_id: 'current_location',
        reference: 'current_location',
        matched_substrings: [],
        structured_formatting: { main_text: currentLocationLabel || 'Current location', secondary_text: '' },
        geometry: { location: { lat: 0, lng: 0 } }, // Default geometry for current location
      });
    }
  }

  // Ensure res is an array before concatenating with results
  res = res || [];

  return [...res, ...results];
};

/**
 * Renders the description for a result row
 * @param rowData - The data for the row
 * @param renderDescription - Optional custom render function
 * @returns The description to display
 */
export const renderDescription = (
  rowData: ResultType,
  renderDescription?: (data: any) => string
): string => {
  if (renderDescription) {
    return renderDescription(rowData);
  }

  return (
    rowData.description || rowData.formatted_address || rowData.name || ''
  );
};

/**
 * Gets the predefined place data for a given row
 * @param rowData - The data for the row
 * @param predefinedPlaces - Array of predefined places
 * @returns The predefined place data
 */
export const getPredefinedPlace = (
  rowData: ResultType,
  predefinedPlaces: PredefinedPlace[] = []
): ResultType => {
  if (rowData.isPredefinedPlace !== true) {
    return rowData;
  }

  for (let i = 0; i < predefinedPlaces.length; i++) {
    const place = predefinedPlaces[i];
    if (
      place &&
      place.description &&
      rowData.description &&
      place.description === rowData.description
    ) {
      return place as ResultType;
    }
  }

  return rowData;
};
