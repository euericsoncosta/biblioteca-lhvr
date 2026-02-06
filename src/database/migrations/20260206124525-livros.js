'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('livros', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      autor: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      tombo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      ano: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      editora: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      categoria: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('disponivel', 'emprestado', 'reservado', 'manutencao'),
        defaultValue: 'disponivel'
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
    await queryInterface.dropTable('livros');
  }
};