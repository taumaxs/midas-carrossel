/**
 * Sistema de Exportação - JPG, PNG, PDF, ZIP
 */

const Export = {
  /**
   * Exportar slide único em PNG
   */
  async exportPNG(slideElement, fileName) {
    try {
      const badge = slideElement.closest('.swrap').querySelector('.slide-badge');
      const buttons = slideElement.closest('.swrap').querySelectorAll('.btn-dl, .btn-edit');
      
      // Esconder elementos
      badge.style.display = 'none';
      buttons.forEach(b => b.style.display = 'none');
      
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      // Restaurar elementos
      badge.style.display = '';
      buttons.forEach(b => b.style.display = '');
      
      const a = document.createElement('a');
      a.download = fileName || 'slide.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      
      return true;
    } catch (e) {
      console.error('Erro ao exportar PNG:', e);
      showErr('Erro ao exportar PNG: ' + e.message);
      return false;
    }
  },

  /**
   * Exportar slide único em JPG
   */
  async exportJPG(slideElement, fileName) {
    try {
      const badge = slideElement.closest('.swrap').querySelector('.slide-badge');
      const buttons = slideElement.closest('.swrap').querySelectorAll('.btn-dl, .btn-edit');
      
      badge.style.display = 'none';
      buttons.forEach(b => b.style.display = 'none');
      
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      badge.style.display = '';
      buttons.forEach(b => b.style.display = '');
      
      const a = document.createElement('a');
      a.download = fileName || 'slide.jpg';
      a.href = canvas.toDataURL('image/jpeg', 0.95);
      a.click();
      
      return true;
    } catch (e) {
      console.error('Erro ao exportar JPG:', e);
      showErr('Erro ao exportar JPG: ' + e.message);
      return false;
    }
  },

  /**
   * Exportar todos os slides em PNG
   */
  async exportAllPNG() {
    try {
      const wraps = document.querySelectorAll('.swrap');
      let count = 0;
      
      for (let i = 0; i < wraps.length; i++) {
        const wrap = wraps[i];
        const slide = wrap.querySelector('.slide');
        const badge = wrap.querySelector('.slide-badge');
        const buttons = wrap.querySelectorAll('.btn-dl, .btn-edit');
        
        badge.style.display = 'none';
        buttons.forEach(b => b.style.display = 'none');
        
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        
        badge.style.display = '';
        buttons.forEach(b => b.style.display = '');
        
        const a = document.createElement('a');
        a.download = `slide-${String(i + 1).padStart(2, '0')}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        
        count++;
        await new Promise(r => setTimeout(r, 400));
      }
      
      showSuccess(`${count} slides exportados em PNG`);
      return true;
    } catch (e) {
      console.error('Erro ao exportar PNG:', e);
      showErr('Erro ao exportar: ' + e.message);
      return false;
    }
  },

  /**
   * Exportar todos os slides em ZIP
   */
  async exportZIP(formato = 'png') {
    try {
      const wraps = document.querySelectorAll('.swrap');
      const zip = new JSZip();
      const pasta = zip.folder('carrossel');
      
      for (let i = 0; i < wraps.length; i++) {
        const wrap = wraps[i];
        const slide = wrap.querySelector('.slide');
        const badge = wrap.querySelector('.slide-badge');
        const buttons = wrap.querySelectorAll('.btn-dl, .btn-edit');
        
        badge.style.display = 'none';
        buttons.forEach(b => b.style.display = 'none');
        
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: formato === 'jpg' ? '#ffffff' : null
        });
        
        badge.style.display = '';
        buttons.forEach(b => b.style.display = '');
        
        const dataUrl = canvas.toDataURL(`image/${formato}`, formato === 'jpg' ? 0.95 : undefined);
        const base64 = dataUrl.split(',')[1];
        const ext = formato === 'jpg' ? 'jpg' : 'png';
        
        pasta.file(`slide-${String(i + 1).padStart(2, '0')}.${ext}`, base64, { base64: true });
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.download = `carrossel-${new Date().getTime()}.zip`;
      a.href = URL.createObjectURL(blob);
      a.click();
      
      showSuccess('Carrossel exportado em ZIP');
      return true;
    } catch (e) {
      console.error('Erro ao exportar ZIP:', e);
      showErr('Erro ao exportar: ' + e.message);
      return false;
    }
  },

  /**
   * Exportar em PDF (uma página por slide)
   */
  async exportPDF() {
    try {
      showErr('⏳ PDF em desenvolvimento... Use ZIP por enquanto');
      return false;
    } catch (e) {
      console.error('Erro ao exportar PDF:', e);
      return false;
    }
  }
};
