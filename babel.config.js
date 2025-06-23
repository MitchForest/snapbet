module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/services': './services',
            '@/stores': './stores',
            '@/hooks': './hooks',
            '@/utils': './utils',
            '@/types': './types',
            '@/theme': './theme',
          },
        },
      ],
      [
        '@tamagui/babel-plugin',
        {
          config: './theme/index.ts',
          components: ['@tamagui/core'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
