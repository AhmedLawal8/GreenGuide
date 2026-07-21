import type { SVGProps } from "react";

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.5 1.75C7.5 1.75 2.25 3.4 2.25 8.1C2.25 10.9 4.6 13 7.5 13C10.4 13 12.75 10.9 12.75 8.1C12.75 3.4 7.5 1.75 7.5 1.75Z"
        fill="currentColor"
      />
      <path d="M7.5 3V12" stroke="var(--color-background)" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}
