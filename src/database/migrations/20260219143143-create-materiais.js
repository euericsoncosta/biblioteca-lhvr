'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('materiais', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      disciplina: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ano_escolar: {
        type: Sequelize.ENUM('1', '2', '3'),
        allowNull: false
      },
      // NOVO CAMPO: Bimestre
      bimestre: {
        type: Sequelize.ENUM('1', '2', '3', '4'),
        allowNull: false,
        defaultValue: '1'
      },
      link_recurso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      professor_id: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ano_referencia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear()
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
    await queryInterface.dropTable('materiais');
  }
};