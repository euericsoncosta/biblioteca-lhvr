import { Model, DataTypes } from 'sequelize';

class Permissao extends Model {
  static init(sequelize) {
    super.init({
      tipo_usuario: {
        type: DataTypes.ENUM('ADMIN', 'BIBLIOTECARIO', 'ALUNO'),
        allowNull: false,
      },
      pode_cadastrar_livro: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pode_emprestar: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pode_reservar: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pode_gerenciar_usuarios: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: 'permissoes',
      underscored: true,
    });

    return this;
  }

  static associate(models) {
    // Geralmente permissões são consultadas pelo tipo_usuario, 
    // mas você pode criar associações se houver uma tabela de cargos separada.
  }
}

export default Permissao;