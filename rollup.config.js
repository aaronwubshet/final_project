import url from 'rollup-plugin-url';

export default {
  // ...
  plugins: [
    url({
      limit: 0, // All files will be copied to the 'public' folder
    }),
    // ...
  ],
  // ...
};