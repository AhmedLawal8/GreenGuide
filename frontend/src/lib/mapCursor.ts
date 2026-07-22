// A CSS `cursor` value can't use currentColor/CSS vars — it's a static image
// with no computed style context — so this mirrors PinIcon.tsx with hardcoded
// colors matching the app's marker color (#3d5212, see useMapbox.ts).
const PIN_CURSOR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'>" +
  "<path d='M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z' fill='#3d5212' stroke='white' stroke-width='1'/>" +
  "<circle cx='12' cy='9' r='3.5' fill='white'/>" +
  "</svg>";

// Hotspot (12, 23) lines the pin's tip up with the actual click point.
export const PIN_DROP_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(PIN_CURSOR_SVG)}") 12 23, crosshair`;
