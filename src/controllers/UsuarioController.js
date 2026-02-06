import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

class UsuarioController {
  // Lista todos os utilizadores (Alunos e Funcionários)
  async index(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome', 'email', 'documento', 'curso', 'tipo_usuario', 'status'],
        order: [['nome', 'ASC']]
      });
      return res.render('usuarios/index', { 
        usuarios: usuarios.map(u => u.toJSON()) 
      });
    } catch (e) {
      return res.status(500).send("Erro ao listar utilizadores.");
    }
  }

  // Página de criação (Restrito a ADMIN)
  async create(req, res) {
    if (req.session.user?.tipo_usuario !== 'ADMIN') {
      req.flash('error', 'Acesso negado. Apenas administradores podem criar utilizadores.');
      return res.redirect('/');
    }
    return res.render('usuarios/create');
  }

  // Grava o novo utilizador no banco de dados
  async store(req, res) {
    if (req.session.user?.tipo_usuario !== 'ADMIN') {
      return res.status(403).send('Não autorizado');
    }

    try {
      const { nome, email, senha, documento, curso, tipo_usuario } = req.body;
      
      // Encriptar a senha antes de guardar
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(senha, salt);

      await Usuario.create({
        nome,
        email,
        senha: passwordHash,
        documento, // Representa a Matrícula do aluno
        curso,
        tipo_usuario: tipo_usuario || 'ALUNO',
        status: true
      });

      req.flash('success', 'Utilizador criado com sucesso!');
      return res.redirect('/usuarios');
    } catch (e) {
      return res.render('usuarios/create', { 
        errors: e.errors?.map(err => err.message) || ['Erro ao criar utilizador'],
        dados: req.body 
      });
    }
  }

  // Página de edição de utilizador
  async edit(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      
      if (!usuario) {
        req.flash('error', 'Utilizador não encontrado.');
        return res.redirect('/usuarios');
      }

      return res.render('usuarios/edit', { 
        usuario: usuario.toJSON() 
      });
    } catch (e) {
      return res.redirect('/usuarios');
    }
  }

  // Atualiza os dados do utilizador
  async update(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      
      if (!usuario) {
        return res.status(404).send('Utilizador não encontrado');
      }

      const { nome, email, documento, curso, tipo_usuario, senha } = req.body;
      const updateData = { nome, email, documento, curso, tipo_usuario };

      // Se uma nova senha for enviada, encripta-a
      if (senha && senha.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.senha = await bcrypt.hash(senha, salt);
      }

      await usuario.update(updateData);
      
      req.flash('success', 'Utilizador atualizado com sucesso!');
      return res.redirect('/usuarios');
    } catch (e) {
      req.flash('error', 'Erro ao atualizar utilizador.');
      return res.redirect('/usuarios');
    }
  }

  // Remove um utilizador ou desativa-o
  async delete(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      
      if (!usuario) {
        return res.status(404).send('Utilizador não encontrado');
      }

      // Em sistemas reais, muitas vezes preferimos desativar (status = false)
      // mas aqui faremos a remoção física conforme solicitado nas rotas
      await usuario.destroy();

      req.flash('success', 'Utilizador removido do sistema.');
      return res.redirect('/usuarios');
    } catch (e) {
      req.flash('error', 'Erro ao remover utilizador.');
      return res.redirect('/usuarios');
    }
  }
}

export default new UsuarioController();