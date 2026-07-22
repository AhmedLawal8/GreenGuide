import type { SVGProps } from "react";

export function RaindropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.5 1.5C7.5 1.5 3 6.6 3 9.6C3 11.9 5 13.75 7.5 13.75C10 13.75 12 11.9 12 9.6C12 6.6 7.5 1.5 7.5 1.5Z"
        fill="currentColor"
      />
      <path
        d="M5.6 9.9C5.6 11 6.4 11.8 7.4 11.9"
        stroke="var(--color-background)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
