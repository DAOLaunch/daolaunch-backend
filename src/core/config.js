export const config = {

  //-- see express-session for more options
  session: {
    enabled: false,
    settings: {
      secret: 'replace this for a more secure secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    }
  },

  //-- see socket.io for more options
  socketIO: {
    enabled: false,
    settings: {
      jwt: {
        enabled: false,
        settings: {}
      },
      options: {}
    }
  },

  static: {
    enabled: true,
    settings: [
      { mount: '/apidoc', root: 'doc/apidoc', options: {} },
      { mount: '/socketdoc', root: 'doc/socketdoc', options: {} },
      { mount: '/hookdoc', root: 'doc/hookdoc', options: {} },
      { mount: '/public', root: 'public', options: {} }
    ]
  },

  //-- see express-fileupload for more settings, file upload enable FormData parsing
  fileUpload: {
    enabled: true,
    settings: {
      limits: {
        files: 10, //-- maximum number of files
        fileSize: 50 * 1024 * 1024, //-- max file size in byte
      }
    }
  },

  //-- see npm body-parser for more settings
  bodyParser: {
    enabled: true,
    settings: {
      json: { enabled: true, settings: { limit: '2mb' }, },
      urlencoded: { enabled: true, settings: { extended: false, limit: '2mb' } }
    }
  },

  CORS: {
    enabled: true,
    settings: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      "Access-Control-Expose-Headers": "Content-Disposition",
      "Access-Control-Allow-Methods": "*"
    }
  },

};
