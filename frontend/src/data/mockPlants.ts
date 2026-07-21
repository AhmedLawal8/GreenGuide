import type { Plant } from "../types/plant";

export const mockPlants: Plant[] = [
  {
    id: "fernie",
    name: "Fernie",
    species: "Boston Fern",
    wateringFrequencyDays: 3,
    lightNeeds: "Indirect",
    lastWateredDate: "2026-07-18",
  },
  {
    id: "spike",
    name: "Spike",
    species: "Snake Plant",
    wateringFrequencyDays: 14,
    lightNeeds: "Low - bright",
    lastWateredDate: "2026-07-14",
  },
  {
    id: "basil-buddy",
    name: "Basil Buddy",
    species: "Sweet Basil",
    wateringFrequencyDays: 2,
    lightNeeds: "Full sun",
    lastWateredDate: "2026-07-20",
  },
  {
    id: "momo",
    name: "Momo",
    species: "Monstera Deliciosa",
    wateringFrequencyDays: 7,
    lightNeeds: "Bright indirect",
    lastWateredDate: "2026-07-16",
  },
  {
    id: "sunny",
    name: "Sunny",
    species: "Marigold",
    wateringFrequencyDays: 4,
    lightNeeds: "Full sun",
    lastWateredDate: "2026-07-11",
  },
];
