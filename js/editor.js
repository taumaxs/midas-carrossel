/**
 * Editor Visual - WYSIWYG com drag & drop e edição em tempo real
 */

const Editor = {
  selectedElement: null,
  editorPanel: null,

  /**
   * Inicializar editor
   */
  init() {
    this.editorPanel = document.getElementById('editorPanel');
    this.attachEventListeners();
  },

  /**
   * Anexar listeners para elementos editáveis
   */
  attachEventListeners() {
    // Delegado: clique em qualquer elemento editável dentro dos slides
    document.addEventListener('click', (e) => {
      const editable = e.target.closest('[contenteditable]');
      if (editable && editable.closest('.slide')) {
        this.selectElement(editable);
      }
    });

    // Drag & Drop para imagens
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        this.handleImageDrop(e);
      }
    });
  },

  /**
   * Selecionar elemento para edição
   */
  selectElement(element) {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
    }
    
    this.selectedElement = element;
    element.classList.add('selected');
    this.showEditorPanel(element);
  },

  /**
   * Mostrar painel de edição
   */
  showEditorPanel(element) {
    if (!this.editorPanel) return;

    const slide = element.closest('.slide');
    if (!slide) return;

    const tipo = this.getElementType(element);
    const panel = this.buildEditorPanel(element, tipo);
    
    this.editorPanel.innerHTML = panel;
    this.editorPanel.classList.add('open');

    // Anexar eventos dos campos
    this.attachPanelEvents(element, tipo);
  },

  /**
   * Determinar tipo de elemento
   */
  getElementType(element) {
    if (element.classList.contains('h1') || element.classList.contains('stitle') || element.classList.contains('cmain')) {
      return 'titulo';
    }
    if (element.classList.contains('sdesc')) {
      return 'descricao';
    }
    if (element.classList.contains('sline')) {
      return 'linha';
    }
    if (element.classList.contains('kw') || element.classList.contains('cred')) {
      return 'destaque';
    }
    return 'texto';
  },

  /**
   * Construir painel de edição
   */
  buildEditorPanel(element, tipo) {
    let html = '<div class="ed-title">EDITAR ELEMENTO</div><div class="ed-fields">';

    if (tipo === 'titulo') {
      html += `
        <div class="ed-field">
          <label>Texto</label>
          <textarea class="ed-text" data-target="text">${element.textContent}</textarea>
        </div>
        <div class="ed-field">
          <label>Tamanho (px)</label>
          <input type="range" class="ed-size" min="12" max="72" value="${element.style.fontSize || '32'}" data-target="fontSize">
          <span>${element.style.fontSize || '32'}px</span>
        </div>
        <div class="ed-field">
          <label>Cor</label>
          <input type="color" class="ed-color" value="${element.style.color || '#ffffff'}" data-target="color">
        </div>
        <div class="ed-field">
          <label>Fonte</label>
          <select class="ed-font" data-target="fontFamily">
            <option value="'Barlow Condensed', sans-serif">Barlow Condensed</option>
            <option value="'Arial', sans-serif">Arial</option>
            <option value="'Georgia', serif">Georgia</option>
            <option value="'Caveat', cursive">Caveat</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
          </select>
        </div>
      `;
    } else if (tipo === 'descricao') {
      html += `
        <div class="ed-field">
          <label>Texto</label>
          <textarea class="ed-text" data-target="text">${element.textContent}</textarea>
        </div>
        <div class="ed-field">
          <label>Tamanho (px)</label>
          <input type="range" class="ed-size" min="10" max="24" value="${element.style.fontSize || '13'}" data-target="fontSize">
          <span>${element.style.fontSize || '13'}px</span>
        </div>
        <div class="ed-field">
          <label>Cor</label>
          <input type="color" class="ed-color" value="${element.style.color || '#888888'}" data-target="color">
        </div>
      `;
    }

    html += `
      <div class="ed-actions">
        <button class="btn-sm danger" onclick="Editor.deleteElement()">🗑 Deletar</button>
        <button class="btn-sm" onclick="Editor.closePanel()">Fechar</button>
      </div>
    </div>`;

    return html;
  },

  /**
   * Anexar eventos do painel
   */
  attachPanelEvents(element, tipo) {
    const textField = document.querySelector('.ed-text');
    const sizeField = document.querySelector('.ed-size');
    const colorField = document.querySelector('.ed-color');
    const fontField = document.querySelector('.ed-font');

    if (textField) {
      textField.addEventListener('input', () => {
        element.textContent = textField.value;
        this.autoSave();
      });
    }

    if (sizeField) {
      sizeField.addEventListener('input', () => {
        element.style.fontSize = sizeField.value + 'px';
        document.querySelector('.ed-size ~ span').textContent = sizeField.value + 'px';
        this.autoSave();
      });
    }

    if (colorField) {
      colorField.addEventListener('input', () => {
        element.style.color = colorField.value;
        this.autoSave();
      });
    }

    if (fontField) {
      fontField.addEventListener('change', () => {
        element.style.fontFamily = fontField.value;
        this.autoSave();
      });
    }
  },

  /**
   * Deletar elemento
   */
  deleteElement() {
    if (this.selectedElement && confirm('Tem certeza que quer deletar este elemento?')) {
      this.selectedElement.remove();
      this.closePanel();
      this.autoSave();
    }
  },

  /**
   * Fechar painel de edição
   */
  closePanel() {
    if (this.editorPanel) {
      this.editorPanel.classList.remove('open');
    }
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
      this.selectedElement = null;
    }
  },

  /**
   * Handle de drop de imagens
   */
  handleImageDrop(e) {
    // Implementar drag & drop de imagens nos slides
    console.log('Imagens dropadas:', e.dataTransfer.files);
  },

  /**
   * Auto-save
   */
  autoSave() {
    if (estado.projetoAtual) {
      Storage.updateProject(estado.projetoAtual, estado.slidesData, estado);
    }
  }
};
