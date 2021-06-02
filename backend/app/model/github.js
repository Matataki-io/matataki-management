/* indent size: 1 */

module.exports = app => {
	const DataTypes = app.Sequelize;

	const Model = app.model.define('github', {
        id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
        uid: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false
		},
        access_token: {
			type: DataTypes.STRING(255),
			allowNull: false
        },
        article_repo: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 'matataki-save'
        },
        site_status: {
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: 0
        }
    }, {
		tableName: 'github',
		timestamps: false
	});

	Model.associate = function() {

	}

	return Model;
};