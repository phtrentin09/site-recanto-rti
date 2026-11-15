/* Recanto da Terceira Idade | site.js */
(function(){
  var ZAP = '5511947679804';
  var REVIEW = document.documentElement.hasAttribute('data-revisao');

  function $(s, c){ return (c||document).querySelector(s); }
  function $$(s, c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }

  /* rotas da versao de revisao (uma pagina so, troca pelo #) */
  function rota(){
    if(!REVIEW) return;
    var h = (location.hash || '#inicio').slice(1) || 'inicio';
    var alvo = $('[data-rota="'+h+'"]') || $('[data-rota="404"]');
    $$('[data-rota]').forEach(function(p){ p.hidden = (p !== alvo); });
    document.title = alvo.getAttribute('data-titulo') || document.title;
    var nome = alvo.getAttribute('data-menu');
    $$('.menu a').forEach(function(a){ a.classList.toggle('ativo', a.getAttribute('data-menu') === nome); });
    window.scrollTo(0,0);
    iniciar(alvo);
  }

  /* topo */
  var topo = $('.topo');
  window.addEventListener('scroll', function(){ topo && topo.classList.toggle('rolou', window.scrollY > 10); }, {passive:true});
  var bt = $('.abre-menu'), menu = $('.menu');
  if(bt){ bt.addEventListener('click', function(){ var a = menu.classList.toggle('aberto'); bt.setAttribute('aria-expanded', a); }); }
  $$('.menu a').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('aberto'); }); });

  function iniciar(raiz){
    if(raiz.__ok) return; raiz.__ok = true;

    /* aparecer ao rolar */
    var els = $$('.reveal', raiz);
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
      els.forEach(function(e){ io.observe(e); });
    } else els.forEach(function(e){ e.classList.add('in'); });

    /* contagem */
    $$('[data-conta]', raiz).forEach(function(el){
      var fim = +el.getAttribute('data-conta'), feito = false;
      var o = new IntersectionObserver(function(es){
        if(!es[0].isIntersecting || feito) return; feito = true;
        var t0 = performance.now();
        (function passo(t){ var k = Math.min(1,(t-t0)/1400); k = 1-Math.pow(1-k,3); el.firstChild.nodeValue = Math.round(fim*k); if(k<1) requestAnimationFrame(passo); })(t0);
      }, {threshold:.6});
      o.observe(el);
    });

    /* abas das modalidades */
    $$('.abas', raiz).forEach(function(grupo){
      var abas = $$('.aba', grupo);
      abas.forEach(function(a){ a.addEventListener('click', function(){
        abas.forEach(function(b){ var on = b === a; b.setAttribute('aria-selected', on); var p = document.getElementById(b.getAttribute('aria-controls')); if(p) p.hidden = !on; });
      }); });
    });

    /* trilho de fotos */
    $$('.trilho-wrap', raiz).forEach(function(w){
      var tr = $('.trilho', w);
      $$('.seta', w.parentNode).forEach(function(s){ s.addEventListener('click', function(){ tr.scrollBy({left: (s.dataset.dir === 'ant' ? -1 : 1) * tr.clientWidth * .7, behavior:'smooth'}); }); });
      var x0, s0, arr = false;
      tr.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse') return; arr = true; x0 = e.clientX; s0 = tr.scrollLeft; tr.style.scrollSnapType = 'none'; });
      window.addEventListener('pointermove', function(e){ if(arr) tr.scrollLeft = s0 - (e.clientX - x0); });
      window.addEventListener('pointerup', function(){ if(arr){ arr = false; tr.style.scrollSnapType = ''; } });
    });

    /* depoimentos */
    $$('.citacoes', raiz).forEach(function(c){
      var itens = $$('.citacao', c), pts = $$('.pontos button', c.parentNode), i = 0, timer;
      function ir(n){ i = (n + itens.length) % itens.length; itens.forEach(function(x,k){ x.classList.toggle('ativa', k===i); }); pts.forEach(function(x,k){ x.classList.toggle('ativo', k===i); }); }
      function auto(){ clearInterval(timer); timer = setInterval(function(){ ir(i+1); }, 7000); }
      pts.forEach(function(p,k){ p.addEventListener('click', function(){ ir(k); auto(); }); });
      ir(0); auto();
    });

    /* visor de fotos */
    var botoes = $$('.mosaico button', raiz);
    if(botoes.length){
      var v = $('.visor'), img = $('img', v), leg = $('.legenda', v), atual = 0;
      function abrir(n){ atual = (n + botoes.length) % botoes.length; var b = botoes[atual]; img.src = b.dataset.grande; img.alt = b.dataset.legenda; leg.textContent = b.dataset.legenda; v.classList.add('aberto'); document.body.style.overflow = 'hidden'; }
      function fechar(){ v.classList.remove('aberto'); document.body.style.overflow = ''; }
      botoes.forEach(function(b,k){ b.addEventListener('click', function(){ abrir(k); }); });
      $('.fechar', v).onclick = fechar; $('.ant', v).onclick = function(){ abrir(atual-1); }; $('.prox', v).onclick = function(){ abrir(atual+1); };
      v.onclick = function(e){ if(e.target === v) fechar(); };
      document.addEventListener('keydown', function(e){ if(!v.classList.contains('aberto')) return; if(e.key==='Escape') fechar(); if(e.key==='ArrowLeft') abrir(atual-1); if(e.key==='ArrowRight') abrir(atual+1); });
    }

    /* formularios abrem o WhatsApp com a mensagem pronta */
    $$('form[data-zap]', raiz).forEach(function(f){
      f.addEventListener('submit', function(e){
        e.preventDefault();
        var d = new FormData(f), linhas = [f.getAttribute('data-zap')];
        if(d.get('nome')) linhas.push('Meu nome: ' + d.get('nome'));
        if(d.get('telefone')) linhas.push('Telefone: ' + d.get('telefone'));
        if(d.get('modalidade')) linhas.push('Interesse: ' + d.get('modalidade'));
        if(d.get('mensagem')) linhas.push(d.get('mensagem'));
        var url = 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(linhas.join('\n'));
        var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
        var ok = $('.enviado', f); if(ok) ok.hidden = false;
      });
    });
  }

  if(REVIEW){ window.addEventListener('hashchange', rota); rota(); }
  else iniciar(document.body);
})();
