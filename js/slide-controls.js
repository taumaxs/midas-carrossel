/**
 * Controles Individuais por Slide
 * Painel expandível com: trocar cor, trocar imagem, regenerar com IA, excluir
 */

const SlideControls = {

  /**
   * Injetar painel abaixo de cada slide após renderização
   */
  injetarEmTodos() {
    document.querySelectorAll('.swrap').forEach(wrap => {
      const id = wrap.id; // ex: slide-wrap-1
      if (!id) return;
      const num = id.replace('slide-wrap-', '');
      if (!document.getElementById('sc-panel-' + num)) {
        this.injetarPainel(wrap, num);
      }
    });
  },

  /**
   * Injetar painel em um swrap específico
   */
  injetarPainel(wrap, num) {
    // Remover painel antigo se existir
    const antigo = document.getElementById('sc-panel-' + num);
    if (antigo) antigo.remove();

    // Remover botão de delete antigo que vem do slideWrap
    const slideActions = wrap.querySelector('.slide-actions');
    if (slideActions) slideActions.remove();

    // Adicionar barra de ações no rodapé do slide
    const barra = document.createElement('div');
    barra.className = 'sc-barra';
    barra.id = 'sc-barra-' + num;
    barra.innerHTML = `
      <button class="sc-btn" onclick="SlideControls.togglePainel(${num})" title="Configurar fundo">🎨 Fundo</button>
      <button class="sc-btn" onclick="SlideControls.regenerarSlide(${num})" title="Regenerar com IA">✦ IA</button>
      <button class="sc-btn" onclick="dlSlide(${num})" title="Baixar PNG">⬇ PNG</button>
      <button class="sc-btn sc-btn-danger" onclick="SlideControls.excluirSlide(${num})" title="Excluir slide">🗑</button>
    `;
    wrap.appendChild(barra);

    // Criar painel abaixo do swrap
    const painel = document.createElement('div');
    painel.className = 'sc-painel';
    painel.id = 'sc-panel-' + num;
    painel.innerHTML = this.buildPainelHTML(num);
    wrap.insertAdjacentElement('afterend', painel);

    // Eventos do painel
    this.attachPainelEvents(num);
  },

  /**
   * HTML interno do painel
   */
  buildPainelHTML(num) {
    const fundoAtual = SlideControls._getFundoSlide(num);
    return `
      <div class="sc-painel-inner">
        <div class="sc-painel-titulo">Fundo do slide ${num}</div>
        <div class="sc-tabs">
          <button class="sc-tab ${fundoAtual.tipo === 'cor' ? 'on' : ''}" onclick="SlideControls.setTipoFundo(${num}, 'cor')">🎨 Cor</button>
          <button class="sc-tab ${fundoAtual.tipo === 'img' ? 'on' : ''}" onclick="SlideControls.setTipoFundo(${num}, 'img')">🖼️ Imagem</button>
        </div>

        <div class="sc-painel-section" id="sc-cor-${num}" style="display:${fundoAtual.tipo === 'cor' ? 'block' : 'none'}">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px">
            <input type="color" id="sc-colorpicker-${num}" value="${fundoAtual.cor || '#0d0d0d'}" style="width:38px;height:34px;border:.5px solid #222;border-radius:8px;background:#0d0d0d;padding:2px;cursor:pointer"/>
            ${['#0d0d0d','#1a0800','#080818','#081808','#180818','#FF5500','#1a1a1a','#ffffff'].map(c =>
              `<div onclick="SlideControls.aplicarCor(${num},'${c}')" style="width:24px;height:24px;border-radius:6px;background:${c};cursor:pointer;border:2px solid transparent;flex-shrink:0;transition:border .15s" onmouseover="this.style.borderColor='#fff'" onmouseout="this.style.borderColor='transparent'"></div>`
            ).join('')}
          </div>
        </div>

        <div class="sc-painel-section" id="sc-img-${num}" style="display:${fundoAtual.tipo === 'img' ? 'block' : 'none'}">
          <div class="sc-upload-box" onclick="document.getElementById('sc-fileinput-${num}').click()">
            <strong>Clique para selecionar imagem</strong>
            <p>JPG ou PNG</p>
          </div>
          <input type="file" id="sc-fileinput-${num}" accept="image/*" style="display:none" onchange="SlideControls.aplicarImagem(${num}, event)"/>
          ${fundoAtual.img ? `<img src="${fundoAtual.img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin-top:8px;border:.5px solid #333"/>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Storage individual de fundos por slide
   */
  _fundos: {}, // { 1: { tipo: 'cor', cor: '#111', img: null }, ... }

  _getFundoSlide(num) {
    return this._fundos[num] || { tipo: 'cor', cor: estado.fundoCor, img: null };
  },

  _setFundoSlide(num, dados) {
    this._fundos[num] = { ...this._getFundoSlide(num), ...dados };
  },

  /**
   * Toggle abrir/fechar painel
   */
  togglePainel(num) {
    const painel = document.getElementById('sc-panel-' + num);
    if (!painel) return;
    const aberto = painel.classList.contains('open');
    // Fechar todos os outros
    document.querySelectorAll('.sc-painel.open').forEach(p => p.classList.remove('open'));
    if (!aberto) painel.classList.add('open');
  },

  /**
   * Mudar aba do painel (cor/img)
   */
  setTipoFundo(num, tipo) {
    this._setFundoSlide(num, { tipo });
    const corSection = document.getElementById('sc-cor-' + num);
    const imgSection = document.getElementById('sc-img-' + num);
    const tabs = document.querySelectorAll(`#sc-panel-${num} .sc-tab`);
    if (corSection) corSection.style.display = tipo === 'cor' ? 'block' : 'none';
    if (imgSection) imgSection.style.display = tipo === 'img' ? 'block' : 'none';
    tabs.forEach((t, i) => t.classList.toggle('on', (i === 0 && tipo === 'cor') || (i === 1 && tipo === 'img')));
  },

  /**
   * Aplicar cor a um slide específico
   */
  aplicarCor(num, cor) {
    this._setFundoSlide(num, { tipo: 'cor', cor, img: null });
    this._aplicarBgNoSlide(num);
    // Atualizar color picker
    const picker = document.getElementById('sc-colorpicker-' + num);
    if (picker) picker.value = cor;
  },

  /**
   * Aplicar imagem a um slide específico
   */
  aplicarImagem(num, event) {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    this._setFundoSlide(num, { tipo: 'img', img: url });
    this._aplicarBgNoSlide(num);
    // Atualizar thumbnail no painel
    const sec = document.getElementById('sc-img-' + num);
    if (sec) {
      const oldThumb = sec.querySelector('img');
      if (oldThumb) oldThumb.remove();
      const thumb = document.createElement('img');
      thumb.src = url;
      thumb.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:6px;margin-top:8px;border:.5px solid #333';
      sec.appendChild(thumb);
    }
  },

  /**
   * Aplicar fundo no DOM do slide
   */
  _aplicarBgNoSlide(num) {
    const wrap = document.getElementById('slide-wrap-' + num);
    if (!wrap) return;
    const slide = wrap.querySelector('.slide');
    if (!slide) return;
    const fundo = this._getFundoSlide(num);

    // Remover bg anterior
    const bgAnterior = slide.querySelector('.sc-bg-individual');
    if (bgAnterior) bgAnterior.remove();

    // Remover img de bg global anterior se existir
    const bgGlobal = slide.querySelector('img[style*="inset:0"]');
    const bgDiv = slide.querySelector('div[style*="inset:0"]');

    const bgEl = document.createElement(fundo.tipo === 'img' ? 'img' : 'div');
    bgEl.className = 'sc-bg-individual';

    if (fundo.tipo === 'img' && fundo.img) {
      bgEl.src = fundo.img;
      bgEl.setAttribute('crossorigin', 'anonymous');
      bgEl.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0';
      // Adicionar overlay
      const ov = slide.querySelector('.ovl');
      if (!ov) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 60%)';
        slide.insertBefore(overlay, slide.firstChild);
      }
    } else {
      const c = fundo.cor || estado.fundoCor;
      bgEl.style.cssText = `position:absolute;inset:0;background:${c};z-index:0`;
      slide.style.background = c;
    }

    slide.insertBefore(bgEl, slide.firstChild);
  },

  /**
   * Eventos do color picker
   */
  attachPainelEvents(num) {
    setTimeout(() => {
      const picker = document.getElementById('sc-colorpicker-' + num);
      if (picker) {
        picker.addEventListener('input', (e) => {
          this.aplicarCor(num, e.target.value);
        });
      }
    }, 100);
  },

  /**
   * Regenerar slide individual com IA
   */
  async regenerarSlide(num) {
    const tema = document.getElementById('tema')?.value.trim() || 'conteúdo';
    const tom = document.getElementById('tom')?.value || 'direto e provocativo';
    const pub = document.getElementById('publico')?.value.trim() || 'criadores de conteúdo';

    const wrap = document.getElementById('slide-wrap-' + num);
    if (!wrap) return;

    // Loading no slide
    const barra = document.getElementById('sc-barra-' + num);
    const btnIA = barra?.querySelector('.sc-btn:nth-child(2)');
    if (btnIA) { btnIA.textContent = '⏳'; btnIA.disabled = true; }

    try {
      // Calcular índice do slide de conteúdo
      const slideIdx = num - (estado.incCapa ? 1 : 0);
      const novoSlide = await AI.regenerarSlide(slideIdx, tema, tom, pub);

      // Atualizar dados
      if (estado.slidesData?.slides && estado.slidesData.slides[slideIdx - 1]) {
        estado.slidesData.slides[slideIdx - 1] = {
          ...estado.slidesData.slides[slideIdx - 1],
          tag: novoSlide.tag,
          titulo: novoSlide.titulo,
          desc: novoSlide.desc
        };
      }

      // Atualizar DOM diretamente
      const slide = wrap.querySelector('.slide');
      if (slide) {
        const stag = slide.querySelector('.stag');
        const stitle = slide.querySelector('.stitle');
        const sdesc = slide.querySelector('.sdesc');
        if (stag) stag.textContent = novoSlide.tag;
        if (stitle) stitle.textContent = novoSlide.titulo;
        if (sdesc) sdesc.textContent = novoSlide.desc;
      }

      if (typeof History !== 'undefined') History.saveState('Slide ' + num + ' regenerado');
      showSuccess('✦ Slide ' + num + ' regenerado!');
    } catch (e) {
      showErr('Erro ao regenerar: ' + e.message);
    } finally {
      if (btnIA) { btnIA.textContent = '✦ IA'; btnIA.disabled = false; }
    }
  },

  /**
   * Excluir slide individual
   */
  excluirSlide(num) {
    if (!confirm('Excluir este slide?')) return;

    // Remover do DOM
    const wrap = document.getElementById('slide-wrap-' + num);
    const painel = document.getElementById('sc-panel-' + num);
    if (wrap) wrap.remove();
    if (painel) painel.remove();

    // Remover dos dados
    if (estado.slidesData?.slides) {
      const slideIdx = num - (estado.incCapa ? 1 : 0) - 1;
      if (slideIdx >= 0 && slideIdx < estado.slidesData.slides.length) {
        estado.slidesData.slides.splice(slideIdx, 1);
        estado.slidesData.slides.forEach((s, i) => s.n = i + 1);
      }
    }

    delete this._fundos[num];
    if (typeof History !== 'undefined') History.saveState('Slide ' + num + ' excluído');
    showSuccess('✓ Slide excluído');
    saveState();
  }
};

