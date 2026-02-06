'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, limpamos qualquer registro existente com este e-mail
    // Isso evita o erro de "Validation error" (duplicidade)
    await queryInterface.bulkDelete('usuarios', { email: 'admin@lhvr.pt' }, {});

    // Encriptamos a senha antes de guardar no banco de dados
    // Senha padrão: admin123
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Inserimos o utilizador administrador inicial na tabela 'usuarios'
    // Nota: O campo 'curso' foi removido para evitar erro de 'Unknown column', 
    // pois não consta na sua migration original.
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador LHVR',
      email: 'admin@lhvr.pt',
      senha: senhaHash,
      documento: '00000000',
      tipo_usuario: 'ADMIN',
      status: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Permite reverter o seeder removendo o admin pelo e-mail
    await queryInterface.bulkDelete('usuarios', { email: 'admin@lhvr.pt' }, {});
  }
};