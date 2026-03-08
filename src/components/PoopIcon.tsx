import { SVGProps } from 'react';

// Outline-style poop icon matching Lucide icon style
const PoopIcon = ({ className, style, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    {...props}
  >
    <path d="M12 3c-1 0-2.5 1-2.5 2.5 0 1 .5 1.5 1 2C8 8 6 9.5 6 12c0 1.5.5 2.5 1.5 3.5C6 16 4 17.5 4 20h16c0-2.5-2-4-3.5-4.5 1-.5 1.5-2 1.5-3.5 0-2.5-2-4-4.5-4.5.5-.5 1-1 1-2C14.5 4 13 3 12 3z" />
  </svg>
);

export default PoopIcon;
