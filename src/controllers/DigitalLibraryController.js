class DigitalLibraryController {
  // Renderiza a página principal da biblioteca digital
  async index(req, res) {
    try {
      return res.render('digital/index', {
        title: 'Biblioteca Digital - LHVR'
      });
    } catch (e) {
      return res.status(500).render('error', { message: "Erro ao carregar a biblioteca digital." });
    }
  }
}

export default new DigitalLibraryController();