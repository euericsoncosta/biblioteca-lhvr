import Livro from '../models/Livro.js';
import { Op, literal } from 'sequelize';
import ExcelJS from 'exceljs'; // Importação necessária para o Excel

class LivroController {
  // Listagem de Livros com Ordenação por Tombo e Filtros
  async index(req, res) {
    try {
      const { nome, tombo } = req.query;
      const where = {};

      if (nome) {
        where.nome = { [Op.like]: `%${nome}%` };
      }

      if (tombo) {
        where.tombo = { [Op.like]: `%${tombo}%` };
      }

      const livros = await Livro.findAll({ 
        where,
        order: [[literal('CAST(tombo AS UNSIGNED)'), 'ASC']] 
      });

      return res.render('livros/index', { 
        livros: livros.map(l => l.toJSON()),
        filtros: { nome, tombo }
      });
    } catch (e) {
      console.error(e);
      return res.status(500).render('error', { message: "Erro ao carregar o acervo." });
    }
  }

  // NOVO MÉTODO: Exportar Acervo Completo para Excel
  async exportarLivros(req, res) {
    try {
      // Busca todos os livros ordenados por tombo
      const livros = await Livro.findAll({
        order: [[literal('CAST(tombo AS UNSIGNED)'), 'ASC']]
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Acervo Completo');

      // Configuração das colunas do Excel
      worksheet.columns = [
        { header: 'Tombo', key: 'tombo', width: 10 },
        { header: 'Título', key: 'nome', width: 40 },
        { header: 'Autor', key: 'autor', width: 30 },
        { header: 'Ano', key: 'ano', width: 10 },
        { header: 'Editora', key: 'editora', width: 25 },
        { header: 'Categoria', key: 'categoria', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilização do cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E7FF' } // Cor indigo suave
      };

      // Adiciona os dados dos livros à tabela
      livros.forEach(livro => {
        worksheet.addRow({
          tombo: livro.tombo,
          nome: livro.nome,
          autor: livro.autor,
          ano: livro.ano,
          editora: livro.editora,
          categoria: livro.categoria,
          status: livro.status.toUpperCase()
        });
      });

      // Configura os headers para o download do navegador
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Acervo_Biblioteca_LHVR_${timestamp}.xlsx`);

      await workbook.xlsx.write(res);
      return res.end();

    } catch (error) {
      console.error("Erro na exportação do acervo:", error);
      return res.status(500).send("Erro ao gerar o ficheiro Excel.");
    }
  }

  // Página de criação com Sugestão de Próximo Tombo
  async create(req, res) {
    const { tipo_usuario } = req.session.user;
    if (tipo_usuario !== 'ADMIN' && tipo_usuario !== 'BIBLIOTECARIO') {
      req.flash('error', 'Acesso negado.');
      return res.redirect('/livros');
    }

    try {
      const ultimoLivro = await Livro.findOne({
        order: [[literal('CAST(tombo AS UNSIGNED)'), 'DESC']]
      });

      const proximoTombo = ultimoLivro ? parseInt(ultimoLivro.tombo) + 1 : 1;
      return res.render('livros/create', { proximoTombo });
    } catch (e) {
      return res.render('livros/create', { proximoTombo: '' });
    }
  }

  // Gravar no banco de dados
  async store(req, res) {
    try {
      await Livro.create(req.body);
      req.flash('success', 'Livro catalogado com sucesso!');
      return res.redirect('/livros');
    } catch (e) {
      return res.render('livros/create', { 
        livro: req.body, 
        errors: e.errors?.map(err => err.message) || ['Erro ao salvar livro']
      });
    }
  }

  // Página de edição
  async edit(req, res) {
    try {
      const libro = await Livro.findByPk(req.params.id);
      if (!libro) return res.redirect('/livros');
      return res.render('livros/edit', { libro: libro.toJSON() });
    } catch (e) {
      return res.redirect('/livros');
    }
  }

  // Atualizar dados do livro
  async update(req, res) {
    try {
      const libro = await Livro.findByPk(req.params.id);
      if (!libro) return res.redirect('/livros');
      await libro.update(req.body);
      req.flash('success', 'Dados atualizados!');
      return res.redirect('/livros');
    } catch (e) {
      return res.render('livros/edit', { 
        libro: { ...req.body, id: req.params.id }, 
        errors: e.errors?.map(err => err.message) || ['Erro ao atualizar']
      });
    }
  }

  // Eliminar livro
  async delete(req, res) {
    try {
      const libro = await Livro.findByPk(req.params.id);
      if (libro) await libro.destroy();
      req.flash('success', 'Livro removido.');
      return res.redirect('/livros');
    } catch (e) {
      req.flash('error', 'Erro ao remover livro.');
      return res.redirect('/livros');
    }
  }
}

export default new LivroController();