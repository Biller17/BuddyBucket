module.exports = function (api) {
  api.cache(true);

  // This device's Expo Go Hermes cannot PARSE private class fields/methods
  // (`#x`), which React Native and Expo core use in their web-API classes.
  // We transpile that syntax away — but ONLY inside react-native and expo.
  //
  // Applying a class-field transform globally corrupts other packages:
  //  - spec mode turns react-native-paper's class fields into
  //    Object.defineProperty calls that crash on React 19's frozen props
  //    ("property is not configurable"), and
  //  - loose mode then breaks RN's own Event class, whose NONE/CAPTURING_PHASE
  //    constants are read-only ("cannot assign to read-only property 'NONE'").
  //
  // Scoping keeps every other package (paper, vector-icons, app code, ...) in
  // its original, already-correct form. Spec mode (the default here) is
  // required so RN's Event fields use define semantics. Flow types are stripped
  // first so the field transform never sees Flow-only annotations.
  const privateSyntaxPlugins = [
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-private-property-in-object',
    '@babel/plugin-transform-class-properties',
  ];

  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    overrides: [
      {
        test: /[\\/]node_modules[\\/](react-native|expo)[\\/]/,
        plugins: privateSyntaxPlugins,
      },
    ],
  };
};
