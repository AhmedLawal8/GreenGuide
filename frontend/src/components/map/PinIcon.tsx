import type { SVGProps } from "react";

// Classic map-pin/teardrop shape, tip at the bottom center — used both as a
// button icon (currentColor) and, rendered to a data URI, as the map cursor.
export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z"
        fill="currentColor"
      />
      <circle cx="12" cy="9" r="3.5" fill="white" />
    </svg>
  );
}
