/**
 * Editor Visual - WYSIWYG com drag & drop e edição em tempo real
 */

const Editor = {
  selectedElement: null,
  editorPanel: null,
  editorContent: null,

  /**
   * Inicializar editor
   */
  init() {
    this.editorPanel = document.getElementById('editorPanel');
    this.editorContent = document.getElementById('editorPanelContent');
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
    if (!this.editorPanel || !this.editorContent) return;

    const slide = element.closest('.slide');
    if (!slide) return;

    const tipo = this.getElementType(element);
    const panel = this.buildEditorPanel(element, tipo);
    
    this.editorContent.innerHTML = panel;
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
     const textContent = element.textContent;
     const fontSize = element.style.fontSize || (tipo === 'titulo' ? '32px' : '13px');
     const fontSizeNum = parseInt(fontSize);
     const color = element.style.color || (tipo === 'titulo' ? '#ffffff' : '#888888');
     const fontFamily = element.style.fontFamily || "'Arial', sans-serif";
     
     let html = '';

     // SEÇÃO DE TEXTO
     html += `
       <div class="ed-section">
         <div class="ed-section-label">📝 Conteúdo</div>
         <div class="ed-field">
           <label>Editar Texto</label>
           <textarea class="ed-text" data-target="text">${textContent}</textarea>
         </div>
       </div>
     `;

     // SEÇÃO DE ADICIONAR IMAGEM AO SLIDE
     const slide = element.closest('.slide');
     if (slide) {
       html += `
         <div class="ed-section">
           <div class="ed-section-label">🖼️ Imagem</div>
           <div class="ed-field">
             <label>Adicionar Imagem ao Slide</label>
             <input type="file" accept="image/*" class="ed-image-upload" data-target="image">
             <small style="color:#888; margin-top:8px; display:block;">Clique para selecionar uma imagem para inserir no slide</small>
           </div>
         </div>
       `;
     }

     // SEÇÃO DE TAMANHO
     html += `
       <div class="ed-section">
         <div class="ed-section-label">📏 Tamanho</div>
         <div class="ed-field">
           <label>Tamanho da Fonte</label>
           <input type="range" class="ed-size" min="10" max="72" value="${fontSizeNum}" data-target="fontSize">
           <div class="ed-field-value">${fontSizeNum}px</div>
         </div>
       </div>
     `;
    `;

    // SEÇÃO DE TAMANHO
    html += `
      <div class="ed-section">
        <div class="ed-section-label">📏 Tamanho</div>
        <div class="ed-field">
          <label>Tamanho da Fonte</label>
          <input type="range" class="ed-size" min="10" max="72" value="${fontSizeNum}" data-target="fontSize">
          <div class="ed-field-value">${fontSizeNum}px</div>
        </div>
      </div>
    `;

    // SEÇÃO DE COR
    const colorHex = color.includes('#') ? color : '#ffffff';
    html += `
      <div class="ed-section">
        <div class="ed-section-label">🎨 Cor</div>
        <div class="ed-field">
          <label>Cor do Texto</label>
          <input type="color" class="ed-color" value="${colorHex}" data-target="color">
          <div class="ed-color-preview">
            <div class="ed-color-swatch" id="colorSwatch" style="background: ${colorHex}"></div>
            <span class="ed-color-hex">${colorHex.toUpperCase()}</span>
          </div>
        </div>
      </div>
    `;

    // SEÇÃO DE FONTE
    html += `
      <div class="ed-section">
        <div class="ed-section-label">🔤 Tipografia</div>
        <div class="ed-field">
          <label>Tipo de Fonte</label>
          <select class="ed-font" data-target="fontFamily">
            <option value="'Arial', sans-serif" ${fontFamily === "'Arial', sans-serif" ? 'selected' : ''}>Arial (padrão)</option>
            <option value="'Georgia', serif" ${fontFamily === "'Georgia', serif" ? 'selected' : ''}>Georgia</option>
            <option value="'Playfair Display', serif" ${fontFamily === "'Playfair Display', serif" ? 'selected' : ''}>Playfair Display (elegante)</option>
            <option value="'Montserrat', sans-serif" ${fontFamily === "'Montserrat', sans-serif" ? 'selected' : ''}>Montserrat (moderna)</option>
            <option value="'Roboto', sans-serif" ${fontFamily === "'Roboto', sans-serif" ? 'selected' : ''}>Roboto (limpa)</option>
            <option value="'Poppins', sans-serif" ${fontFamily === "'Poppins', sans-serif" ? 'selected' : ''}>Poppins (casual)</option>
            <option value="'Inter', sans-serif" ${fontFamily === "'Inter', sans-serif" ? 'selected' : ''}>Inter (tech)</option>
            <option value="'Ubuntu', sans-serif" ${fontFamily === "'Ubuntu', sans-serif" ? 'selected' : ''}>Ubuntu (legível)</option>
            <option value="'Lora', serif" ${fontFamily === "'Lora', serif" ? 'selected' : ''}>Lora (sérif)</option>
            <option value="'Barlow Condensed', sans-serif" ${fontFamily === "'Barlow Condensed', sans-serif" ? 'selected' : ''}>Barlow Condensed</option>
            <option value="'Caveat', cursive" ${fontFamily === "'Caveat', cursive" ? 'selected' : ''}>Caveat</option>
          </select>
        </div>
      </div>
    `;

    // SEÇÃO DE AÇÕES
    html += `
      <div class="ed-section">
        <div class="ed-info">
          ✨ <strong>Dica:</strong> As mudanças aparecem em tempo real no slide. Clique em outro elemento para editar.
        </div>
        <div class="ed-actions">
          <button class="btn-sm danger" onclick="Editor.deleteElement()" style="flex: 0.5">🗑 Deletar</button>
          <button class="btn-sm" onclick="Editor.closePanel()" style="flex: 1">Fechar Painel</button>
        </div>
      </div>
    `;

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
       
       // Salvar histórico ao terminar de editar
       textField.addEventListener('blur', () => {
         if (typeof History !== 'undefined') {
           History.saveState('Texto alterado');
         }
       });
     }

     if (sizeField) {
       sizeField.addEventListener('input', () => {
         element.style.fontSize = sizeField.value + 'px';
         const displayValue = document.querySelector('.ed-field-value');
         if (displayValue) {
           displayValue.textContent = sizeField.value + 'px';
         }
         this.autoSave();
       });
       
       // Salvar histórico ao terminar de editar
       sizeField.addEventListener('change', () => {
         if (typeof History !== 'undefined') {
           History.saveState('Tamanho alterado para ' + sizeField.value + 'px');
         }
       });
     }

     if (colorField) {
       colorField.addEventListener('input', () => {
         element.style.color = colorField.value;
         
         // Atualizar preview de cor
         const swatch = document.getElementById('colorSwatch');
         const hexDisplay = document.querySelector('.ed-color-hex');
         if (swatch) swatch.style.background = colorField.value;
         if (hexDisplay) hexDisplay.textContent = colorField.value.toUpperCase();
         
         this.autoSave();
       });
       
       // Salvar histórico ao terminar
       colorField.addEventListener('change', () => {
         if (typeof History !== 'undefined') {
           History.saveState('Cor alterada para ' + colorField.value);
         }
       });
     }

     if (fontField) {
       fontField.addEventListener('change', () => {
         element.style.fontFamily = fontField.value;
         this.autoSave();
         
         if (typeof History !== 'undefined') {
           History.saveState('Fonte alterada');
         }
     }

     // Adicionar imagem ao slide
     const imageUpload = document.querySelector('.ed-image-upload');
     if (imageUpload) {
       imageUpload.addEventListener('change', (e) => {
         if (e.target.files.length > 0) {
           this.addImageToSlide(e.target.files[0]);
         }
       });
     }
   },

   /**
    * Adicionar imagem ao slide
    */
   addImageToSlide(file) {
     const reader = new FileReader();
     reader.onload = (e) => {
       const slide = this.selectedElement.closest('.slide');
       if (!slide) return;

       // Criar elemento de imagem
       const imgContainer = document.createElement('div');
       imgContainer.className = 'slide-image-element';
       imgContainer.style.cssText = `
         position: absolute;
         max-width: 200px;
         max-height: 200px;
         cursor: move;
         border: 2px solid #FF5500;
         border-radius: 8px;
         overflow: hidden;
         right: 20px;
         top: 50%;
         transform: translateY(-50%);
         z-index: 10;
       `;

       const img = document.createElement('img');
       img.src = e.target.result;
       img.style.cssText = `
         width: 100%;
         height: 100%;
         object-fit: cover;
         display: block;
       `;

       const deleteBtn = document.createElement('button');
       deleteBtn.innerHTML = '×';
       deleteBtn.style.cssText = `
         position: absolute;
         top: 4px;
         right: 4px;
         background: #FF5500;
         color: white;
         border: none;
         border-radius: 50%;
         width: 24px;
         height: 24px;
         cursor: pointer;
         font-size: 18px;
         padding: 0;
         display: flex;
         align-items: center;
         justify-content: center;
         z-index: 20;
       `;

       deleteBtn.addEventListener('click', (e) => {
         e.stopPropagation();
         imgContainer.remove();
         this.autoSave();
         if (typeof History !== 'undefined') {
           History.saveState('Imagem deletada');
         }
       });

       // Fazer draggable
       let isDragging = false;
       let startX = 0;
       let startY = 0;
       let currentX = 0;
       let currentY = 0;

       imgContainer.addEventListener('mousedown', (e) => {
         if (e.target === deleteBtn) return;
         isDragging = true;
         startX = e.clientX - currentX;
         startY = e.clientY - currentY;
         imgContainer.style.cursor = 'grabbing';
       });

       document.addEventListener('mousemove', (e) => {
         if (!isDragging) return;
         currentX = e.clientX - startX;
         currentY = e.clientY - startY;
         imgContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
         imgContainer.style.position = 'absolute';
         imgContainer.style.right = 'auto';
         imgContainer.style.top = 'auto';
       });

       document.addEventListener('mouseup', () => {
         if (isDragging) {
           isDragging = false;
           imgContainer.style.cursor = 'move';
           this.autoSave();
           if (typeof History !== 'undefined') {
             History.saveState('Imagem movida');
           }
         }
       });

       imgContainer.appendChild(img);
       imgContainer.appendChild(deleteBtn);

       // Se o slide for posicionado relativamente, adicionar a imagem
       if (slide.style.position !== 'relative') {
         slide.style.position = 'relative';
       }

       slide.appendChild(imgContainer);

       showSuccess('✓ Imagem adicionada!');
       this.autoSave();
       if (typeof History !== 'undefined') {
         History.saveState('Imagem adicionada');
       }
     };
     reader.readAsDataURL(file);
   },
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