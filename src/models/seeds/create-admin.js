const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  up: async (queryInterface) => {
    const admin = await queryInterface.sequelize.query(`SELECT * FROM users`);
    if (admin && admin[0]) {
      const validRecords = admin[0].filter(u => (u.email === process.env.LCL_ADMIN_EMAIL));
      if (!validRecords.length) {
        const salt = bcrypt.genSaltSync(+process.env.LCL_SALT_ROUNDS);
        const password = bcrypt.hashSync(process.env.LCL_ADMIN_PASS, salt);
        return queryInterface.bulkInsert('users', [{
          email: process.env.LCL_ADMIN_EMAIL,
          password,
          active: true
        }], {});
      }
    }
    return new Promise(resolve => resolve());
  },

  down: (queryInterface) => {

  }
};
