// Export the main component
export { GooglePlacesAutocomplete } from './AutoComplete';

// Export types
export type {
  GooglePlacesAutocompleteProps,
  GooglePlacesAutocompleteRef,
  GooglePlaceData,
  GooglePlaceDetail,
  PlaceType,
  SearchType,
  Point,
  Viewport,
  Geometry,
  StructuredFormatting,
  AddressComponent,
  PlusCode,
  PredefinedPlace,
  RequestUrl,
  ResultType,
} from './types';

// Export helper functions
export {
  toGooglePlaceData,
  toGooglePlaceDetail,
  hasNavigator,
  filterResultsByTypes,
  filterResultsByPlacePredictions,
} from './helpers';
