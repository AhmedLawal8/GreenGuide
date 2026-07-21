export type LocationProfile = {
  lat: number;
  lon: number;
  hardiness_zone: string | null;
  annual_precip_inches: number | null;
  annual_mean_temp_f: number | null;
  soil_name: string | null;
  soil_ph: number | null;
  soil_texture: string | null;
  drainage: string | null;
  soil_moisture_index: number | null;
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
