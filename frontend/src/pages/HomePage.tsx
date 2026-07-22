import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Grid, Heading, Text } from "@radix-ui/themes";
import {
  BookmarkIcon,
  CheckCircledIcon,
  LayersIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { TopNavbar } from "../components/layout/TopNavbar";
import { RecommendationCard } from "../components/recommendations/RecommendationCard";
import { PinIcon } from "../components/map/PinIcon";
import { SunIcon } from "../components/plant-results/SunIcon";
import type { RecommendedPlant } from "../types/recommendation";
import gardenHero from "../images/garden.jpg";
import gardenAbout from "../images/garden2.jpg";
import coneflowerImage from "../images/plants.png";
import serviceberryImage from "../images/plantpot.webp";
import blackEyedSusanImage from "../images/plantplot2.webp";

const PREVIEW_PLANTS: RecommendedPlant[] = [
  {
    id: -1,
    common_name: "Purple Coneflower",
    scientific_name: "Echinacea purpurea",
    plant_type: "Forb/Herb",
    image_url: coneflowerImage,
    score: 92,
    hardiness_zone: "3a",
    sun_requirement: "Full Sun",
    water_requirement: "Low",
    drought_tolerance: "High",
    duration: "Perennial",
    soil_ph_min: 5.5,
    soil_ph_max: 7.0,
    growth_rate: "Moderate",
    height_at_20_years_maximum_feet: "3",
    life_span: "Moderate",
    fertility_requirement: "Low",
    bloom_period: "Summer",
    match_reasons: [],
    ai_summary: null,
  },
  {
    id: -2,
    common_name: "Serviceberry",
    scientific_name: "Amelanchier canadensis",
    plant_type: "Tree",
    image_url: serviceberryImage,
    score: 88,
    hardiness_zone: "4a",
    sun_requirement: "Partial Shade",
    water_requirement: "Medium",
    drought_tolerance: "Medium",
    duration: "Perennial",
    soil_ph_min: 5.0,
    soil_ph_max: 6.5,
    growth_rate: "Moderate",
    height_at_20_years_maximum_feet: "20",
    life_span: "Long",
    fertility_requirement: "Medium",
    bloom_period: "Spring",
    match_reasons: [],
    ai_summary: null,
  },
  {
    id: -3,
    common_name: "Black-Eyed Susan",
    scientific_name: "Rudbeckia hirta",
    plant_type: "Forb/Herb",
    image_url: blackEyedSusanImage,
    score: 81,
    hardiness_zone: "3a",
    sun_requirement: "Full Sun",
    water_requirement: "Medium",
    drought_tolerance: "Medium",
    duration: "Annual",
    soil_ph_min: 6.0,
    soil_ph_max: 7.5,
    growth_rate: "Rapid",
    height_at_20_years_maximum_feet: "3",
    life_span: "Short",
    fertility_requirement: "Low",
    bloom_period: "Summer",
    match_reasons: [],
    ai_summary: null,
  },
];

function HowItWorksStep({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Box className="how-it-works-step">
      <div className="how-it-works-icon">{icon}</div>
      <Heading size="5" mb="1">
        {title}
      </Heading>
      <Text size="4" color="gray">
        {children}
      </Text>
    </Box>
  );
}

function FeatureCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Box className="feature-card">
      <div className="feature-card-icon">{icon}</div>
      <Heading size="3" mb="1">
        {title}
      </Heading>
      <Text size="3" color="gray">
        {children}
      </Text>
    </Box>
  );
}

