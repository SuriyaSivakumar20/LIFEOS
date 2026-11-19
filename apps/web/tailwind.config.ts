import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary, #242321)',
          secondary: 'var(--bg-secondary, #302E2A)',
          elevated: 'var(--bg-elevated, #3A3833)',
        },
        accent: {
          primary: 'var(--accent-primary, #F28C28)',
          hover: 'var(--accent-hover, #E07B18)',
          muted: 'var(--accent-muted, rgba(242, 140, 40, 0.15))',
        },
        content: {
          primary: 'var(--text-primary, #F4F1EB)',
          secondary: 'var(--text-secondary, #A8A39A)',
          muted: 'var(--text-muted, #7D776E)',
        },
        boundary: {
          DEFAULT: 'var(--border-color, #45413B)',
          light: 'var(--border-light, #57524A)',
        },
        status: {
          success: 'var(--status-success, #62B68A)',
          warning: 'var(--status-warning, #E6AD54)',
          error: 'var(--status-error, #D86B63)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
