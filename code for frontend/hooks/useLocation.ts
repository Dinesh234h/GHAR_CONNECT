// hooks/useLocation.ts — browser geolocation with fallback

import { useState, useEffect } from "react";

export type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number; label?: string }
  | { status: "denied"; message: string }
  | { status: "error"; message: string };

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({ status: "idle" });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation({
        status: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLocation({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          status: "granted",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocation({
            status: "denied",
            message: "Location permission denied. Please enable it in settings.",
          });
        } else if (err.code === err.TIMEOUT) {
          setLocation({
            status: "error",
            message: "Location request timed out. Try again.",
          });
        } else {
          setLocation({
            status: "error",
            message: "Could not get your location. Try again.",
          });
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, requestLocation };
}
