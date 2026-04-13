/**
 * Sistema de Storage - Favoritos, Projetos, Histórico
 */

const STORAGE_KEYS = {
  FAVORITOS: 'midas-favoritos',
  PROJETOS: 'midas-projetos',
  HISTORICO: 'midas-historico',
  NICHO: 'midas-nicho'
};

const Storage = {
  /**
   * FAVORITOS - Salvar carrossel como favorito
   */
  addFavorito(nome, slides, config) {
    try {
      const favoritos = this.getFavoritos();
      const id = generateId();
      const novo = {
        id,
        nome,
        slides,
        config,
        criado: new Date().toISOString(),
        thumbnail: this.generateThumbnail(slides)
      };
      favoritos.push(novo);
      localStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify(favoritos));
      return id;
    } catch (e) {
      console.error('Erro ao salvar favorito:', e);
      return null;
    }
  },

  getFavoritos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  deleteFavorito(id) {
    try {
      const favoritos = this.getFavoritos();
      const filtered = favoritos.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * PROJETOS - Salvar projeto para editar depois
   */
  saveProject(nome, slides, config) {
    try {
      const projetos = this.getProjetos();
      const id = generateId();
      const novo = {
        id,
        nome,
        slides,
        config,
        criado: new Date().toISOString(),
        modificado: new Date().toISOString()
      };
      projetos.push(novo);
      localStorage.setItem(STORAGE_KEYS.PROJETOS, JSON.stringify(projetos));
      return id;
    } catch (e) {
      console.error('Erro ao salvar projeto:', e);
      return null;
    }
  },

  getProjetos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJETOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getProject(id) {
    const projetos = this.getProjetos();
    return projetos.find(p => p.id === id);
  },

  deleteProject(id) {
    try {
      const projetos = this.getProjetos();
      const filtered = projetos.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJETOS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  duplicateProject(id, newName) {
    try {
      const projeto = this.getProject(id);
      if (!projeto) return null;
      return this.saveProject(
        newName || projeto.nome + ' (cópia)',
        projeto.slides,
        projeto.config
      );
    } catch {
      return null;
    }
  },

  updateProject(id, slides, config) {
    try {
      const projetos = this.getProjetos();
      const proj = projetos.find(p => p.id === id);
      if (proj) {
        proj.slides = slides;
        proj.config = config;
        proj.modificado = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.PROJETOS, JSON.stringify(projetos));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * HISTÓRICO - Últimas gerações com IA
   */
  addHistorico(tema, config, slides, tipo = 'geracao') {
    try {
      const historico = this.getHistorico();
      const novo = {
        id: generateId(),
        tipo,
        tema,
        config,
        slides,
        criado: new Date().toISOString()
      };
      historico.unshift(novo);
      // Manter apenas os últimos 50
      if (historico.length > 50) {
        historico.pop();
      }
      localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
      return novo.id;
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
      return null;
    }
  },

  getHistorico() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORICO);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getHistoricoItem(id) {
    const historico = this.getHistorico();
    return historico.find(h => h.id === id);
  },

  /**
   * NICHO
   */
  setNicho(nicho) {
    localStorage.setItem(STORAGE_KEYS.NICHO, nicho);
  },

  getNicho() {
    return localStorage.getItem(STORAGE_KEYS.NICHO) || '';
  },

  /**
   * HELPER - Gerar thumbnail do carrossel
   */
  generateThumbnail(slides) {
    // Retorna uma string com os primeiros títulos
    if (!slides || !slides.slides) return '';
    return slides.slides.map(s => s.titulo).slice(0, 3).join(' • ');
  }
};
