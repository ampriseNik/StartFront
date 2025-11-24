const path = require('path');

module.exports = {
  paths: {
    /* Path to source files directory */
    source: path.resolve(__dirname, '../src/'),

    /* Path to built files directory */
    output: path.resolve(__dirname, '../dist/'),

    /* Path to product files directory */
    product: path.resolve(__dirname, '../prod/'),

    /* Path to product wp files directory */
    wp: path.resolve(__dirname, '../wp/'),
  },
  server: {
    host: '0.0.0.0',
    port: 8000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  limits: {
    /* Image files size in bytes. Below this value the image file will be served as DataURL (inline base64). */
    images: 0,

    /* Font files size in bytes. Below this value the font file will be served as DataURL (inline base64). */
    fonts: 0,
  },
};
