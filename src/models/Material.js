import { Model, DataTypes } from 'sequelize';

class Material extends Model {
  static init(sequelize) {
    super.init({
      titulo: DataTypes.STRING,
      descricao: DataTypes.TEXT,
      disciplina: DataTypes.STRING,
      ano_escolar: DataTypes.ENUM('1', '2', '3'),
      bimestre: DataTypes.ENUM('1', '2', '3', '4'), // Adicionado Bimestre
      link_recurso: DataTypes.STRING,
      ano_referencia: DataTypes.INTEGER,
    }, {
      sequelize,
      tableName: 'materiais',
      underscored: true,
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'professor_id', as: 'professor' });
  }
}

export default Material;