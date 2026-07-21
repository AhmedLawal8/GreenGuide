const PLACEHOLDER_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <rect width='200' height='200' fill='#ffffff'/>
  <g transform='translate(52,44) scale(6.5)'>
    <path d='M7.5 1.75C7.5 1.75 2.25 3.4 2.25 8.1C2.25 10.9 4.6 13 7.5 13C10.4 13 12.75 10.9 12.75 8.1C12.75 3.4 7.5 1.75 7.5 1.75Z' fill='#3d5212'/>
  </g>
</svg>
`.trim();

export const PLANT_IMAGE_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;
