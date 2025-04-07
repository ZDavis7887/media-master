/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
          pixel: ['"Press Start 2P"', 'monospace']
        },
        colors: {
          orange: '#ff8800'
        }
      },
    },
    plugins: [],
  }
  
  module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        fontFamily: {
          pixel: ['"Press Start 2P"', 'monospace'], // Google Fonts
        },
        colors: {
          neon: '#00ffff',
          orange: '#ff7700',
          darkbg: '#1c1c1c',
        },
        borderRadius: {
          screen: '2rem',
        },
      },
    },
    plugins: [],
  };