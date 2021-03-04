/* indent size: 1 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('user_accounts', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
    },
    account: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_main: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1',
    },
  }, {
    tableName: 'user_accounts',
    timestamps: false,
  });

  Model.associate = function() {

  };

  return Model;
};
