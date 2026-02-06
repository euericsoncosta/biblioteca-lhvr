'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/** * Seeder para importar o acervo a partir de um ficheiro TXT 
 * Correção: Ignora aspas para evitar erro 'Invalid Closing Quote'
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const txtPath = path.resolve(__dirname, '..', 'seeders', 'data', 'Acervo_LHVR.txt');

    if (!fs.existsSync(txtPath)) {
      console.log('⚠️ Ficheiro TXT não encontrado em: ' + txtPath);
      return;
    }

    try {
      const fileContent = fs.readFileSync(txtPath, 'utf8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: '\t',         // Separador de Tabulação (Excel)
        quote: null,             // CRUCIAL: Diz ao parser para ignorar aspas (") como delimitadores
        relax_column_count: true,
        bom: true
      });

      // Mapeamento dos campos
      const livrosParaInserir = records.map(row => ({
        nome: row.Nome || 'Sem Título',
        autor: row.Autor || 'Autor Desconhecido',
        tombo: row.Tombo,
        ano: parseInt(row.Ano) || null,
        editora: row.Editora || 'Não informada',
        categoria: 'Geral',
        status: 'disponivel',
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Limpeza da tabela antes da nova tentativa
      await queryInterface.bulkDelete('livros', null, {});

      const chunkSize = 500;
      for (let i = 0; i < livrosParaInserir.length; i += chunkSize) {
        const chunk = livrosParaInserir.slice(i, i + chunkSize);
        await queryInterface.bulkInsert('livros', chunk);
        console.log(`✅ Sucesso: ${Math.min(i + chunkSize, livrosParaInserir.length)} de ${livrosParaInserir.length} livros importados.`);
      }

    } catch (error) {
      console.error('❌ Erro ao processar o ficheiro TXT:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('livros', null, {});
  }
};