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
      // ADICIONADO: O campo curso deve estar aqui para o Sequelize reconhecê-lo
      curso: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_usuario: {
        type: DataTypes.ENUM('ADMIN', 'BIBLIOTECARIO', 'ALUNO'),
        defaultValue: 'ALUNO',
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    }, {
      sequelize,
      tableName: 'usuarios',
      underscored: true, // Garante que created_at e updated_at funcionem com o banco
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Movimentacao, { foreignKey: 'usuario_id', as: 'minhas_movimentacoes' });
    this.hasMany(models.Movimentacao, { foreignKey: 'bibliotecario_id', as: 'operacoes_realizadas' });
  }
}

export default Usuario;