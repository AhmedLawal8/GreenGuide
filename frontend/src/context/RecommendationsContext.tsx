import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { LocationProfile, RecommendedPlant } from "../types/recommendation";

type RecommendationsContextValue = {
  location: LocationProfile | null;
  plants: RecommendedPlant[];
  setRecommendations: (location: LocationProfile, plants: RecommendedPlant[]) => void;
  getPlantById: (id: number) => RecommendedPlant | undefined;
  savedPlantIds: Set<number>;
  toggleSavedPlant: (id: number) => void;
};

const RecommendationsContext = createContext<RecommendationsContextValue | null>(null);

export function RecommendationsProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationProfile | null>(null);
  const [plants, setPlants] = useState<RecommendedPlant[]>([]);
  const [savedPlantIds, setSavedPlantIds] = useState<Set<number>>(new Set());

  const setRecommendations = useCallback((nextLocation: LocationProfile, nextPlants: RecommendedPlant[]) => {
    setLocation(nextLocation);
    setPlants(nextPlants);
  }, []);

  const getPlantById = useCallback(
    (id: number) => plants.find((plant) => plant.id === id),
    [plants],
  );

  const toggleSavedPlant = useCallback((id: number) => {
    setSavedPlantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ location, plants, setRecommendations, getPlantById, savedPlantIds, toggleSavedPlant }),
    [location, plants, setRecommendations, getPlantById, savedPlantIds, toggleSavedPlant],
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
