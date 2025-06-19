// This file contains type declarations for modules without TypeScript definitions

// Type declarations for modules that don't have their own type definitions
declare module 'qs';
declare module 'uuid';

// Add navigator declaration for React Native environment
interface Geolocation {
  getCurrentPosition: Function;
  watchPosition: Function;
  clearWatch: Function;
  default?: {
    getCurrentPosition: Function;
  };
}

interface Navigator {
  geolocation?: Geolocation;
}

declare const navigator: Navigator;
