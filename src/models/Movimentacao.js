import { Model, DataTypes } from 'sequelize';

class Movimentacao extends Model {
  static init(sequelize) {
    super.init({
      data_saida: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      data_devolucao_prevista: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      data_devolucao_real: {
        type: DataTypes.DATE,
      },
      tipo: {
        type: DataTypes.ENUM('EMPRESTIMO', 'RESERVA'),
        allowNull: false,
      },
      status_movimentacao: {
        type: DataTypes.STRING,
        defaultValue: 'ativo',
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
      tableName: 'movimentacoes',
      underscored: true,
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Livro, { foreignKey: 'livro_id', as: 'livro' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'aluno' });
    this.belongsTo(models.Usuario, { foreignKey: 'bibliotecario_id', as: 'bibliotecario' });
  }
}

export default Movimentacao;