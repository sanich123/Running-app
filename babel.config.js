module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo'], '@babel/preset-typescript'],
    plugins: ['react-native-worklets/plugin'],
    env: {
      production: {
        plugins: ['react-native-paper/babel', 'react-native-worklets/plugin'],
      },
    },
  };
};
