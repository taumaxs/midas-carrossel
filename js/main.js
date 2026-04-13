/**
 * Lógica Principal do Midas Carrossel
 */

// Estado global
const estado = {
  numSlides: 4,
  fundo: 'cor',
  fundoCor: '#0d0d0d',
  imgs: [],
  formato: '1-1',
  incCapa: true,
  incCta: true,
  incLike: false,
  slidesData: null,
  projetoAtual: null,
  nicho: '',
  tema: '',
  publico: '',
  tom: 'direto e provocativo'
};

// Carregar estado ao iniciar
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  Editor.init();
  initUI();
  loadNicho();
});

/**
 * Inicializar UI
 */
function initUI() {
  // Formato
  setFmt(estado.formato);
  
  // Fundo
  document.getElementById('cor').value = estado.fundoCor;
  
  // Slides
  document.getElementById('cv').textContent = estado.numSlides;
  updateTotal();
  
  // Toggles
  updateToggles();
}

/**
 * TELA INICIAL - Sistema de Nichos
 */
function loadNicho() {
  const nicho = Storage.getNicho();
  if (!nicho) {
    showNichoSelector();
  } else {
    estado.nicho = nicho;
    document.getElementById('nicho').value = nicho;
  }
}

function showNichoSelector() {
  const modal = document.createElement('div');
  modal.id = 'nichoModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  const nichos = ['Instagram', 'E-commerce', 'Blog', 'Educação', 'Saúde', 'Tecnologia', 'Moda', 'Finanças', 'Fitness', 'Outro'];
  
  let html = `
    <div style="background:#111; border:1px solid #222; border-radius:12px; padding:40px; max-width:400px; text-align:center;">
      <h2 style="font-size:28px; margin-bottom:20px; color:#fff;">Qual é seu nicho?</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
  `;
  
  nichos.forEach(n => {
    html += `<button class="chip" style="padding:12px; cursor:pointer;" onclick="selecionarNicho('${n}')">${n}</button>`;
  });
  
  html += `
      </div>
      <div style="margin-top:20px;">
        <input type="text" id="nichoCustom" placeholder="Ou digite seu nicho..." style="width:100%; padding:10px; border:1px solid #222; border-radius:8px; background:#0d0d0d; color:#fff; font-size:14px;">
        <button onclick="selecionarNicho(document.getElementById('nichoCustom').value)" style="width:100%; margin-top:10px; padding:10px; background:#FF5500; border:none; border-radius:8px; color:#fff; cursor:pointer; font-weight:bold;">Confirmar</button>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

function selecionarNicho(nicho) {
  if (!nicho || nicho.trim() === '') {
    showErr('Por favor, selecione um nicho');
    return;
  }
  
  estado.nicho = nicho;
  Storage.setNicho(nicho);
  document.getElementById('nicho').value = nicho;
  
  const modal = document.getElementById('nichoModal');
  if (modal) {
    modal.remove();
  }
  
  showSuccess(`Nicho selecionado: ${nicho}`);
}

/**
 * CONTROLES DE SLIDES
 */
function chg(d) {
  estado.numSlides = Math.max(1, Math.min(9, estado.numSlides + d));
  document.getElementById('cv').textContent = estado.numSlides;
  updateTotal();
  saveState();
}

function updateTotal() {
  let total = estado.numSlides;
  if (estado.incCapa) total++;
  if (estado.incCta) total++;
  if (estado.incLike) total++;
  document.getElementById('tot').textContent = total;
}

/**
 * FORMATO
 */
function setFmt(f) {
  estado.formato = f;
  document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('on'));
  document.getElementById('fmt-' + f)?.classList.add('on');
  saveState();
}

/**
 * FUNDO
 */
function setF(t) {
  estado.fundo = t;
  ['cor', 'up', 'ia'].forEach(x => {
    document.getElementById('tab-' + x)?.classList.toggle('on', x === t);
    document.getElementById('p-' + x)?.classList.toggle('on', x === t);
  });
}

function setCor(v) {
  estado.fundoCor = v;
  document.getElementById('cor').value = v;
  saveState();
}

function onUpload(e) {
  estado.imgs = [];
  document.getElementById('thumbs').innerHTML = '';
  
  Array.from(e.target.files).forEach((f, i) => {
    const u = URL.createObjectURL(f);
    estado.imgs.push(u);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb-wrapper';
    wrapper.innerHTML = `
      <img src="${u}" class="thumb" draggable="true" data-index="${i}">
      <button class="thumb-delete" onclick="deleteImage(${i})">×</button>
    `;
    
    document.getElementById('thumbs').appendChild(wrapper);
  });
  
  saveState();
}

function deleteImage(index) {
  estado.imgs.splice(index, 1);
  document.querySelectorAll('.thumb-wrapper').forEach((el, i) => {
    if (i === index) el.remove();
  });
  saveState();
}

/**
 * TOGGLES
 */
function togSlide(t) {
  if (t === 'capa') {
    estado.incCapa = !estado.incCapa;
    document.getElementById('tog-capa')?.classList.toggle('on', estado.incCapa);
  } else if (t === 'cta') {
    estado.incCta = !estado.incCta;
    document.getElementById('tog-cta')?.classList.toggle('on', estado.incCta);
  } else {
    estado.incLike = !estado.incLike;
    document.getElementById('tog-like')?.classList.toggle('on', estado.incLike);
  }
  updateTotal();
  saveState();
}

function updateToggles() {
  document.getElementById('tog-capa')?.classList.toggle('on', estado.incCapa);
  document.getElementById('tog-cta')?.classList.toggle('on', estado.incCta);
  document.getElementById('tog-like')?.classList.toggle('on', estado.incLike);
}

/**
 * USAR TEMA
 */
function usarTema(el) {
  document.getElementById('tema').value = el.textContent;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}

/**
 * GERAR CARROSSEL
 */
async function gerar() {
  const tema = document.getElementById('tema').value.trim();
  const nicho = document.getElementById('nicho').value.trim() || estado.nicho || 'geral';
  const pub = document.getElementById('publico').value.trim() || 'pessoas interessadas';
  const tom = document.getElementById('tom').value;
  const handle = document.getElementById('handle').value.trim() || '@suamarca';
  
  if (!tema) {
    showErr('⚠️ Digite o tema primeiro!');
    return;
  }
  
  document.getElementById('btnG').disabled = true;
  document.getElementById('load').style.display = 'block';
  document.getElementById('outArea').style.display = 'none';
  
  const extras = [];
  if (estado.incCapa) extras.push('capa');
  if (estado.incLike) extras.push('like');
  if (estado.incCta) extras.push('cta');
  
  try {
    const slidesData = await AI.gerar(tema, nicho, pub, tom, handle, estado.numSlides, extras);
    estado.slidesData = slidesData;
    
    // Salvar no histórico
    Storage.addHistorico(tema, estado, slidesData);
    
    renderSlides(slidesData, handle);
  } catch (e) {
    showErr('⚠️ ' + e.message);
  } finally {
    document.getElementById('btnG').disabled = false;
    document.getElementById('load').style.display = 'none';
  }
}

/**
 * SUGERIR TEMAS
 */
async function sugerirTemas() {
  await AI.sugerirTemas();
}

/**
 * RENDERIZAR SLIDES
 */
function renderSlides(d, handle) {
  const g = document.getElementById('sgrid');
  g.innerHTML = '';
  const ar = arClass();
  let idx = 0;
  const total = (estado.incCapa ? 1 : 0) + estado.numSlides + (estado.incLike ? 1 : 0) + (estado.incCta ? 1 : 0);
  
  document.getElementById('outN').textContent = total;
  
  // CAPA
  if (estado.incCapa && d.capa) {
    idx++;
    const c = d.capa;
    const bg = getBg(0);
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-capa ${ar}">
        ${bg}
        <div class="ovl"></div>
        <div class="topbar"><span>${handle}</span><span class="tmid">✦</span><span style="font-size:10px">2026</span></div>
        <svg class="arr-svg" width="38" height="50" viewBox="0 0 38 50" fill="none">
          <path d="M5 5 Q28 14 30 38" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".5"/>
          <path d="M22 31 L30 38 L24 45" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".5"/>
        </svg>
        <div class="body">
          <div class="handle" contenteditable="true" spellcheck="false">${handle}</div>
          <div class="h1" contenteditable="true" spellcheck="false">${c.p1}<br><span class="kw" contenteditable="true" spellcheck="false">${c.kw}</span></div>
          <div class="sub" contenteditable="true" spellcheck="false">${c.sub}</div>
        </div>
      </div>
    `, idx);
  }
  
  // CONTEÚDO
  d.slides.forEach((s, i) => {
    idx++;
    const bg = getBg(idx - 1);
    const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
    const stc = hasImg ? '#fff' : tc();
    const smc = hasImg ? 'rgba(255,255,255,.65)' : mc();
    
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-cont ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
        ${bg}
        ${hasImg ? '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.1) 60%);z-index:1"></div>' : ''}
        <div class="bnum">${String(s.n).padStart(2, '0')}</div>
        <div class="body">
          <div class="stag" contenteditable="true" spellcheck="false">${s.tag}</div>
          <div class="sline"></div>
          <div class="stitle" style="color:${stc}" contenteditable="true" spellcheck="false">${s.titulo}</div>
          <div class="sdesc" style="color:${smc}" contenteditable="true" spellcheck="false">${s.desc}</div>
        </div>
      </div>
    `, idx);
  });
  
  // LIKE
  if (estado.incLike && d.like) {
    idx++;
    const lk = d.like;
    const bg = getBg(idx - 1);
    const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
    
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-cta ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
        ${bg}
        ${hasImg ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:1"></div>' : ''}
        <div class="body">
          <div class="cpre" contenteditable="true" spellcheck="false">${lk.pre}</div>
          <div class="cmain" style="color:${hasImg ? '#fff' : tc()}" contenteditable="true" spellcheck="false">${lk.main}<br><span class="cred" contenteditable="true" spellcheck="false">${lk.destaque}</span></div>
          <div class="cpill" contenteditable="true" spellcheck="false">${lk.pill}</div>
          <div class="cbora">❤️</div>
        </div>
      </div>
    `, idx);
  }
  
  // CTA
  if (estado.incCta && d.cta) {
    idx++;
    const ct = d.cta;
    const bg = getBg(idx - 1);
    const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
    
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-cta ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
        ${bg}
        ${hasImg ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:1"></div>' : ''}
        <div class="body">
          <div class="cpre" contenteditable="true" spellcheck="false">${ct.pre}</div>
          <div class="cmain" style="color:${hasImg ? '#fff' : tc()}" contenteditable="true" spellcheck="false">${ct.l1}<br><span class="cred" contenteditable="true" spellcheck="false">${ct.l2}</span></div>
          <div class="cpill" contenteditable="true" spellcheck="false">${ct.pill}</div>
          <div class="cbora" contenteditable="true" spellcheck="false">${ct.fim} →</div>
        </div>
      </div>
    `, idx);
  }
  
  document.getElementById('outArea').style.display = 'block';
  setTimeout(() => {
    document.getElementById('outArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * SLIDE WRAPPER
 */
function slideWrap(idx, total, inner, n) {
  return `<div class="swrap" id="slide-wrap-${n}">
    <div class="slide-badge">${idx} / ${total}</div>
    ${inner}
    <div class="slide-actions">
      <button class="btn-dl" onclick="dlSlide(${n})" title="Baixar slide em PNG">⬇ PNG</button>
      <button class="btn-dl btn-delete-slide" onclick="deleteSlideWithConfirm(${n})" title="Deletar este slide">🗑 Deletar</button>
    </div>
  </div>`;
}

/**
 * Deletar slide com confirmação
 */
function deleteSlideWithConfirm(slideIndex) {
  if (confirm('⚠️ Tem certeza que quer deletar este slide? Esta ação não pode ser desfeita.')) {
    deleteSlide(slideIndex);
  }
}

/**
 * Deletar slide
 */
function deleteSlide(slideIndex) {
  if (!estado.slidesData || !estado.slidesData.slides) return;
  
  // Remover o slide do array
  const slideNum = slideIndex - (estado.incCapa ? 2 : 1);
  
  if (slideNum >= 0 && slideNum < estado.slidesData.slides.length) {
    estado.slidesData.slides.splice(slideNum, 1);
    
    // Re-numerar os slides
    estado.slidesData.slides.forEach((slide, idx) => {
      slide.n = idx + 1;
    });
    
    updateTotal();
    
    // Re-renderizar
    const handle = document.getElementById('handle').value.trim() || '@suamarca';
    renderSlidesManual(estado.slidesData, handle);
    renderSlides(estado.slidesData, handle);
    
    // Fechar editor se aberto
    if (typeof Editor !== 'undefined' && Editor.closePanel) {
      Editor.closePanel();
    }
    
    // Salvar histórico
    if (typeof History !== 'undefined') {
      History.saveState('Slide ' + slideIndex + ' deletado');
    }
    
    saveState();
    showSuccess('✓ Slide deletado!');
  }
}

/**
 * HELPERS
 */
function getBg(i) {
  if (estado.fundo === 'up' && estado.imgs[i]) {
    return `<img src="${estado.imgs[i]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0" crossorigin="anonymous"/>`;
  }
  const c = estado.fundoCor;
  if (i === 0 && estado.incCapa) {
    return `<div style="position:absolute;inset:0;background:linear-gradient(150deg,${c} 0%,${shift(c, 40)} 50%,${c} 100%);z-index:0"></div>`;
  }
  return `<div style="position:absolute;inset:0;background:${c};z-index:0"></div>`;
}

/**
 * DOWNLOAD
 */
async function dlSlide(n) {
  let el;
  
  if (n === 'handle') {
    el = document.getElementById('slide-handle')?.querySelector('.slide');
  } else {
    el = document.getElementById('slide-wrap-' + n)?.querySelector('.slide');
  }
  
  if (!el) return;
  await Export.exportPNG(el, `slide-${n}.png`);
}

async function dlZip() {
  await Export.exportZIP('png');
}

async function dlTodos() {
  await Export.exportAllPNG();
}

/**
 * FAVORITOS
 */
function saveFavorito() {
  const nome = prompt('Nome do favorito:');
  if (!nome) return;
  
  if (estado.slidesData) {
    const id = Storage.addFavorito(nome, estado.slidesData, estado);
    if (id) {
      showSuccess('✓ Salvo como favorito!');
    } else {
      showErr('Erro ao salvar');
    }
  } else {
    showErr('Gere um carrossel primeiro');
  }
}

function loadFavorito(id) {
  const fav = Storage.getFavoritos().find(f => f.id === id);
  if (fav) {
    Object.assign(estado, fav.config);
    estado.slidesData = fav.slides;
    renderSlides(fav.slides, fav.config.handle || '@suamarca');
    showSuccess('✓ Favorito carregado!');
  }
}

/**
 * PROJETOS
 */
function saveProject() {
  const nome = prompt('Nome do projeto:');
  if (!nome) return;
  
  if (estado.slidesData) {
    const id = Storage.saveProject(nome, estado.slidesData, estado);
    if (id) {
      estado.projetoAtual = id;
      showSuccess('✓ Projeto salvo!');
    }
  } else {
    showErr('Gere um carrossel primeiro');
  }
}

function loadProject(id) {
  const proj = Storage.getProject(id);
  if (proj) {
    Object.assign(estado, proj.config);
    estado.slidesData = proj.slides;
    estado.projetoAtual = id;
    renderSlides(proj.slides, proj.config.handle || '@suamarca');
    initUI();
    showSuccess('✓ Projeto carregado!');
  }
}


/**
 * FASE 1 - ADICIONAR ELEMENTOS PRONTOS (SEM GERAR COM IA)

/**
 * RENDERIZAR SLIDES NA ABA MANUAL
 */
function renderSlidesManual(d, handle = '@suamarca') {
  const g = document.getElementById('manualSgrid');
  if (!g) return;
  
  g.innerHTML = '';
  const ar = arClass();
  let idx = 0;
  const total = (estado.incCapa ? 1 : 0) + estado.numSlides + (estado.incLike ? 1 : 0) + (estado.incCta ? 1 : 0);
  
  document.getElementById('manualOutN').textContent = total;
  
  // CAPA
  if (estado.incCapa && d.capa) {
    idx++;
    const c = d.capa;
    const bg = getBg(0);
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-capa ${ar}">
        ${bg}
        <div class="ovl"></div>
        <div class="topbar"><span>${handle}</span><span class="tmid">✦</span><span style="font-size:10px">2026</span></div>
        <svg class="arr-svg" width="38" height="50" viewBox="0 0 38 50" fill="none">
          <path d="M5 5 Q28 14 30 38" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".5"/>
          <path d="M22 31 L30 38 L24 45" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".5"/>
        </svg>
        <div class="body">
          <div class="handle" contenteditable="true" spellcheck="false">${handle}</div>
          <div class="h1" contenteditable="true" spellcheck="false">${c.p1}<br><span class="kw" contenteditable="true" spellcheck="false">${c.kw}</span></div>
          <div class="sub" contenteditable="true" spellcheck="false">${c.sub}</div>
        </div>
      </div>
    `, idx);
  }
  
  // CONTEÚDO
  if (d.slides) {
    d.slides.forEach((s, i) => {
      idx++;
      const bg = getBg(idx - 1);
      const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
      const stc = hasImg ? '#fff' : tc();
      const smc = hasImg ? 'rgba(255,255,255,.65)' : mc();
      
      g.innerHTML += slideWrap(idx, total, `
        <div class="slide s-cont ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
          ${bg}
          ${hasImg ? '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.1) 60%);z-index:1"></div>' : ''}
          <div class="bnum">${String(s.n).padStart(2, '0')}</div>
          <div class="body">
            <div class="stag" contenteditable="true" spellcheck="false">${s.tag}</div>
            <div class="sline"></div>
            <div class="stitle" style="color:${stc}" contenteditable="true" spellcheck="false">${s.titulo}</div>
            <div class="sdesc" style="color:${smc}" contenteditable="true" spellcheck="false">${s.desc}</div>
          </div>
        </div>
      `, idx);
    });
  }
  
  // LIKE
  if (estado.incLike && d.like) {
    idx++;
    const lk = d.like;
    const bg = getBg(idx - 1);
    const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
    
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-cta ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
        ${bg}
        ${hasImg ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:1"></div>' : ''}
        <div class="body">
          <div class="cpre" contenteditable="true" spellcheck="false">${lk.pre}</div>
          <div class="cmain" style="color:${hasImg ? '#fff' : tc()}" contenteditable="true" spellcheck="false">${lk.main}<br><span class="cred" contenteditable="true" spellcheck="false">${lk.destaque}</span></div>
          <div class="cpill" contenteditable="true" spellcheck="false">${lk.pill}</div>
          <div class="cbora">❤️</div>
        </div>
      </div>
    `, idx);
  }
  
  // CTA
  if (estado.incCta && d.cta) {
    idx++;
    const ct = d.cta;
    const bg = getBg(idx - 1);
    const hasImg = estado.fundo === 'up' && estado.imgs[idx - 1];
    
    g.innerHTML += slideWrap(idx, total, `
      <div class="slide s-cta ${ar}" style="background:${estado.fundo === 'cor' ? estado.fundoCor : '#0d0d0d'}">
        ${bg}
        ${hasImg ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:1"></div>' : ''}
        <div class="body">
          <div class="cpre" contenteditable="true" spellcheck="false">${ct.pre}</div>
          <div class="cmain" style="color:${hasImg ? '#fff' : tc()}" contenteditable="true" spellcheck="false">${ct.l1}<br><span class="cred" contenteditable="true" spellcheck="false">${ct.l2}</span></div>
          <div class="cpill" contenteditable="true" spellcheck="false">${ct.pill}</div>
          <div class="cbora" contenteditable="true" spellcheck="false">${ct.fim} →</div>
        </div>
      </div>
    `, idx);
  }
  
  document.getElementById('manualOutArea').style.display = 'block';
}

/**
 * FASE 1 - ADICIONAR ELEMENTOS PRONTOS (SEM GERAR COM IA)
 */

// Inicializar estado de slides vazios
function inicializarSlides() {
  if (!estado.slidesData) {
    estado.slidesData = {
      slides: []
    };
  }
}

// Adicionar Capa Pronta
function adicionarCapaPronta() {
  inicializarSlides();
  
  estado.slidesData.capa = {
    p1: 'TÍTULO PRINCIPAL',
    kw: 'DESTAQUE',
    sub: 'SUBTÍTULO'
  };
  
  // Atualizar toggle e total
  estado.incCapa = true;
  updateToggles();
  updateTotal();
  
  renderSlidesManual(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ Capa adicionada!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Capa adicionada');
  }
}

// Adicionar Slide de Texto
function adicionarTexto() {
  inicializarSlides();
  
  const novoSlide = {
    n: estado.slidesData.slides.length + 1,
    tag: 'novo texto',
    titulo: 'TEXTO PRINCIPAL',
    desc: 'Descrição do slide'
  };
  
  estado.slidesData.slides.push(novoSlide);
  updateTotal();
  
  renderSlidesManual(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ Slide de texto adicionado!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Slide de texto adicionado');
  }
}

// Adicionar Slide com Imagem
function adicionarImagem() {
  inicializarSlides();
  
  const novoSlide = {
    n: estado.slidesData.slides.length + 1,
    tag: 'imagem',
    titulo: 'COM IMAGEM',
    desc: 'Upload sua imagem de fundo'
  };
  
  estado.slidesData.slides.push(novoSlide);
  updateTotal();
  
  renderSlidesManual(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ Slide com imagem adicionado!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Slide com imagem adicionado');
  }
}

// Adicionar Handle/Marca
function adicionarHandle() {
  inicializarSlides();
  
  estado.slidesData.handle = {
    handle: document.getElementById('handle').value.trim() || '@suamarca',
    logo: '',
    cor: '#FF5500'
  };
  
  // Renderizar como slide especial
  const handle = estado.slidesData.handle.handle;
  const ar = arClass();
  
  const g = document.getElementById('manualSgrid');
  if (!g.innerHTML.includes('slide-handle')) {
    const slideHTML = `<div class="swrap" id="slide-handle">
      <div class="slide-badge">Handle</div>
      <div class="slide s-handle ${ar}" style="background:${estado.fundoCor}">
        <div style="position:absolute;inset:0;background:linear-gradient(150deg,${estado.fundoCor} 0%,${shift(estado.fundoCor, 40)} 50%,${estado.fundoCor} 100%);z-index:0"></div>
        <div class="body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">
          <div style="text-align:center;">
            <div class="handle" contenteditable="true" spellcheck="false" style="font-size:32px;color:#fff;font-weight:bold;">${handle}</div>
          </div>
          <div style="width:100px;height:100px;background:#333;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;cursor:pointer;text-align:center;" contenteditable="true" spellcheck="false">Logo/Marca</div>
          <input type="color" style="cursor:pointer;width:80px;height:40px;border:none;border-radius:8px;" value="#FF5500" onchange="atualizarCorHandle(this.value)"/>
        </div>
      </div>
      <button class="btn-dl" onclick="dlSlide('handle')" title="Baixar slide em PNG">⬇ PNG</button>
    </div>`;
    
    g.innerHTML = slideHTML + g.innerHTML;
  }
  
  document.getElementById('manualOutArea').style.display = 'block';
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ Slide de Handle/Marca adicionado!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Slide de Handle/Marca adicionado');
  }
}

function atualizarCorHandle(cor) {
  const slide = document.getElementById('slide-handle')?.querySelector('.slide');
  if (slide) {
    slide.style.background = cor;
  }
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Cor do Handle alterada');
  }
}

// Adicionar CTA
function adicionarCTA() {
  inicializarSlides();
  
  estado.slidesData.cta = {
    pre: 'confira este',
    l1: 'CALL TO ACTION',
    l2: 'PRINCIPAL',
    pill: 'saiba mais',
    fim: 'acesse agora'
  };
  
  estado.incCta = true;
  updateToggles();
  updateTotal();
  
  renderSlidesManual(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ CTA adicionado!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('CTA adicionado');
  }
}

// Adicionar Like
function adicionarLike() {
  inicializarSlides();
  
  estado.slidesData.like = {
    pre: 'você vai gostar',
    main: 'TEXTO PRINCIPAL',
    destaque: 'DESTAQUE',
    pill: 'saiba mais'
  };
  
  estado.incLike = true;
  updateToggles();
  updateTotal();
  
  renderSlidesManual(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
  document.getElementById('manualOutArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showSuccess('✓ Slide de Like adicionado!');
  saveState();
  
  // Salvar histórico
  if (typeof History !== 'undefined') {
    History.saveState('Slide de Like adicionado');
  }
}

// Limpar todos os slides
function limparSlides() {
  if (confirm('Tem certeza que quer limpar todos os slides?')) {
    estado.slidesData = {
      slides: []
    };
    estado.incCapa = false;
    estado.incCta = false;
    estado.incLike = false;
    updateToggles();
    updateTotal();
    
    // Limpar ambas as abas
    const g1 = document.getElementById('sgrid');
    if (g1) g1.innerHTML = '';
    
    const g2 = document.getElementById('manualSgrid');
    if (g2) g2.innerHTML = '';
    
    const outArea1 = document.getElementById('outArea');
    if (outArea1) outArea1.style.display = 'none';
    
    const outArea2 = document.getElementById('manualOutArea');
    if (outArea2) outArea2.style.display = 'none';
    
    showSuccess('✓ Slides limpos!');
    saveState();
  }
}

/**
 * FORMATO COM DROPDOWN E CUSTOM
 */
function setFmtDropdown(fmt) {
  if (fmt === 'custom') {
    document.getElementById('customFormatField').style.display = 'block';
  } else {
    document.getElementById('customFormatField').style.display = 'none';
    setFmt(fmt);
  }
  document.getElementById('formatoSelect').value = fmt;
}

function setCustomFormat(ratio) {
  if (ratio.trim()) {
    estado.formato = ratio;
    saveState();
    
    // Atualizar todos os slides se existirem
    if (estado.slidesData) {
      renderSlides(estado.slidesData, document.getElementById('handle').value.trim() || '@suamarca');
    }
    showSuccess(`✓ Formato alterado para ${ratio}!`);
  }
}