import { Op, fn, col, literal } from 'sequelize';
import Movimentacao from '../models/Movimentacao.js';
import Livro from '../models/Livro.js';
import Usuario from '../models/Usuario.js';
import ExcelJS from 'exceljs';

class HomeController {
  // Renderiza o Dashboard inicial com as estatísticas
  async index(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      // Estatísticas rápidas
      const totalLivros = await Livro.count();
      const totalAlunos = await Usuario.count({ where: { tipo_usuario: 'ALUNO' } });
      const emprestimosAtivos = await Movimentacao.count({ 
        where: { tipo: 'EMPRESTIMO', status_movimentacao: 'ativo' } 
      });
      const reservasPendentes = await Movimentacao.count({ 
        where: { tipo: 'RESERVA', status_movimentacao: 'pendente' } 
      });

      // Lógica do Ranking resumido para a Home
      const ranking = await Movimentacao.findAll({
        attributes: [
          'usuario_id',
          [fn('COUNT', col('usuario_id')), 'total_leituras']
        ],
        where: { tipo: 'EMPRESTIMO' },
        include: [{ 
          model: Usuario, 
          as: 'aluno', 
          attributes: ['nome', 'documento', 'curso'] 
        }],
        group: ['usuario_id', 'aluno.id'],
        order: [[literal('total_leituras'), 'DESC']],
        limit: 10,
        raw: false,
        nest: true
      });

      return res.render('home/index', {
        stats: { totalLivros, totalAlunos, emprestimosAtivos, reservasPendentes },
        ranking: ranking.map(r => r.toJSON()),
        filtros: { dataInicio, dataFim }
      });
    } catch (e) {
      console.error(e);
      return res.render('error', { message: 'Erro ao carregar o dashboard' });
    }
  }

  // Método para a página específica de Ranking (chamado nas rotas)
  async rankingLeitores(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      const whereRanking = { tipo: 'EMPRESTIMO' };
      
      if (dataInicio && dataFim) {
        whereRanking.data_saida = { [Op.between]: [new Date(dataInicio), new Date(dataFim)] };
      }

      const ranking = await Movimentacao.findAll({
        attributes: [
          'usuario_id',
          [fn('COUNT', col('usuario_id')), 'total_leituras']
        ],
        where: whereRanking,
        include: [{ 
          model: Usuario, 
          as: 'aluno', 
          attributes: ['nome', 'documento', 'curso'] 
        }],
        group: ['usuario_id', 'aluno.id'],
        order: [[literal('total_leituras'), 'DESC']]
      });

      return res.render('home/ranking', { 
        ranking: ranking.map(r => r.toJSON()),
        filtros: { dataInicio, dataFim }
      });
    } catch (e) {
      console.error(e);
      return res.status(400).send('Erro ao carregar ranking');
    }
  }

  // Exportação Excel do Ranking
  async exportarRanking(req, res) {
    const { dataInicio, dataFim } = req.query;
    
    try {
      const whereRanking = { tipo: 'EMPRESTIMO' };
      if (dataInicio && dataFim) {
        whereRanking.data_saida = { [Op.between]: [dataInicio, dataFim] };
      }

      const ranking = await Movimentacao.findAll({
        attributes: ['usuario_id', [fn('COUNT', col('usuario_id')), 'total']],
        where: whereRanking,
        include: [{ model: Usuario, as: 'aluno', attributes: ['nome', 'documento', 'curso'] }],
        group: ['usuario_id', 'aluno.id'],
        order: [[literal('total'), 'DESC']]
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ranking de Leitores');
      
      worksheet.columns = [
        { header: 'Posição', key: 'pos', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Matrícula', key: 'documento', width: 20 },
        { header: 'Curso', key: 'curso', width: 20 },
        { header: 'Total de Leituras', key: 'total', width: 15 },
      ];

      ranking.forEach((item, index) => {
        worksheet.addRow({
          pos: index + 1,
          nome: item.aluno.nome,
          documento: item.aluno.documento,
          curso: item.aluno.curso,
          total: item.get('total')
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=ranking_leitores_${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      return res.end();
    } catch (e) {
      console.error(e);
      return res.status(400).send('Erro ao exportar Excel');
    }
  }
}

export default new HomeController();