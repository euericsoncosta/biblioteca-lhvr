import Material from '../models/Material.js';
import Usuario from '../models/Usuario.js';
import { Op } from 'sequelize';

class MaterialController {
  async index(req, res) {
    try {
      const { disciplina, ano_escolar, bimestre, ano_referencia } = req.query;
      const where = {};

      if (disciplina) where.disciplina = disciplina;
      if (ano_escolar) where.ano_escolar = ano_escolar;
      if (bimestre) where.bimestre = bimestre; // Filtro por Bimestre
      if (ano_referencia) where.ano_referencia = ano_referencia;

      const materiais = await Material.findAll({
        where,
        include: [{ model: Usuario, as: 'professor', attributes: ['nome'] }],
        order: [['created_at', 'DESC']]
      });

      return res.render('materiais/index', { 
        materiais: materiais.map(m => m.toJSON()),
        filtros: { disciplina, ano_escolar, bimestre, ano_referencia }
      });
    } catch (e) {
      return res.status(500).render('error', { message: "Erro ao carregar materiais." });
    }
  }

  async create(req, res) {
    try {
      const professores = await Usuario.findAll({
        where: { tipo_usuario: { [Op.ne]: 'ALUNO' } },
        order: [['nome', 'ASC']]
      });

      return res.render('materiais/create', { 
        professores: professores.map(p => p.toJSON()) 
      });
    } catch (e) {
      return res.redirect('/materiais');
    }
  }

  async store(req, res) {
    try {
      const { titulo, descricao, disciplina, ano_escolar, bimestre, link_recurso, professor_id, ano_referencia } = req.body;
      
      await Material.create({
        titulo,
        descricao,
        disciplina,
        ano_escolar,
        bimestre, // Salva o bimestre
        link_recurso,
        professor_id,
        ano_referencia: ano_referencia || new Date().getFullYear()
      });

      req.flash('success', 'Conteúdo publicado com sucesso!');
      return res.redirect('/materiais');
    } catch (e) {
      req.flash('error', 'Erro ao publicar material.');
      return res.redirect('/materiais/novo');
    }
  }

  async delete(req, res) {
    try {
      const material = await Material.findByPk(req.params.id);
      if (material) await material.destroy();
      req.flash('success', 'Material removido.');
      return res.redirect('/materiais');
    } catch (e) {
      return res.redirect('/materiais');
    }
  }
}

export default new MaterialController();