import React, { HTMLAttributes } from 'react';

export default function Facebook(props: HTMLAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      style={{ fill: 'rgb(81, 83, 96)', width: '2rem', height: '2rem' }}
      {...props}
    >
      <g>
        <circle cx="32" cy="32" r="32" style={{ fill: 'rgb(251, 239, 126)' }}></circle>
      </g>
      <g>
        <path d="M34.1,47V33.3h4.6l0.7-5.3h-5.3v-3.4c0-1.5,0.4-2.6,2.6-2.6l2.8,0v-4.8c-0.5-0.1-2.2-0.2-4.1-0.2 c-4.1,0-6.9,2.5-6.9,7V28H24v5.3h4.6V47H34.1z"></path>
      </g>
    </svg>
  );
}
