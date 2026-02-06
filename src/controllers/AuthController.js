import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

class AuthController {
  // Renderiza a página de login
  renderLogin(req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
    return res.render('auth/login', { layout: false, title: 'Login - Biblioteca LHVR' });
  }

  // Renderiza a página de auto-cadastro (Sign Up)
  renderSignup(req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
    return res.render('auth/signup', { layout: false, title: 'Criar Conta - Biblioteca LHVR' });
  }

  // Processa o auto-cadastro do aluno
  async signup(req, res) {
    try {
      const { nome, email, senha, documento, curso } = req.body;

      // Verifica se o email já existe
      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        req.flash('error', 'Este e-mail já está registado no sistema.');
        return res.redirect('/signup');
      }

      // Encripta a senha
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(senha, salt);

      // Cria o utilizador como ALUNO por padrão
      await Usuario.create({
        nome,
        email,
        senha: passwordHash,
        documento,
        curso,
        tipo_usuario: 'ALUNO', // Garantia de que entra como aluno
        status: true
      });

      req.flash('success', 'Conta criada com sucesso! Pode agora fazer login.');
      return res.redirect('/login');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao processar o seu registo. Verifique os dados.');
      return res.redirect('/signup');
    }
  }

  // Processa o login
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
        req.flash('error', 'Utilizador não encontrado.');
        return res.redirect('/login');
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        req.flash('error', 'Senha incorreta.');
        return res.redirect('/login');
      }

      if (!usuario.status) {
        req.flash('error', 'Esta conta está inativa. Contacte o administrador.');
        return res.redirect('/login');
      }

      req.session.user = {
        id: usuario.id,
        nome: usuario.nome,
        tipo_usuario: usuario.tipo_usuario 
      };

      req.flash('success', `Bem-vindo, ${usuario.nome}!`);
      return res.redirect('/');
    } catch (error) {
      req.flash('error', 'Erro interno ao realizar login.');
      return res.redirect('/login');
    }
  }

  // Terminar a sessão
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

export default new AuthController();