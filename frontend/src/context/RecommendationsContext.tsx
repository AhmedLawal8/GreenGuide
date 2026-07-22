import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSavedPlants, savePlant, unsavePlant } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import type { LocationProfile, RecommendedPlant } from "../types/recommendation";
import type { Location } from "../types/location";

type RecommendationsContextValue = {
  mapLocation: Location | null;
  location: LocationProfile | null;
  plants: RecommendedPlant[];
  setRecommendations: (mapLocation: Location, location: LocationProfile, plants: RecommendedPlant[]) => void;
  getPlantById: (id: number) => RecommendedPlant | undefined;
  savedPlantIds: Set<number>;
  toggleSavedPlant: (id: number) => void;
};

const RecommendationsContext = createContext<RecommendationsContextValue | null>(null);

export function RecommendationsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [mapLocation, setMapLocation] = useState<Location | null>(null);
  const [location, setLocation] = useState<LocationProfile | null>(null);
  const [plants, setPlants] = useState<RecommendedPlant[]>([]);
  const [savedPlantIds, setSavedPlantIds] = useState<Set<number>>(new Set());

  // Load the user's saved plants whenever they log in; clear them on logout.
  useEffect(() => {
    if (!token) {
      setSavedPlantIds(new Set());
      return;
    }

    let cancelled = false;
    getSavedPlants(token)
      .then((response) => {
        if (cancelled) return;
        setSavedPlantIds(new Set(response.plants.map((saved) => saved.plant_id)));
      })
      .catch(() => {
        // Ignore — saved state just stays empty until the next successful fetch.
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const setRecommendations = useCallback(
    (nextMapLocation: Location, nextLocation: LocationProfile, nextPlants: RecommendedPlant[]) => {
      setMapLocation(nextMapLocation);
      setLocation(nextLocation);
      setPlants(nextPlants);
    },
    [],
  );

  const getPlantById = useCallback(
    (id: number) => plants.find((plant) => plant.id === id),
    [plants],
  );

  const toggleSavedPlant = useCallback(
    (id: number) => {
      if (!token) return;

      const wasSaved = savedPlantIds.has(id);

      // Optimistic update — reconciled with the server, rolled back on failure.
      setSavedPlantIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      const request = wasSaved ? unsavePlant(id, token) : savePlant(id, token);
      request
        .then(() => {
          if (!wasSaved) showToast("Plant saved");
        })
        .catch(() => {
          setSavedPlantIds((prev) => {
            const next = new Set(prev);
            if (wasSaved) {
              next.add(id);
            } else {
              next.delete(id);
            }
            return next;
          });
        });
    },
    [token, savedPlantIds, showToast],
  );

  const value = useMemo(
    () => ({ mapLocation, location, plants, setRecommendations, getPlantById, savedPlantIds, toggleSavedPlant }),
    [mapLocation, location, plants, setRecommendations, getPlantById, savedPlantIds, toggleSavedPlant],
  );

  return (
    <RecommendationsContext.Provider value={value}>{children}</RecommendationsContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error("useRecommendations must be used within a RecommendationsProvider");
  }
  return context;
}
