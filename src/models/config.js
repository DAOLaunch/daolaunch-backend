module.exports = {
  LCL: {
    username: process.env['LCL_MYSQL_USER'] || 'root',
    password: process.env['LCL_MYSQL_PASS'] || 'nhathoang',
    database: process.env['LCL_MYSQL_DB'] || 'ibo',
    host: process.env['LCL_MYSQL_HOST'] || 'localhost',
    logging: false,
    dialect: 'mysql'
  },
  DEV: {
    username: process.env['DEV_MYSQL_USER'],
    password: process.env['DEV_MYSQL_PASS'],
    database: process.env['DEV_MYSQL_DB'],
    host: process.env['DEV_MYSQL_HOST'],
    logging: false,
    dialect: 'mysql'
  },
  STG: {
    username: process.env['STG_MYSQL_USER'],
    password: process.env['STG_MYSQL_PASS'],
    database: process.env['STG_MYSQL_DB'],
    host: process.env['STG_MYSQL_HOST'],
    logging: false,
    dialect: 'mysql'
  },
  PRO: {
    username: process.env['PRO_MYSQL_USER'],
    password: process.env['PRO_MYSQL_PASS'],
    database: process.env['PRO_MYSQL_DB'],
    host: process.env['PRO_MYSQL_HOST'],
    logging: false,
    dialect: 'mysql'
  }
};
