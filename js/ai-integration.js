/**
 * Integração com Claude API
 */

const AI = {
  /**
   * Chamar API Claude
   */
  async callAPI(body) {
    try {
      const response = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      return data;
    } catch (e) {
      console.error('Erro na API:', e);
      throw e;
    }
  },

  /**
   * Gerar sugestões de temas
   */
  async sugerirTemas() {
    const nicho = document.getElementById('nicho')?.value.trim() || 'criação de conteúdo';
    const chipsArea = document.getElementById('chipsArea');
    
    if (!chipsArea) return;
    chipsArea.innerHTML = '<div class="chips-msg">✦ Gerando ideias...</div>';
    
    try {
      const data = await this.callAPI({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Gere 8 temas para carrosseis virais no Instagram para o nicho de "${nicho}". Misture polêmicos, educativos e motivacionais. Responda SOMENTE JSON válido sem markdown: {"temas":["tema1","tema2",...]}` 
        }]
      });
      
      const text = data.content.map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
      const json = JSON.parse(text);
      
      chipsArea.innerHTML = '<div class="chips">' + 
        json.temas.map(tm => `<div class="chip" onclick="usarTema(this)">${tm}</div>`).join('') + 
        '</div>';
    } catch (e) {
      chipsArea.innerHTML = `<div class="chips-msg" style="color:#ff6b6b">Erro: ${e.message}</div>`;
    }
  },

  /**
   * Gerar carrossel completo
   */
  async gerar(tema, nicho, publico, tom, handle, numSlides, extras) {
    const prompt = `Você é um copywriter especialista em carrosseis virais para Instagram, adaptado para qualquer nicho.

Crie conteúdo para um carrossel com:
- Tema: "${tema}"
- Nicho: ${nicho}
- Público: ${publico}
- Tom: ${tom}
- Handle: ${handle}
- Slides de conteúdo: ${numSlides}
- Incluir: ${extras.join(', ') || 'só conteúdo'}

RESPONDA APENAS JSON VÁLIDO, sem markdown, sem texto fora do JSON:
{
  ${extras.includes('capa') ? `"capa":{"p1":"TÍTULO PRINCIPAL CAPS (max 4 palavras)","kw":"DESTAQUE EM LARANJA (max 3 palavras)","sub":"SUBTÍTULO CAPS (max 12 palavras)"},` : ''}
  "slides":[
    {"n":1,"tag":"texto curto handwritten","titulo":"PONTO IMPACTANTE CAPS (max 5 palavras)","desc":"explicação clara e direta (max 20 palavras)"}
  ]${extras.includes('like') ? `,
  "like":{"pre":"texto intro handwritten","main":"TEXTO PRINCIPAL CAPS","destaque":"PALAVRA DESTAQUE LARANJA","pill":"texto pílula pequena"}` : ''}${extras.includes('cta') ? `,
  "cta":{"pre":"intro handwritten curta","l1":"LINHA 1 CAPS","l2":"LINHA LARANJA CAPS","pill":"texto pílula curto","fim":"encerramento handwritten"}` : ''}
}`;

    const data = await this.callAPI({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = data.content.map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
    const json = JSON.parse(text);
    
    return json;
  },

  /**
   * Regenerar um slide individual
   */
  async regenerarSlide(slideIndex, tema, tom, publico) {
    const prompt = `Você é um copywriter expert em Instagram.

Regere APENAS um slide para este carrossel.
- Tema: "${tema}"
- Tom: ${tom}
- Público: ${publico}
- Este é o slide #${slideIndex}

Responda SOMENTE JSON:
{"tag":"handwritten (max 2 palavras)","titulo":"CAPS IMPACTANTE (max 5 palavras)","desc":"texto claro (max 20 palavras)"}`;

    const data = await this.callAPI({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = data.content.map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
    const json = JSON.parse(text);
    
    return json;
  },

  /**
   * Sugestão de texto para elemento
   */
  async sugerirTexto(context) {
    const prompt = `Sugira um texto curto para este contexto: ${context}. Responda apenas o texto, max 10 palavras.`;

    const data = await this.callAPI({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    });

    return data.content.map(i => i.text || '').join('').trim();
  }
};
