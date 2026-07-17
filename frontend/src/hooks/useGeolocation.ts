import { useCallback } from "react";
import type { Location } from "../types/location";

export class GeolocationError extends Error {}

export function useGeolocation() {
  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new GeolocationError("Your browser doesn't support location sharing."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new GeolocationError(
                  "Location access was denied — try entering an address instead.",
                ),
              );
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new GeolocationError("Your location is currently unavailable."));
              break;
            case error.TIMEOUT:
              reject(new GeolocationError("Timed out trying to get your location."));
              break;
            default:
              reject(new GeolocationError("Couldn't get your location."));
          }
        },
      );
    });
  }, []);

  return { getCurrentLocation };
}
