let Transaction;
const s = (builder, Sequelize) => {
  Transaction = builder.define('transaction', {
    transaction_id: {
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
    project_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'projects',
        key: 'project_id'
      }
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

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.project, { as: 'project', foreignKey: 'project_id' });
  };
  return Transaction;
};

export { Transaction, s };
