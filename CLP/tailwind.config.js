/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s linear infinite",
        sweep: "sweep 2.5s infinite",
        "sweep-slow": "sweep 3.5s infinite"
      },
      keyframes: {
        shimmer: {
          "0%": {
            backgroundPosition: "0% 0%"
          },
          "100%": {
            backgroundPosition: "-200% 0%"
          }
        },
        sweep: {
          "0%": {
            transform: "translateX(-100%) skewX(-15deg)"
          },
          "100%": {
            transform: "translateX(400%) skewX(-15deg)"
          }
        }
      }
    },
  },
  plugins: [],
}
