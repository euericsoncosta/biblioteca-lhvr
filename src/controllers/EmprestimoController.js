import Movimentacao from '../models/Movimentacao.js';
import Livro from '../models/Livro.js';
import Usuario from '../models/Usuario.js';
import { addDays } from 'date-fns';

class EmprestimoController {
  // Lista todas as movimentações (Histórico)
  async index(req, res) {
    try {
      const movimentacoes = await Movimentacao.findAll({
        include: [
          { model: Livro, as: 'livro', attributes: ['nome', 'tombo'] },
          { model: Usuario, as: 'aluno', attributes: ['nome', 'documento'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.render('emprestimos/index', { 
        movimentacoes: movimentacoes.map(m => m.toJSON()) 
      });
    } catch (e) {
      console.error(e);
      return res.status(500).render('error', { message: "Erro ao listar as movimentações no banco de dados." });
    }
  }

  // Página para novo empréstimo ou reserva
  async create(req, res) {
    try {
      // Apenas livros disponíveis podem ser emprestados/reservados
      const livros = await Livro.findAll({ 
        where: { status: 'disponivel' }, 
        order: [['nome', 'ASC']] 
      });
      
      // Lista todos os utilizadores para selecionar o aluno
      const usuarios = await Usuario.findAll({ order: [['nome', 'ASC']] });

      return res.render('emprestimos/create', { 
        livros: livros.map(l => l.toJSON()),
        usuarios: usuarios.map(u => u.toJSON())
      });
    } catch (e) {
      req.flash('error', 'Erro ao carregar dados para a nova operação.');
      return res.redirect('/emprestimos');
    }
  }

  // Grava a movimentação e atualiza o status do livro
  async store(req, res) {
    const { livro_id, usuario_id, tipo } = req.body;
    const bibliotecario_id = req.session.user?.id;

    try {
      // 1. Verifica se o livro existe e ainda está disponível (dupla checagem)
      const livro = await Livro.findByPk(livro_id);
      if (!livro || livro.status !== 'disponivel') {
        req.flash('error', 'Este livro já não se encontra disponível.');
        return res.redirect('/emprestimos/novo');
      }

      // 2. Define prazos: 7 dias para empréstimo, 2 dias para reserva
      const diasPrazo = tipo === 'EMPRESTIMO' ? 7 : 2;

      // 3. Cria o registo de movimentação
      await Movimentacao.create({
        livro_id,
        usuario_id,
        bibliotecario_id,
        tipo,
        data_devolucao_prevista: addDays(new Date(), diasPrazo),
        status_movimentacao: 'ativo'
      });

      // 4. Atualiza o estado do livro no acervo
      await livro.update({ 
        status: tipo === 'EMPRESTIMO' ? 'emprestado' : 'reservado' 
      });

      req.flash('success', `${tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Reserva'} registado com sucesso!`);
      return res.redirect('/emprestimos');
    } catch (e) {
      console.error(e);
      req.flash('error', 'Erro técnico ao processar a operação.');
      return res.redirect('/emprestimos/novo');
    }
  }

  // Página de edição para gerir devolução
  async edit(req, res) {
    try {
      const movimentacao = await Movimentacao.findByPk(req.params.id, {
        include: [
          { model: Livro, as: 'livro' },
          { model: Usuario, as: 'aluno' }
        ]
      });

      if (!movimentacao) {
        req.flash('error', 'Registo de movimentação não encontrado.');
        return res.redirect('/emprestimos');
      }

      return res.render('emprestimos/edit', { 
        movimentacao: movimentacao.toJSON() 
      });
    } catch (e) {
      return res.redirect('/emprestimos');
    }
  }

  // Finaliza a movimentação (Devolução)
  async update(req, res) {
    try {
      const movimentacao = await Movimentacao.findByPk(req.params.id);
      if (!movimentacao) {
        req.flash('error', 'Registo não encontrado.');
        return res.redirect('/emprestimos');
      }

      const { status_movimentacao, data_devolucao_real } = req.body;

      // Atualiza o registo da movimentação
      await movimentacao.update({ 
        status_movimentacao, 
        data_devolucao_real: data_devolucao_real || null 
      });

      // Lógica crucial: Se o livro foi devolvido, ele volta a ficar 'disponivel' no acervo
      if (status_movimentacao === 'devolvido') {
        const livro = await Livro.findByPk(movimentacao.livro_id);
        if (livro) {
          await livro.update({ status: 'disponivel' });
        }
      }

      req.flash('success', 'Dados da movimentação atualizados com sucesso.');
      return res.redirect('/emprestimos');
    } catch (e) {
      console.error(e);
      req.flash('error', 'Erro ao atualizar a movimentação.');
      return res.redirect('/emprestimos');
    }
  }
}

export default new EmprestimoController();