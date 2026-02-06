'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona a coluna 'curso' que estava em falta na tabela 'usuarios'
    await queryInterface.addColumn('usuarios', 'curso', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'documento' // Tenta colocar após o campo documento
    });
  },

  async down(queryInterface, Sequelize) {
    // Permite reverter a alteração
    await queryInterface.removeColumn('usuarios', 'curso');
  }
};