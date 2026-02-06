import { Model, DataTypes } from 'sequelize';

class Usuario extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      senha: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documento: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      tipo_usuario: {
        type: DataTypes.ENUM('ADMIN', 'BIBLIOTECARIO', 'ALUNO'),
        defaultValue: 'ALUNO',
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: 'usuarios',
      underscored: true,
    });

    return this;
  }

  static associate(models) {
    // Relacionamento com as movimentações que o usuário (aluno) realizou
    this.hasMany(models.Movimentacao, { foreignKey: 'usuario_id', as: 'minhas_movimentacoes' });
    // Relacionamento com as movimentações que o usuário (bibliotecário) processou
    this.hasMany(models.Movimentacao, { foreignKey: 'bibliotecario_id', as: 'operacoes_realizadas' });
  }
}

export default Usuario;