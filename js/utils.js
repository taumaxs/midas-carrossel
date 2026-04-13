/**
 * Utilitários - Funções auxiliares
 */

function showErr(message) {
  const errBox = document.getElementById('errBox');
  if (!errBox) return;
  errBox.innerHTML = message;
  errBox.classList.add('show');
  setTimeout(() => errBox.classList.remove('show'), 9000);
}

function showSuccess(message) {
  const errBox = document.getElementById('errBox');
  if (!errBox) return;
  errBox.innerHTML = `<span style="color: #4ade80;">✓ ${message}</span>`;
  errBox.classList.add('show');
  setTimeout(() => errBox.classList.remove('show'), 5000);
}

function arClass() {
  return 'ar-' + estado.formato;
}

function shift(hex, amount) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 255) + amount);
    const g = Math.min(255, ((num >> 8) & 255) + Math.floor(amount / 2));
    const b = Math.min(255, (num & 255) + Math.floor(amount / 3));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch {
    return hex;
  }
}

function isLight(hex) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 150;
  } catch {
    return false;
  }
}

function tc() {
  return isLight(estado.fundoCor) ? '#111' : '#fff';
}

function mc() {
  return isLight(estado.fundoCor) ? '#444' : '#888';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function debounce(func, delay) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess('Copiado!');
  }).catch(() => {
    showErr('Erro ao copiar');
  });
}

/**
 * Salvar estado em localStorage
 */
function saveState() {
  try {
    localStorage.setItem('midas-state', JSON.stringify(estado));
  } catch (e) {
    console.error('Erro ao salvar estado:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('midas-state');
    if (saved) {
      Object.assign(estado, JSON.parse(saved));
    }
  } catch (e) {
    console.error('Erro ao carregar estado:', e);
  }
}
