import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 22" />
      <path d="M18.4 15.6C19.9 14.7 21 13 21 11C21 8.2 18.8 6 16 6C14.1 6 12.6 7.1 12 8.5" />
      <path d="M5.6 8.4C4.1 9.3 3 11 3 13C3 15.8 5.2 18 8 18C9.9 18 11.4 16.9 12 15.5" />
      <path d="M7 4h10" />
    </svg>
  ),
};
