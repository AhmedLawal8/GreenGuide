import type { SVGProps } from "react";

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7.5" cy="7.5" r="3.25" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M7.5 0.75V2.25" />
        <path d="M7.5 12.75V14.25" />
        <path d="M0.75 7.5H2.25" />
        <path d="M12.75 7.5H14.25" />
        <path d="M2.6 2.6L3.65 3.65" />
        <path d="M11.35 11.35L12.4 12.4" />
        <path d="M2.6 12.4L3.65 11.35" />
        <path d="M11.35 3.65L12.4 2.6" />
      </g>
    </svg>
  );
}
