export type LocationProfile = {
  lat: number;
  lon: number;
  hardiness_zone: string | null;
  annual_precip_inches: number | null;
  annual_mean_temp_f: number | null;
  annual_min_temp_f: number | null;
  annual_max_temp_f: number | null;
  soil_name: string | null;
  soil_ph: number | null;
  soil_texture: string | null;
  drainage: string | null;
  soil_moisture_index: number | null;
  // Set client-side from reverse/forward geocoding — not part of the backend response.
  place_label?: string | null;
};

export type RecommendedPlant = {
  id: number;
  common_name: string | null;
  scientific_name: string;
  plant_type: string | null;
  image_url: string | null;
  score: number | null;
  hardiness_zone: string | null;
  sun_requirement: string | null;
  water_requirement: string | null;
  drought_tolerance: string | null;
  duration: string | null;
  soil_ph_min: number | null;
  soil_ph_max: number | null;
  growth_rate: string | null;
  height_at_20_years_maximum_feet: string | null;
  life_span: string | null;
  fertility_requirement: string | null;
  bloom_period: string | null;
  match_reasons: string[];
  ai_summary: string | null;
};

export type RecommendationsResponse = {
  location: LocationProfile;
  plants: RecommendedPlant[];
};

export type ExplainResponse = {
  plant_id: number;
  ai_summary: string;
};

export type PlantSearchResponse = {
  plants: RecommendedPlant[];
};

export type PlantDetail = {
  id: number;
  symbol: string | null;
  scientific_name: string;
  common_name: string | null;
  plant_type: string | null;
  duration: string | null;
  hardiness_zone: string | null;
  sun_requirement: string | null;
  water_requirement: string | null;
  soil_texture: string | null;
  soil_ph_min: number | null;
  soil_ph_max: number | null;
  drought_tolerance: string | null;
  image_url: string | null;
  growth_rate: string | null;
  height_at_20_years_maximum_feet: string | null;
  life_span: string | null;
  fertility_requirement: string | null;
  bloom_period: string | null;
};

export type SavedPlant = {
  id: number;
  plant_id: number;
  created_at: string | null;
  plant: PlantDetail | null;
};
