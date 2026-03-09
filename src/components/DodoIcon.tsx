import React from 'react';

interface DodoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

const DodoIcon: React.FC<DodoIconProps> = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Body Outline */}
      <path
        d="M32.6 20.99s2.14 2.89 1.94 5.53c-.13 1.7 0 4.31-8.22 7.7c-9.96 4.11-14.95 8.54-14.88 16.34c.1 10.95 6.68 16.59 9.6 18.77s1.45 8.31 8.92 15.56c10.7 10.39 16.65 9.05 22.19 11.52c2.09.93 2.36.98 4.89 4.52c1.95 2.73 6.24 7.08 12.11 7.08c7.55 0 8.7-6.36 11.65-7.74s24.08-3.17 26.48-20.66c1.88-13.7-13.48-35.13-38.45-40.65c-11.21-2.48-18.35.69-22.16 1.64c-.92.23-3.19 1.16-3.19 1.16c-.71-1.85 2.54-3.61 4.87-5.73c2.68-2.44 5.72-5.08 7.19-7.69C62.97 15.07 51.94.93 38.7 4.59c-4.72 1.3-6.1 16.4-6.1 16.4z"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Beak Outline */}
      <path
        d="M91.63 50.13s-1.61-6.25 3.05-9.16c3.37-2.12 7.08-1.82 9.48.63c1.27-1.09 2.63-2.18 4.25-2.59c4.57-1.18 9.42 0 11.71 4.32c3.11 5.86.39 8.93-3.35 12.49c0 0 4.51 2.03 4.68 9.28c.15 6.42-2.22 13.06-11.37 15.65c-3.56 1.01-13.92 1.72-17.87-5.73c-1.9-3.59-.26-5.72.55-6.74c2.75-3.47 7.14-1.68 7.14-1.68c.38-10.28-8.27-16.47-8.27-16.47z"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Feet */}
      <path
        d="M63.01 99.87s-3.81 9.69-5.89 13.34c-1.64 2.88-8.27 3.66-12.32 4.7c-3.52.9-8.08.88-8.52 2.86c-.44 1.99 1.06 3.04 4.62 3.17c3.57.13 29.37 0 31.18 0c1.81 0 3.12-2.31-.6-4.86c-3.27-2.24-4.53-2.43-3.21-5.33c1.32-2.91 7.45-12.4 7.45-12.4l-12.71-1.48z"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DodoIcon;
