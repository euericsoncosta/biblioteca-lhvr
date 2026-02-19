import { Router } from "express";
import HomeController from "../controllers/HomeController.js";
import LivroController from "../controllers/LivroController.js";
import EmprestimoController from "../controllers/EmprestimoController.js";
import UsuarioController from "../controllers/UsuarioController.js";
import AuthController from "../controllers/AuthController.js";
import DigitalLibraryController from "../controllers/DigitalLibraryController.js";
import MaterialController from "../controllers/MaterialController.js"; // Importado o novo controller

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

// Todos os logados vêem o Dashboard, Ranking e Biblioteca Digital
routes.get("/", HomeController.index);
routes.get("/ranking", HomeController.rankingLeitores);
routes.get("/exportar-ranking", HomeController.exportarRanking);
routes.get("/biblioteca-digital", DigitalLibraryController.index);

// NOVO: Materiais de Apoio (Alunos e Professores podem ver e filtrar)
routes.get("/materiais", MaterialController.index);

// --- ROTAS RESTRITAS (STAFF - BIBLIOTECÁRIO OU ADMIN) ---

// Gestão de Acervo (Livros)
routes.get("/livros", LivroController.index);
routes.get("/livros/novo", staffOnly, LivroController.create);
routes.post("/livros/store", staffOnly, LivroController.store);
routes.get("/livros/editar/:id", staffOnly, LivroController.edit);
routes.post("/livros/update/:id", staffOnly, LivroController.update);
routes.post("/livros/delete/:id", adminOnly, LivroController.delete); 
routes.get("/exportar-acervo", staffOnly, LivroController.exportarLivros);

// Gestão de Empréstimos
routes.get("/emprestimos", staffOnly, EmprestimoController.index);
routes.get("/emprestimos/novo", staffOnly, EmprestimoController.create);
routes.post("/emprestimos/store", staffOnly, EmprestimoController.store);
routes.get("/emprestimos/editar/:id", staffOnly, EmprestimoController.edit);
routes.post("/emprestimos/update/:id", staffOnly, EmprestimoController.update);

// NOVO: Cadastro de Materiais de Revisão
routes.get("/materiais/novo", staffOnly, MaterialController.create);
routes.post("/materiais/store", staffOnly, MaterialController.store);

// --- ROTAS RESTRITAS (ADMIN APENAS) ---
routes.get("/usuarios", adminOnly, UsuarioController.index);
routes.get("/usuarios/novo", adminOnly, UsuarioController.create);
routes.post("/usuarios/store", adminOnly, UsuarioController.store);
routes.get("/usuarios/editar/:id", adminOnly, UsuarioController.edit);
routes.post("/usuarios/update/:id", adminOnly, UsuarioController.update);
routes.post("/usuarios/delete/:id", adminOnly, UsuarioController.delete);

// Remoção de materiais também restrita ao Admin por segurança
routes.post("/materiais/delete/:id", adminOnly, MaterialController.delete);

export default routes;