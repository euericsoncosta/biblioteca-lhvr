import dotenv from "dotenv";
dotenv.config();

import express from "express";
import methodOverride from "method-override";
import { resolve } from "path";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import moment from "moment";

// Importando a conexão com o banco de dados
import "./src/database/index.js"; 

// Importando as rotas
import routes from "./src/routes/routes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    // 1. Configuração do engine Handlebars (extensão .handlebars)
    this.app.engine(
      "handlebars", 
      engine({
        extname: ".handlebars", // Define que os arquivos terminam em .handlebars
        defaultLayout: "main",
        helpers: {
          // Helper para formatar moeda (Brasil/Portugal)
          formatCurrency: (value) => {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value || 0);
          },

          // Helper para extrair a primeira letra (usado nos Avatares)
          substring: (str, start, end) => {
            if (!str) return "";
            return str.substring(start, end);
          },

          // Helper para operações matemáticas no ranking (ex: 0 + 1 = 1ª posição)
          math: (lvalue, operator, rvalue) => {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
              "+": lvalue + rvalue,
              "-": lvalue - rvalue,
              "*": lvalue * rvalue,
              "/": lvalue / rvalue,
              "%": lvalue % rvalue
            }[operator];
          },

          // Helper de comparação (essencial para cores de status e selects)
          eq: (v1, v2) => v1 === v2,

          // Formatação de datas simples
          formatDate: (date) => {
            if (!date) return "";
            return new Date(date).toLocaleDateString("pt-BR");
          },

          // Formatação de datas robusta com Moment (ex: DD/MM/YYYY)
          dateFormat: (date, format) => {
            if (!date) return "---";
            return moment(date).format(format);
          }
        }
      })
    );
    
    this.app.set("view engine", "handlebars");
    this.app.set("views", resolve(__dirname, "src", "views"));

    // 2. Pasta pública e Method Override
    this.app.use(express.static(resolve(__dirname, "public")));
    this.app.use(methodOverride("_method"));

    // 3. Parsing de JSON e URL-encoded
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 4. Configuração de Sessão
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'chave_segura_biblioteca_lhvr_123',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 3600000 } // 1 hora
    }));

    // 5. Configuração do Connect Flash para alertas
    this.app.use(flash());

    // 6. Middleware para variáveis globais (Sucesso, Erro e Usuário logado)
    this.app.use((req, res, next) => {
      res.locals.success = req.flash('success');
      res.locals.error = req.flash('error');
      res.locals.user = req.session.user || null; 
      next();
    });
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;