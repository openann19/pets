module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          // Align Node target with engines (>=22) for server-side transforms
          node: '22',
          browsers: ['>0.25%', 'not dead'],
        },
        modules: false,
        bugfixes: true,
        useBuiltIns: 'usage',
        corejs: '3.35',
        shippedProposals: true,
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: 'react',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { version: '7.23.7' }],
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-pipeline-operator',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-do-expressions',
    ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
  ],
  env: {
    production: {
      plugins: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger',
      ],
    },
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};
