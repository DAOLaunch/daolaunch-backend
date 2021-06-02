let Token;
const s = (builder, Sequelize) => {
  Token = builder.define('token', {
    token_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    wallet_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'wallets',
        key: 'wallet_id'
      }
    },
    network_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'networks',
        key: 'network_id'
      }
    },
    token_symbol: {
      type: Sequelize.STRING
    },
    token_supply: {
      type: Sequelize.STRING
    },
    token_decimal_place: {
      type: Sequelize.STRING
    },
    token_name: {
      type: Sequelize.STRING
    },
    token_contract_address: {
      type: Sequelize.STRING
    },
    token_transaction_status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    token_transaction_hash: {
      type: Sequelize.STRING
    },
    uniswap_list: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
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

  Token.associate = (models) => {
    Token.belongsTo(models.token, { as: 'token', foreignKey: 'token_id' });
  };
  return Token;
};

const TRANSACTION_STATUS = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED'
}

export { Token, s, TRANSACTION_STATUS };
