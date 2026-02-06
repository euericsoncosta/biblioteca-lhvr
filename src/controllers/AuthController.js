import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

class AuthController {
  // Renderiza a página de login
  renderLogin(req, res) {
    if (req.session.user) return res.redirect('/');
    return res.render('auth/login', { layout: false, title: 'Login - Biblioteca LHVR' });
  }

  // Renderiza a página de registo (Signup)
  renderSignup(req, res) {
    if (req.session.user) return res.redirect('/');
    return res.render('auth/signup', { layout: false, title: 'Criar Conta - Biblioteca LHVR' });
  }

  // Processa o registo do aluno
  async signup(req, res) {
    try {
      const { nome, email, senha, documento, curso } = req.body;

      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        req.flash('error', 'Este e-mail já está registado.');
        return res.redirect('/signup');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(senha, salt);

      await Usuario.create({
        nome,
        email,
        senha: passwordHash,
        documento,
        curso, 
        tipo_usuario: 'ALUNO',
        status: true
      });

      req.flash('success', 'Conta criada com sucesso! Faça login.');
      return res.redirect('/login');
    } catch (error) {
      console.error("❌ Erro no Signup:", error);
      req.flash('error', 'Erro ao processar registo.');
      return res.redirect('/signup');
    }
  }

  // Processa o login (CORRIGIDO PARA EVITAR ERRO INTERNO)
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // 1. Procurar o utilizador
      const usuario = await Usuario.findOne({ where: { email } });

      // 2. Verificar se o utilizador existe ANTES de comparar a senha
      if (!usuario) {
        req.flash('error', 'E-mail ou senha inválidos.');
        return res.redirect('/login');
      }

      // 3. Verificar se a senha existe no banco (evita erro no bcrypt)
      if (!usuario.senha) {
        console.error("⚠️ Utilizador sem senha definida no banco:", email);
        req.flash('error', 'Erro na conta. Contacte o administrador.');
        return res.redirect('/login');
      }

      // 4. Comparar senhas
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        req.flash('error', 'E-mail ou senha inválidos.');
        return res.redirect('/login');
      }

      // 5. Verificar se a conta está ativa
      if (!usuario.status) {
        req.flash('error', 'Esta conta está inativa.');
        return res.redirect('/login');
      }

      // 6. Iniciar sessão
      req.session.user = {
        id: usuario.id,
        nome: usuario.nome,
        tipo_usuario: usuario.tipo_usuario 
      };

      req.flash('success', `Bem-vindo, ${usuario.nome}!`);
      return res.redirect('/');
    } catch (error) {
      // AGORA VERÁ O ERRO REAL NO SEU TERMINAL (VS Code)
      console.error("❌ ERRO CRÍTICO NO LOGIN:", error); 
      req.flash('error', 'Erro interno ao realizar login.');
      return res.redirect('/login');
    }
  }

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

export default new AuthController();