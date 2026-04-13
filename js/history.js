/**
 * Sistema de Histórico (Undo/Redo)
 */

const History = {
  stack: [],
  currentIndex: -1,
  maxStates: 20,

  /**
   * Inicializar o histórico
   */
  init() {
    // Ctrl+Z para undo
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }
    });

    // Salvar estado inicial
    this.saveState('Initial state');
  },

  /**
   * Salvar um novo estado
   */
  saveState(description = 'Changed element') {
    // Se estamos no meio da stack, remover estados futuros
    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1);
    }

    // Capturar o estado atual do DOM dos slides
    const state = {
      description: description,
      timestamp: Date.now(),
      slidesHTML: document.getElementById('sgrid')?.innerHTML || '',
      manualHTML: document.getElementById('manualSgrid')?.innerHTML || '',
      estadoData: JSON.parse(JSON.stringify(estado))
    };

    this.stack.push(state);
    this.currentIndex++;

    // Limitar o tamanho da stack
    if (this.stack.length > this.maxStates) {
      this.stack.shift();
      this.currentIndex--;
    }

    console.log(`Estado salvo: ${description} (${this.currentIndex + 1}/${this.stack.length})`);
  },

  /**
   * Desfazer (Undo)
   */
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreState();
      showSuccess('↶ Desfeito');
    } else {
      showErr('Nada para desfazer');
    }
  },

  /**
   * Refazer (Redo) - opcional, pode ser adicionado depois
   */
  redo() {
    if (this.currentIndex < this.stack.length - 1) {
      this.currentIndex++;
      this.restoreState();
      showSuccess('↷ Refeito');
    } else {
      showErr('Nada para refazer');
    }
  },

  /**
   * Restaurar estado
   */
  restoreState() {
    const state = this.stack[this.currentIndex];
    if (!state) return;

    // Restaurar HTML dos slides
    const sgrid = document.getElementById('sgrid');
    const manualSgrid = document.getElementById('manualSgrid');

    if (sgrid && state.slidesHTML) {
      sgrid.innerHTML = state.slidesHTML;
    }

    if (manualSgrid && state.manualHTML) {
      manualSgrid.innerHTML = state.manualHTML;
    }

    // Restaurar estado global
    Object.assign(estado, state.estadoData);

    // Fechar o painel do editor
    if (Editor && Editor.closePanel) {
      Editor.closePanel();
    }

    // Re-anexar event listeners
    if (Editor && Editor.attachEventListeners) {
      Editor.attachEventListeners();
    }

    console.log(`Estado restaurado: ${state.description}`);
  },

  /**
   * Limpar histórico
   */
  clear() {
    this.stack = [];
    this.currentIndex = -1;
    this.saveState('Initial state');
  },

  /**
   * Obter número de estados para undo disponíveis
   */
  getUndoCount() {
    return this.currentIndex;
  },

  /**
   * Obter número de estados para redo disponíveis
   */
  getRedoCount() {
    return this.stack.length - this.currentIndex - 1;
  }
};

// Inicializar ao carregar
window.addEventListener('DOMContentLoaded', () => {
  // Aguardar um pouco para garantir que outros elementos foram carregados
  setTimeout(() => {
    History.init();
  }, 500);
});
