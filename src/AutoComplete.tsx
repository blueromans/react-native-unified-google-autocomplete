/* eslint-disable react-hooks/exhaustive-deps */
/**
 * React Native Google Places Autocomplete
 * A React Native component that provides a Google Places Autocomplete search box
 * with unified support for both iOS and Android platforms.
 *
 * @format
 */

import debounce from 'lodash.debounce';
import {
  forwardRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import type {
  GooglePlacesAutocompleteProps,
  GooglePlacesAutocompleteRef,
  RequestType,
  ResultType,
  GeolocationPosition,
  GeolocationPositionError,
} from './types';
import {
  toGooglePlaceData,
  toGooglePlaceDetail,
  hasNavigator,
  isNewFocusInAutocompleteResultList,
  getRequestUrl,
  getRequestHeaders,
  requestShouldUseWithCredentials,
  buildRowsFromResults,
  renderDescription as renderRowDescription,
  getPredefinedPlace,
  filterResultsByTypes,
  filterResultsByPlacePredictions,
} from './helpers';
import { defaultStyles } from './styles';

/**
 * GooglePlacesAutocomplete component
 * A React Native component that provides a Google Places Autocomplete search box
 * with unified support for both iOS and Android platforms.
 */
export const GooglePlacesAutocomplete = forwardRef<
  GooglePlacesAutocompleteRef,
  GooglePlacesAutocompleteProps
>((props, ref) => {
  // Refs for storing results and request controllers
  const _resultsRef = useRef<ResultType[]>([]);
  const _requestsRef = useRef<RequestType[]>([]);

  // Component state
  const [stateText, setStateText] = useState('');
  const [dataSource, setDataSource] = useState<ResultType[]>([]);
  const [listViewDisplayed, setListViewDisplayed] = useState(
    props.listViewDisplayed === 'auto' ? false : props.listViewDisplayed
  );
  const [url, setUrl] = useState(getRequestUrl(props.requestUrl));
  const [listLoaderDisplayed, setListLoaderDisplayed] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);

  // Session token for Google Places API
  const [sessionToken, setSessionToken] = useState(
    new Date().getTime().toString()
  );

  /**
   * Checks if the current platform is supported
   */
  const supportedPlatform = useCallback(() => {
    if (Platform.OS === 'web' && !props.requestUrl) {
      console.warn(
        'This library cannot be used for the web unless you specify the requestUrl prop. See https://git.io/JflFv for more for details.'
      );
      return false;
    } else {
      return true;
    }
  }, [props.requestUrl]);

  /**
   * Aborts all pending network requests
   */
  const _abortRequests = useCallback(() => {
    _requestsRef.current.forEach((controller) => {
      if (controller && typeof controller.abort === 'function') {
        controller.abort();
      }
    });
    _requestsRef.current = [];
  }, []);

  /**
   * Enables the loader for a specific row
   */
  const _enableRowLoader = useCallback(
    (rowData: ResultType) => {
      const rows = buildRowsFromResults(
        _resultsRef.current,
        props.predefinedPlaces,
        props.currentLocation,
        props.currentLocationLabel,
        props.predefinedPlacesAlwaysVisible
      );

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (
          row &&
          (row.place_id === rowData.place_id ||
            (row.isCurrentLocation === true &&
              rowData.isCurrentLocation === true))
        ) {
          if (typeof row === 'object' && row !== null) {
            row.isLoading = true;
            setDataSource([...rows]);
            break;
          }
        }
      }
    },
    [
      props.currentLocation,
      props.currentLocationLabel,
      props.predefinedPlaces,
      props.predefinedPlacesAlwaysVisible,
    ]
  );

  /**
   * Disables all row loaders
   */
  const _disableRowLoaders = useCallback(() => {
    if (_resultsRef.current) {
      for (let i = 0; i < _resultsRef.current.length; i++) {
        if (_resultsRef.current[i]?.isLoading === true) {
          _resultsRef.current[i]!.isLoading = false;
        }
      }
    }

    setDataSource(
      buildRowsFromResults(
        _resultsRef.current,
        props.predefinedPlaces,
        props.currentLocation,
        props.currentLocationLabel,
        props.predefinedPlacesAlwaysVisible
      )
    );
  }, [
    props.currentLocation,
    props.currentLocationLabel,
    props.predefinedPlaces,
    props.predefinedPlacesAlwaysVisible,
  ]);

  /**
   * Renders the description for a result row
   */
  const _renderDescription = useCallback(
    (rowData: ResultType): string => {
      return renderRowDescription(rowData, props.renderDescription);
    },
    [props.renderDescription]
  );

  /**
   * Handles the blur event of the TextInput
   */
  const _onBlur = useCallback(
    (e?: any) => {
      if (
        e &&
        e.relatedTarget &&
        e.currentTarget &&
        isNewFocusInAutocompleteResultList({
          relatedTarget: e.relatedTarget,
          currentTarget: e.currentTarget,
        })
      )
        return;

      if (!props.keepResultsAfterBlur) {
        setListViewDisplayed(false);
      }
      inputRef?.current?.blur();
    },
    [props.keepResultsAfterBlur]
  );

  /**
   * Handles the focus event of the TextInput
   */
  const _onFocus = useCallback(() => {
    setListViewDisplayed(true);
  }, []);

  /**
   * Requests place predictions based on the input text
   */
  const _request = useCallback(
    (text: string) => {
      _abortRequests();
      if (!url) {
        return;
      }
      if (
        supportedPlatform() &&
        text &&
        text.length >= (props.minLength || 0)
      ) {
        const controller = new AbortController();
        const signal = controller.signal;
        _requestsRef.current.push(controller as any); // Store AbortController

        const timeoutId = setTimeout(() => {
          controller.abort();
          if (props.onTimeout) props.onTimeout();
        }, props.timeout || 20000);

        if (props.preProcess) {
          setStateText(props.preProcess(text));
        }

        let requestUrl = '';
        let options: RequestInit = {
          method: 'GET',
          headers: getRequestHeaders(props.requestUrl),
          signal,
          credentials: requestShouldUseWithCredentials(url)
            ? 'include'
            : 'omit',
        };

        if (props.isNewPlacesAPI) {
          const keyQueryParam = (props.query as any)?.key
            ? '?' +
              JSON.stringify({
                key: (props.query as any).key,
              })
            : '';
          requestUrl = `${url}/v1/places:autocomplete${keyQueryParam}`;
          const { ...rest } = props.query as any;
          options.method = 'POST';
          options.body = JSON.stringify({
            input: text,
            sessionToken,
            ...rest,
          });
          options.headers = {
            ...(options.headers as Record<string, string>), // Ensure existing headers are spread
            'Content-Type': 'application/json',
          };
        } else {
          const params = new URLSearchParams();
          params.append('input', text);

          // Add all query parameters
          if (props.query) {
            Object.entries(props.query).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                params.append(key, String(value));
              }
            });
          }

          requestUrl = `${url}/place/autocomplete/json?${params.toString()}`;
        }

        setListLoaderDisplayed(true);

        fetch(requestUrl, options)
          .then((response) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            if (!response.ok) {
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((responseJSON) => {
            if (typeof responseJSON.predictions !== 'undefined') {
              const results =
                props.nearbyPlacesAPI === 'GoogleReverseGeocoding'
                  ? filterResultsByTypes(
                      responseJSON.predictions,
                      props.filterReverseGeocodingByTypes || []
                    )
                  : responseJSON.predictions;

              _resultsRef.current = results;
              setDataSource(
                buildRowsFromResults(
                  results,
                  props.predefinedPlaces,
                  props.currentLocation,
                  props.currentLocationLabel,
                  props.predefinedPlacesAlwaysVisible,
                  text
                )
              );
            } else if (typeof responseJSON.suggestions !== 'undefined') {
              const results = filterResultsByPlacePredictions(
                responseJSON.suggestions
              );

              _resultsRef.current = results;
              setDataSource(
                buildRowsFromResults(
                  results,
                  props.predefinedPlaces,
                  props.currentLocation,
                  props.currentLocationLabel,
                  props.predefinedPlacesAlwaysVisible,
                  text
                )
              );
            } else if (typeof responseJSON.error_message !== 'undefined') {
              if (!props.onFail) {
                console.warn(
                  'google places autocomplete: ' + responseJSON.error_message
                );
              } else {
                props.onFail(responseJSON.error_message);
              }
            } else {
              // Handle unexpected response structure
              console.warn(
                'google places autocomplete: Unexpected response structure',
                responseJSON
              );
              if (props.onFail) {
                props.onFail('Unexpected response structure from API');
              }
            }
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            _disableRowLoaders(); // Ensure row loaders are disabled on error
            if (error.name === 'AbortError') {
              // Request was aborted (either by timeout or _abortRequests)
              // console.warn("google places autocomplete: request could not be completed or has been aborted");
            } else {
              // Other fetch errors
              if (!props.onFail) {
                console.warn('google places autocomplete: fetch error', error);
              } else {
                props.onFail(error.message);
              }
            }
          });
      } else {
        _resultsRef.current = [];
        setDataSource(
          buildRowsFromResults(
            [],
            props.predefinedPlaces,
            props.currentLocation,
            props.currentLocationLabel,
            props.predefinedPlacesAlwaysVisible
          )
        );
      }
    },
    [
      _abortRequests,
      _disableRowLoaders,
      props.minLength,
      props.timeout,
      props.onTimeout,
      props.preProcess,
      props.requestUrl,
      props.query,
      props.predefinedPlaces,
      props.currentLocation,
      props.currentLocationLabel,
      props.predefinedPlacesAlwaysVisible,
      sessionToken,
      supportedPlatform,
      url,
      props.debounce,
    ]
  );

  // Create debounced version of request function
  const debouncedRequest = useMemo(
    () => debounce(_request, props.debounce || 0),
    [_request, props.debounce]
  );

  /**
   * Handles the change text event of the TextInput
   */
  const _onChangeText = useCallback(
    (text: string) => {
      setStateText(text);
      debouncedRequest(text);
    },
    [debouncedRequest]
  );

  /**
   * Handles the change text event and calls the request function
   * Also calls the onChangeText prop if provided
   */
  const _handleChangeText = useCallback(
    (text: string) => {
      _onChangeText(text);

      const textInputProps = props.textInputProps || {};
      if (
        typeof textInputProps === 'object' &&
        'onChangeText' in textInputProps
      ) {
        const onChangeText = textInputProps.onChangeText as (
          text: string
        ) => void;
        if (onChangeText) {
          onChangeText(text);
        }
      }
    },
    [_onChangeText, props.textInputProps]
  );

  // Update URL when requestUrl prop changes
  useEffect(() => {
    setUrl(getRequestUrl(props.requestUrl));
  }, [props.requestUrl]);

  // Initialize dataSource with predefined places
  useEffect(() => {
    setDataSource(
      buildRowsFromResults(
        [],
        props.predefinedPlaces,
        props.currentLocation,
        props.currentLocationLabel,
        props.predefinedPlacesAlwaysVisible
      )
    );
  }, [
    props.predefinedPlaces,
    props.currentLocation,
    props.currentLocationLabel,
    props.predefinedPlacesAlwaysVisible,
  ]);

  // Reload search results when query changes
  useEffect(() => {
    _handleChangeText(stateText);
    return () => {
      _abortRequests();
    };
  }, [_abortRequests, _handleChangeText, props.query, stateText]);
  /**
   * Requests nearby places based on latitude and longitude
   */
  const _requestNearby = useCallback(
    (latitude: number, longitude: number) => {
      _abortRequests();

      if (
        latitude !== undefined &&
        longitude !== undefined &&
        latitude !== null &&
        longitude !== null
      ) {
        const controller = new AbortController();
        const signal = controller.signal;
        _requestsRef.current.push(controller as any); // Store AbortController

        const timeoutId = setTimeout(() => {
          controller.abort();
          if (props.onTimeout) props.onTimeout();
        }, props.timeout || 20000);

        let requestUrl = '';
        if (props.nearbyPlacesAPI === 'GoogleReverseGeocoding') {
          // your key must be allowed to use Google Maps Geocoding API
          requestUrl =
            `${url}/geocode/json?` +
            JSON.stringify({
              latlng: latitude + ',' + longitude,
              key: (props.query as any).key,
              ...(props.GoogleReverseGeocodingQuery || {}),
            });
        } else {
          requestUrl =
            `${url}/place/nearbysearch/json?` +
            JSON.stringify({
              location: latitude + ',' + longitude,
              key: (props.query as any).key,
              ...(props.GooglePlacesSearchQuery || {}),
            });
        }

        setListLoaderDisplayed(true);

        fetch(requestUrl, {
          method: 'GET',
          headers: getRequestHeaders(props.requestUrl),
          signal,
          credentials: requestShouldUseWithCredentials(url)
            ? 'include'
            : 'omit',
        })
          .then((response) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            if (!response.ok) {
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((responseJSON) => {
            console.log('Nearby places API response:', responseJSON);
            _disableRowLoaders();

            if (typeof responseJSON.results !== 'undefined') {
              let results: ResultType[] = [];
              if (props.nearbyPlacesAPI === 'GoogleReverseGeocoding') {
                results = filterResultsByTypes(
                  responseJSON.results,
                  props.filterReverseGeocodingByTypes || []
                );
              } else {
                results = responseJSON.results;
              }

              setDataSource(
                buildRowsFromResults(
                  results,
                  props.predefinedPlaces,
                  props.currentLocation,
                  props.currentLocationLabel,
                  props.predefinedPlacesAlwaysVisible
                )
              );
            } else if (typeof responseJSON.error_message !== 'undefined') {
              if (!props.onFail) {
                console.warn(
                  'google places autocomplete: ' + responseJSON.error_message
                );
              } else {
                props.onFail(responseJSON.error_message);
              }
            } else {
              // Handle unexpected response structure
              console.warn(
                'google places autocomplete: Unexpected response structure',
                responseJSON
              );
              if (props.onFail) {
                props.onFail('Unexpected response structure from API');
              }
            }
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            _disableRowLoaders(); // Ensure row loaders are disabled on error
            if (error.name === 'AbortError') {
              // Request was aborted (either by timeout or _abortRequests)
              // console.warn("google places autocomplete: request could not be completed or has been aborted");
            } else {
              // Other fetch errors
              if (!props.onFail) {
                console.warn('google places autocomplete: fetch error', error);
              } else {
                props.onFail(error.message);
              }
            }
          });
      } else {
        _resultsRef.current = [];
        setDataSource(
          buildRowsFromResults(
            [],
            props.predefinedPlaces,
            props.currentLocation,
            props.currentLocationLabel,
            props.predefinedPlacesAlwaysVisible
          )
        );
      }
    },
    [_abortRequests, _disableRowLoaders, props, url]
  );

  /**
   * Gets the current location of the user
   */
  const getCurrentLocation = useCallback(() => {
    let options = {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 1000,
    };

    if (props.enableHighAccuracyLocation && Platform.OS === 'android') {
      options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      };
    }

    if (!hasNavigator()) {
      console.warn('Geolocation is not available');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('Geolocation is not available');
      return;
    }

    if (!navigator.geolocation.getCurrentPosition) {
      console.warn('getCurrentPosition is not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        if (props.nearbyPlacesAPI === ('None' as any)) {
          let currentLocation: ResultType = {
            description: props.currentLocationLabel || 'Current location',
            geometry: {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
            id: 'current_location',
            place_id: 'current_location',
            reference: 'current_location',
            matched_substrings: [],
            structured_formatting: {
              main_text: props.currentLocationLabel || 'Current location',
              secondary_text: '',
              main_text_matched_substrings: [],
              secondary_text_matched_substrings: [],
            },
          };

          _disableRowLoaders();
          if (props.onPress) {
            props.onPress(
              toGooglePlaceData(currentLocation),
              toGooglePlaceDetail(currentLocation)
            );
          }
        } else {
          _requestNearby(position.coords.latitude, position.coords.longitude);
        }
      },
      (error: GeolocationPositionError) => {
        _disableRowLoaders();
        console.error(error.message);
      },
      options
    );
  }, [_disableRowLoaders, _requestNearby, props]);

  /**
   * Handles the press event on a result row
   */
  const _onPress = useCallback(
    (rowData: ResultType) => {
      console.log('_onPress called with rowData:', rowData);

      if (rowData.isPredefinedPlace !== true && props.fetchDetails === true) {
        console.log('Fetching details for place:', rowData.description);
        console.log('rowData.isLoading:', rowData.isLoading);
        if (rowData.isLoading === true) {
          console.log(
            'Place is already loading, clearing loading state and proceeding...'
          );
          // Clear the loading state as a safety mechanism to prevent stuck state
          rowData.isLoading = false;
          _disableRowLoaders();
        }

        Keyboard.dismiss();

        _abortRequests();

        // display loader
        _enableRowLoader(rowData);

        // fetch details
        const controller = new AbortController();
        const signal = controller.signal;
        _requestsRef.current.push(controller as any); // Store AbortController

        const timeoutId = setTimeout(() => {
          controller.abort();
          if (props.onTimeout) props.onTimeout();
        }, props.timeout || 20000);

        let requestUrl = '';
        if (props.isNewPlacesAPI) {
          const params = new URLSearchParams();
          params.append('key', (props.query as any).key);
          params.append('sessionToken', sessionToken);
          params.append('fields', props.fields || '');
          requestUrl = `${url}/v1/places/${rowData.place_id}?${params.toString()}`;
          setSessionToken(new Date().getTime().toString());
        } else {
          const params = new URLSearchParams();
          params.append('key', (props.query as any).key);
          params.append('placeid', rowData.place_id || '');
          params.append('language', (props.query as any).language || 'en');

          // Add any additional query parameters
          if (props.GooglePlacesDetailsQuery) {
            Object.entries(props.GooglePlacesDetailsQuery).forEach(
              ([key, value]) => {
                params.append(key, String(value));
              }
            );
          }
          requestUrl = `${url}/place/details/json?${params.toString()}`;
        }

        setListLoaderDisplayed(true);

        fetch(requestUrl, {
          method: 'GET',
          headers: getRequestHeaders(props.requestUrl),
          signal,
          credentials: requestShouldUseWithCredentials(url)
            ? 'include'
            : 'omit',
        })
          .then((response) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            if (!response.ok) {
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((responseJSON) => {
            console.log('Place details API response:', responseJSON);
            if (
              responseJSON.status === 'OK' ||
              (props.isNewPlacesAPI && responseJSON.id)
            ) {
              console.log('Place details API returned OK status');
              const details = props.isNewPlacesAPI
                ? responseJSON
                : responseJSON.result;
              _disableRowLoaders();
              _onBlur();

              const description = _renderDescription(rowData);
              setStateText(description);

              // Safely delete isLoading if rowData is not undefined
              if (rowData?.isLoading) {
                delete rowData.isLoading;
              }

              if (props.onPress) {
                console.log('Calling props.onPress with:', {
                  placeData: toGooglePlaceData(rowData),
                  details: details,
                });
                props.onPress(toGooglePlaceData(rowData), details);
              } else {
                console.log('props.onPress is not defined');
              }
            } else {
              _disableRowLoaders();

              if (props.autoFillOnNotFound) {
                const description = _renderDescription(rowData);
                setStateText(description);
                // Safely delete isLoading if rowData is not undefined
                if (rowData?.isLoading) {
                  delete rowData.isLoading;
                }
              }

              if (!props.onNotFound) {
                console.warn(
                  'google places autocomplete: ' + responseJSON.status
                );
              } else {
                props.onNotFound(responseJSON);
              }
            }
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            setListLoaderDisplayed(false);
            _disableRowLoaders(); // Ensure row loaders are disabled on error
            if (error.name === 'AbortError') {
              // Request was aborted (either by timeout or _abortRequests)
              if (!props.onFail) {
                console.warn(
                  'google places autocomplete: request could not be completed or has been aborted'
                );
              } else {
                props.onFail(
                  'request could not be completed or has been aborted'
                );
              }
            } else {
              // Other fetch errors
              if (!props.onFail) {
                console.warn('google places autocomplete: fetch error', error);
              } else {
                props.onFail(error.message);
              }
            }
          });
      } else if (rowData.isCurrentLocation === true) {
        // display loader
        _enableRowLoader(rowData);

        const description = _renderDescription(rowData);
        setStateText(description);

        // Safely delete isLoading if rowData is not undefined
        if (rowData?.isLoading) {
          delete rowData.isLoading;
        }

        getCurrentLocation();
      } else {
        console.log('Handling predefined or non-fetchDetails place:', rowData);
        const description = _renderDescription(rowData);
        setStateText(description);

        _onBlur();

        // Safely delete isLoading if rowData is not undefined
        if (rowData?.isLoading) {
          delete rowData.isLoading;
        }

        const predefinedPlace = getPredefinedPlace(
          rowData,
          props.predefinedPlaces
        );
        console.log('Predefined place:', predefinedPlace);

        // sending predefinedPlace as details for predefined places
        if (props.onPress) {
          console.log('Calling props.onPress for predefined place');
          props.onPress(
            toGooglePlaceData(predefinedPlace),
            toGooglePlaceDetail(predefinedPlace)
          );
        } else {
          console.log('props.onPress is not defined for predefined place');
        }
      }
    },
    [
      _abortRequests,
      _disableRowLoaders,
      _enableRowLoader,
      _onBlur,
      _renderDescription,
      getCurrentLocation,
      props,
      sessionToken,
      url,
    ]
  );

  /**
   * Renders the activity indicator for a loading row
   */
  const _getRowLoader = useCallback(() => {
    return <ActivityIndicator animating={true} size="small" />;
  }, []);

  /**
   * Renders the loader for a row if it is loading
   */
  const _renderLoader = useCallback(
    (rowData: ResultType) => {
      if (rowData.isLoading === true) {
        return (
          <View
            style={[
              props.suppressDefaultStyles ? {} : defaultStyles.loader,
              (props.styles as any)?.loader,
            ]}
          >
            {_getRowLoader()}
          </View>
        );
      }

      return null;
    },
    [_getRowLoader, props.styles, props.suppressDefaultStyles]
  );

  /**
   * Renders the data for a result row
   */
  const _renderRowData = useCallback(
    (rowData: ResultType, index: number) => {
      if (props.renderRow) {
        return props.renderRow(rowData as any, index);
      }

      return (
        <Text
          style={[
            props.suppressDefaultStyles ? {} : defaultStyles.description,
            (props.styles as any)?.description,
            rowData.isPredefinedPlace
              ? (props.styles as any)?.predefinedPlacesDescription
              : {},
          ]}
          numberOfLines={props.numberOfLines}
        >
          {_renderDescription(rowData)}
        </Text>
      );
    },
    [_renderDescription, props]
  );

  /**
   * Renders a single row in the FlatList
   */
  const _renderRow = useCallback(
    (item: ListRenderItemInfo<ResultType>) => {
      const rowData = item.item;

      const handleRowPress = () => {
        console.log('Row pressed:', rowData.description);
        console.log('About to call _onPress...');
        console.log('Full rowData object:', JSON.stringify(rowData, null, 2));
        // Dismiss keyboard first - force immediate dismissal
        Keyboard.dismiss();

        // Call _onPress directly without delay for better responsiveness
        console.log('Calling _onPress with rowData:', rowData);
        _onPress(rowData);
        console.log('_onPress call completed');
      };

      return (
        // Use TouchableOpacity instead of Pressable for better touch handling
        <TouchableOpacity
          style={[
            defaultStyles.rowContainer,
            {
              backgroundColor: props.listHoverColor || '#ffffff',
            },
          ]}
          onPress={handleRowPress}
          activeOpacity={0.6}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Select ${rowData.description || 'place'}`}
        >
          <View
            style={[
              props.suppressDefaultStyles ? {} : defaultStyles.row,
              (props.styles as any)?.row,
              rowData.isPredefinedPlace
                ? (props.styles as any)?.predefinedPlacesDescription
                : {},
            ]}
          >
            {_renderRowData(rowData, item.index)}
            {_renderLoader(rowData)}
          </View>
        </TouchableOpacity>
      );
    },
    [
      _onPress,
      _renderLoader,
      _renderRowData,
      props.listHoverColor,
      props.styles,
      props.suppressDefaultStyles,
    ]
  );

  /**
   * Renders the separator between rows in the FlatList
   */
  const _renderSeparator = useCallback(() => {
    return (
      <View
        style={[
          props.suppressDefaultStyles ? {} : defaultStyles.separator,
          (props.styles as any)?.separator,
        ]}
      />
    );
  }, [props.styles, props.suppressDefaultStyles]);

  /**
   * Renders the FlatList component
   */
  const _getFlatList = useCallback(() => {
    const keyGenerator = () => Math.random().toString(36).substr(2, 10);

    if (
      (listViewDisplayed === true || props.listViewDisplayed === true) &&
      dataSource.length > 0
    ) {
      return (
        <ScrollView
          id="result-list-id"
          style={[
            props.suppressDefaultStyles ? {} : defaultStyles.listView,
            (props.styles as any)?.listView,
          ]}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always" // Always allow taps when keyboard is open
          nestedScrollEnabled={true} // Allow nested scrolling
          keyboardDismissMode="none" // Don't dismiss keyboard on scroll
          pointerEvents="auto" // Ensure scrolling and touch events work
          {...props}
        >
          {dataSource?.slice(0, 10).map((item, index) => {
            const key = keyGenerator();
            return (
              <View key={key}>
                {index > 0 && _renderSeparator()}
                {_renderRow({ item, index } as ListRenderItemInfo<ResultType>)}
              </View>
            );
          })}
        </ScrollView>
      );
    }

    return null;
  }, [_renderRow, _renderSeparator, dataSource, listViewDisplayed, props]);

  /**
   * Renders the list view component, including empty and loader states
   */
  const _getListView = useCallback(() => {
    if (props.listEmptyComponent && dataSource.length === 0) {
      return props.listEmptyComponent;
    }

    if (props.listLoaderComponent && listLoaderDisplayed) {
      return props.listLoaderComponent;
    }

    return _getFlatList();
  }, [
    _getFlatList,
    dataSource.length,
    listLoaderDisplayed,
    props.listEmptyComponent,
    props.listLoaderComponent,
  ]);

  /**
   * Renders the "Powered by Google" logo
   */
  const _renderPoweredLogo = useCallback(() => {
    if (!props.enablePoweredByContainer) {
      return null;
    }

    return (
      <View
        style={[
          props.suppressDefaultStyles ? {} : defaultStyles.poweredContainer,
          (props.styles as any)?.poweredContainer,
        ]}
      >
        <Image
          resizeMode="contain"
          source={{
            uri: 'https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png',
          }}
          style={[
            props.suppressDefaultStyles ? {} : defaultStyles.powered,
            (props.styles as any)?.powered,
          ]}
        />
      </View>
    );
  }, [
    props.enablePoweredByContainer,
    props.styles,
    props.suppressDefaultStyles,
  ]);

  /**
   * Renders the left button component
   */
  const _renderLeftButton = useCallback(() => {
    if (props.renderLeftButton) {
      return props.renderLeftButton();
    }
    return null;
  }, [props.renderLeftButton]);

  /**
   * Renders the right button component
   */
  const _renderRightButton = useCallback(() => {
    if (props.renderRightButton) {
      return props.renderRightButton();
    }
    return null;
  }, [props.renderRightButton]);

  /**
   * Renders the header component
   */
  const _renderHeaderComponent = useCallback(() => {
    if (props.renderHeaderComponent) {
      return props.renderHeaderComponent();
    }
    return null;
  }, [props.renderHeaderComponent]);

  /**
   * Renders the inbetween component
   */
  const _renderInbetweenComponent = useCallback(() => {
    if (props.inbetweenCompo) {
      return props.inbetweenCompo;
    }
    return null;
  }, [props.inbetweenCompo]);

  /**
   * Renders the TextInput component
   */
  const _renderTextInput = useCallback(() => {
    const textInputProps = props.textInputProps || {};
    const extraInputProps: any = {};

    if ((textInputProps as any).autoFocus === undefined) {
      extraInputProps.autoFocus = true;
    }

    if ((textInputProps as any).value !== undefined) {
      extraInputProps.value = (textInputProps as any).value;
    }

    return (
      <TextInput
        ref={inputRef}
        style={[
          props.suppressDefaultStyles ? {} : defaultStyles.textInput,
          (props.styles as any)?.textInput,
        ]}
        value={stateText}
        placeholder={props.placeholder}
        onFocus={_onFocus}
        onBlur={_onBlur}
        clearButtonMode="while-editing"
        onChangeText={_handleChangeText}
        {...textInputProps}
        {...extraInputProps}
      />
    );
  }, [
    _handleChangeText,
    _onBlur,
    _onFocus,
    props.placeholder,
    props.styles,
    props.suppressDefaultStyles,
    props.textInputProps,
    stateText,
  ]);

  // Expose methods via ref
  useImperativeHandle(ref, () => {
    // Create a base object with our custom methods
    const methods: GooglePlacesAutocompleteRef = {
      setAddressText: (address: string) => {
        setStateText(address);
      },
      getAddressText: () => stateText,
      getCurrentLocation,
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      clear: () => {
        inputRef.current?.clear();
        setStateText('');
        _resultsRef.current = [];
        setDataSource(
          buildRowsFromResults(
            [],
            props.predefinedPlaces,
            props.currentLocation,
            props.currentLocationLabel,
            props.predefinedPlacesAlwaysVisible
          )
        );
      },
      isFocused: () => {
        return inputRef.current?.isFocused() || false;
      },
    };

    // Forward all TextInput methods to the inputRef
    return new Proxy(methods, {
      get: (target, prop) => {
        // First check if the property exists in our custom methods
        if (prop in target) {
          return target[prop as keyof typeof target];
        }

        // Otherwise, forward to the inputRef if it exists
        if (inputRef.current && typeof prop === 'string') {
          const value = inputRef.current[prop as keyof TextInput];

          // If it's a function, bind it to the inputRef.current
          if (typeof value === 'function') {
            return (...args: any[]) => {
              return (inputRef.current as any)[prop](...args);
            };
          }

          return value;
        }

        // Return a no-op function for any missing methods to satisfy the interface
        if (typeof prop === 'string') {
          return () => {};
        }

        return undefined;
      },
    }) as GooglePlacesAutocompleteRef;
  }, [
    getCurrentLocation,
    props.currentLocation,
    props.currentLocationLabel,
    props.predefinedPlaces,
    props.predefinedPlacesAlwaysVisible,
    stateText,
  ]);

  if (props.textInputHide) {
    return (
      <View
        style={[
          props.suppressDefaultStyles ? {} : defaultStyles.container,
          (props.styles as any)?.container,
        ]}
        pointerEvents="box-none"
      >
        {_renderHeaderComponent()}
        <View>
          {_renderInbetweenComponent()}
          {_getListView()}
          {_renderPoweredLogo()}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        props.suppressDefaultStyles ? {} : defaultStyles.container,
        (props.styles as any)?.container,
      ]}
      pointerEvents="box-none"
    >
      {_renderHeaderComponent()}
      <View>
        <View
          style={[
            props.suppressDefaultStyles ? {} : defaultStyles.textInputContainer,
            (props.styles as any)?.textInputContainer,
          ]}
        >
          {_renderLeftButton()}
          {_renderTextInput()}
          {_renderRightButton()}
        </View>
        {_renderInbetweenComponent()}
        {_getListView()}
        {_renderPoweredLogo()}
      </View>
    </View>
  );
});
