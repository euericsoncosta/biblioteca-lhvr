'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('movimentacoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      livro_id: {
        type: Sequelize.INTEGER,
        references: { model: 'livros', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Aluno que reservou ou pegou emprestado'
      },
      bibliotecario_id: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Funcionário que realizou a operação'
      },
      data_saida: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      data_devolucao_prevista: {
        type: Sequelize.DATE,
        allowNull: false
      },
      data_devolucao_real: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('EMPRESTIMO', 'RESERVA'),
        allowNull: false
      },
      status_movimentacao: {
        type: Sequelize.STRING(20),
        defaultValue: 'ativo'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('movimentacoes');
  }
};