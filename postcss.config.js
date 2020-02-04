module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          '@fullhuman/postcss-purgecss': {
            content: ['./pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
            defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
            whitelist: ['w-10', 'w-24', 'h-10', 'h-24'],
          },
        }
      : {}),
    'postcss-preset-env': { stage: 2 },
  },
};