export function HomePage() {
  return (
    <Box className="marketing-page">
      <TopNavbar />

      <section className="hero" style={{ backgroundImage: `url(${gardenHero})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <Text as="div" size="3" weight="bold" className="hero-eyebrow">
            Backed by real USDA soil &amp; climate data
          </Text>
          <Heading as="h1" className="hero-title">
            Know your yard.
            <br />
            Grow with confidence.
          </Heading>
          <Text as="p" size="5" className="hero-subtitle">
            GreenGuide reads your exact soil, hardiness zone, and 30 years of climate data to find
            plants proven to thrive right where you live.
          </Text>
          <div className="hero-actions">
            <Button size="4" asChild>
              <Link to="/explore">Find Plants</Link>
            </Button>
            <a href="#how-it-works" className="hero-secondary-link">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="section-header">
          <Text size="5" weight="bold" color="green" className="section-eyebrow">
            How it works
          </Text>
          <Heading size="7" mb="2">
            From address to planting list in under a minute
          </Heading>
        </div>

        <Grid columns={{ initial: "1", md: "3" }} gap="6" className="how-it-works-grid">
          <HowItWorksStep icon={<PinIcon width="24" height="24" />} title="Tell us your spot">
            Search an address, share your GPS location, or click anywhere on the map to drop a pin.
          </HowItWorksStep>
          <HowItWorksStep icon={<LayersIcon width="24" height="24" />} title="We read the land">
            USDA soil surveys, 30-year climate normals, and a precise hardiness zone for your exact
            coordinates
          </HowItWorksStep>
          <HowItWorksStep icon={<CheckCircledIcon width="24" height="24" />} title="Get matched instantly">
            A ranked list of plants suited to your site, each with the specific reasons why it'll thrive
            there.
          </HowItWorksStep>
        </Grid>
      </section>

      <section id="about" className="section section-about">
        <Grid columns={{ initial: "1", md: "2" }} gap="7" align="center">
          <Box>
            <Text size="4" weight="bold" color="green" className="section-eyebrow">
              Why GreenGuide
            </Text>
            <Heading size="7" mb="3">
              Most planting advice is generic. Your yard isn't.
            </Heading>
            <Text as="p" size="3" color="gray" mb="3">
              A hardiness zone map tells you the zone for an entire region. It doesn't know that your soil
              is heavy clay, sits on a slope, or gets less rain than the next town over.
            </Text>
            <Text as="p" size="3" color="gray">
              Instead of making you research dozens of plants yourself, GreenGuide compares your conditions 
              against 2,000+ plant profiles and ranks the best matches for your location.
            </Text>
          </Box>
          <Box className="about-image-frame">
            <img src={gardenAbout} alt="A terraced garden with layered flower beds" loading="lazy" decoding="async" />
          </Box>
        </Grid>
      </section>

      <section className="section section-muted">
        <div className="section-header">
          <Text size="4" weight="bold" color="green" className="section-eyebrow">
            What you get
          </Text>
          <Heading size="7" mb="2">
            Every recommendation is backed by real data
          </Heading>
        </div>

        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4">
          <FeatureCard icon={<LayersIcon width="20" height="20" />} title="Real soil data">
            Soil texture, pH, and drainage pulled from the USDA Soil Survey for your exact plot.
          </FeatureCard>
          <FeatureCard icon={<SunIcon width="20" height="20" />} title="30-year climate normals">
            Average rainfall and temperatures at specified location
          </FeatureCard>
          <FeatureCard icon={<TargetIcon width="20" height="20" />} title="Precise hardiness zone">
            Calculated for your coordinates, not the centroid of your zip code.
          </FeatureCard>
          <FeatureCard icon={<BookmarkIcon width="20" height="20" />} title="Save your favorites">
            Bookmark plants you like and come back to your list anytime.
          </FeatureCard>
        </Grid>
      </section>

      <section className="section">
        <div className="section-header">
          <Text size="4" weight="bold" color="green" className="section-eyebrow">
            See it in action
          </Text>
          <Heading size="7" mb="2">
            Real plant cards, straight from the app
          </Heading>
          <Text size="3" color="gray">
            Below is a sample of what shows up when GreenGuide matches your yard — sign in and share a
            location to get your own.
          </Text>
        </div>

        <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
          {PREVIEW_PLANTS.map((plant) => (
            <RecommendationCard key={plant.id} plant={plant} interactive={false} />
          ))}
        </Grid>
      </section>

      <section className="cta-band">
        <Heading size="7" mb="3">
          Ready to see what grows best at your address?
        </Heading>
        <Button size="4" variant="solid" className="cta-band-button" asChild>
          <Link to="/explore">Get Started Free</Link>
        </Button>
      </section>
    </Box>
  );
}
