module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          allowBase: false,
          allowHub: false,
          allowMethods: false,
          allowParts: false,
          allowStubs: false,
          allowRepeaterSiblings: true,
        },
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
