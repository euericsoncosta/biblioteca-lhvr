import { Model, DataTypes } from 'sequelize';

class Livro extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      autor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tombo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ano: {
        type: DataTypes.INTEGER,
      },
      editora: {
        type: DataTypes.STRING,
      },
      categoria: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM('disponivel', 'emprestado', 'reservado', 'manutencao'),
        defaultValue: 'disponivel',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE 
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }, {
      sequelize,
      tableName: 'livros',
      underscored: true,
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Movimentacao, { foreignKey: 'livro_id', as: 'movimentacoes' });
  }
}

export default Livro;