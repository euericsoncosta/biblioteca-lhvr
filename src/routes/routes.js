import { Router } from "express";
import HomeController from "../controllers/HomeController.js";
import LivroController from "../controllers/LivroController.js";
import EmprestimoController from "../controllers/EmprestimoController.js";
import UsuarioController from "../controllers/UsuarioController.js";
import AuthController from "../controllers/AuthController.js";
import DigitalLibraryController from "../controllers/DigitalLibraryController.js";

const routes = new Router();

// --- MIDDLEWARES ---

// 1. Verifica se está logado
const authMiddleware = (req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }
  return res.redirect("/login");
};

// 2. Bloqueia Alunos de áreas administrativas (Apenas ADMIN ou BIBLIOTECARIO)
const staffOnly = (req, res, next) => {
  const { tipo_usuario } = req.session.user;
  if (tipo_usuario === 'ADMIN' || tipo_usuario === 'BIBLIOTECARIO') {
    return next();
  }
  req.flash('error', 'Acesso negado. Esta área é restrita a funcionários.');
  return res.redirect("/");
};

// 3. Bloqueia apenas para ADMIN
const adminOnly = (req, res, next) => {
  if (req.session.user.tipo_usuario === 'ADMIN') {
    return next();
  }
  req.flash('error', 'Acesso restrito ao Administrador.');
  return res.redirect("/");
};

// --- ROTAS PÚBLICAS ---
routes.get("/login", AuthController.renderLogin);
routes.post("/login", AuthController.login);
routes.get("/signup", AuthController.renderSignup);
routes.post("/signup", AuthController.signup);
routes.get("/logout", AuthController.logout);

// --- ROTAS PROTEGIDAS (LOGADOS) ---
routes.use(authMiddleware);

// Todos os logados vêem o Dashboard e Ranking
routes.get("/", HomeController.index);
routes.get("/ranking", HomeController.rankingLeitores);
routes.get("/exportar-ranking", HomeController.exportarRanking);

// 2. ADICIONAR A ROTA DA BIBLIOTECA DIGITAL (Acessível a Alunos e Staff)
routes.get("/biblioteca-digital", DigitalLibraryController.index);

// --- ROTAS RESTRITAS (STAFF - BIBLIOTECÁRIO OU ADMIN) ---

// Livros (Acervo)
routes.get("/livros", LivroController.index);
routes.get("/livros/novo", staffOnly, LivroController.create);
routes.post("/livros/store", staffOnly, LivroController.store);
routes.get("/livros/editar/:id", staffOnly, LivroController.edit);
routes.post("/livros/update/:id", staffOnly, LivroController.update);
routes.post("/livros/delete/:id", adminOnly, LivroController.delete); 

// ADICIONADO: Rota para exportar o acervo para Excel
routes.get("/exportar-acervo", staffOnly, LivroController.exportarLivros);

// Empréstimos
routes.get("/emprestimos", staffOnly, EmprestimoController.index);
routes.get("/emprestimos/novo", staffOnly, EmprestimoController.create);
routes.post("/emprestimos/store", staffOnly, EmprestimoController.store);
routes.get("/emprestimos/editar/:id", staffOnly, EmprestimoController.edit);
routes.post("/emprestimos/update/:id", staffOnly, EmprestimoController.update);

// --- ROTAS RESTRITAS (ADMIN APENAS) ---
routes.get("/usuarios", adminOnly, UsuarioController.index);
routes.get("/usuarios/novo", adminOnly, UsuarioController.create);
routes.post("/usuarios/store", adminOnly, UsuarioController.store);
routes.get("/usuarios/editar/:id", adminOnly, UsuarioController.edit);
routes.post("/usuarios/update/:id", adminOnly, UsuarioController.update);
routes.post("/usuarios/delete/:id", adminOnly, UsuarioController.delete);

export default routes;