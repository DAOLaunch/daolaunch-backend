let Network;
const s = (builder, Sequelize) => {
  Network = builder.define('network', {
    network_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    network_name: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    }
  }, {
    timestamps: false
  });

  Network.associate = (models) => {
  };
  return Network;
};

const NETWORK_TYPE = {
  MAINS: [1, 56],
  TESTS: [3, 4, 5, 42, 97],
}

export { Network, s, NETWORK_TYPE };
