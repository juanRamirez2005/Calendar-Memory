module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@app': './src/app',
        '@features': './src/features',
        '@shared': './src/shared',
        '@core': './src/core',
        '@theme': './src/theme',
        '@assets': './src/assets',
      },
    }],
  ],
};