// CSS dos controles individuais — injetado automaticamente
(function injetarCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .sc-barra {
      display: flex;
      gap: 6px;
      padding: 8px 10px;
      background: #0d0d0d;
      border-top: .5px solid #1e1e1e;
      flex-wrap: wrap;
    }
    .sc-btn {
      flex: 1;
      padding: 7px 10px;
      background: transparent;
      border: .5px solid #222;
      border-radius: 8px;
      color: #555;
      font-size: 11px;
      cursor: pointer;
      font-family: 'Barlow', sans-serif;
      text-transform: uppercase;
      letter-spacing: .8px;
      transition: all .15s;
      white-space: nowrap;
    }
    .sc-btn:hover { border-color: #FF5500; color: #FF5500; }
    .sc-btn:disabled { opacity: .4; cursor: not-allowed; }
    .sc-btn-danger:hover { border-color: #ff4444; color: #ff4444; }

    .sc-painel {
      max-height: 0;
      overflow: hidden;
      transition: max-height .3s ease, padding .3s ease;
      background: #0d0d0d;
      border: .5px solid #1e1e1e;
      border-top: none;
      border-radius: 0 0 12px 12px;
      margin-top: -14px;
      margin-bottom: 14px;
    }
    .sc-painel.open {
      max-height: 320px;
      padding: 14px;
    }
    .sc-painel-titulo {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #333;
      margin-bottom: 10px;
    }
    .sc-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
    }
    .sc-tab {
      flex: 1;
      padding: 7px;
      background: #111;
      border: .5px solid #222;
      border-radius: 8px;
      color: #555;
      font-size: 11px;
      cursor: pointer;
      font-family: 'Barlow', sans-serif;
      text-transform: uppercase;
      letter-spacing: .8px;
      transition: all .15s;
    }
    .sc-tab.on { border-color: #FF5500; color: #FF5500; background: #1a0800; }
    .sc-painel-section { margin-top: 4px; }
    .sc-upload-box {
      border: 1px dashed #222;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
      cursor: pointer;
      transition: border .2s;
      margin-top: 6px;
    }
    .sc-upload-box:hover { border-color: #FF5500; }
    .sc-upload-box strong { color: #FF5500; display: block; font-size: 12px; margin-bottom: 2px; }
    .sc-upload-box p { color: #444; font-size: 11px; }
    .sc-bg-individual { pointer-events: none; }
  `;
  document.head.appendChild(style);
})();
