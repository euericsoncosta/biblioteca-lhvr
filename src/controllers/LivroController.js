import Livro from '../models/Livro.js';
import { Op, literal } from 'sequelize';

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

  // Página de criação com Sugestão de Próximo Tombo
  async create(req, res) {
    const { tipo_usuario } = req.session.user;
    if (tipo_usuario !== 'ADMIN' && tipo_usuario !== 'BIBLIOTECARIO') {
      req.flash('error', 'Acesso negado.');
      return res.redirect('/livros');
    }

    try {
      // Busca o último livro inserido ordenando pelo tombo numericamente
      const ultimoLivro = await Livro.findOne({
        order: [[literal('CAST(tombo AS UNSIGNED)'), 'DESC']]
      });

      // Se existir um livro, soma 1. Se não, começa do 1.
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