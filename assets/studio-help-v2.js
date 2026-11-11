const GUIDE='/images/guia-canva-1376.webp';
const GUIDE_SMALL='/images/guia-canva-688.webp';
const steps=[
 ['Abra seu template','Use o link recebido e escolha “Usar modelo” para abrir uma cópia no Canva.'],
 ['Edite os textos','Clique no texto para reescrever, trocar a fonte e ajustar o tamanho.'],
 ['Troque as fotos','Envie sua imagem e arraste-a para o quadro que deseja substituir.'],
 ['Escolha as cores','Selecione um elemento e use o seletor de cor para mudar o tom.'],
 ['Ajuste a composição','Arraste os elementos e suas bordas para mover ou redimensionar.'],
 ['Baixe sua arte','Em “Compartilhar”, escolha “Baixar” e selecione o formato adequado ao uso.']
];
function Icon({react,name,size=20}){const h=react.createElement;const paths={arrow:'M5 12h14m-6-6 6 6-6 6',expand:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6',close:'m6 6 12 12M6 18 18 6',plus:'M12 5v14M5 12h14',minus:'M5 12h14',book:'M12 6C8 3 4 3 2 4v15c3-1 6-1 10 2m0-15c4-3 8-3 10-2v15c-3-1-6-1-10 2V6',spark:'m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z'};return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.4,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:paths[name]||paths.arrow}));}
export function HelpNavLink({react,go,close}){const h=react.createElement;return h('a',{href:'/#ajuda',onClick:event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();close?.();const reveal=()=>{const section=document.getElementById('ajuda');if(section){history.replaceState({},'','/#ajuda');section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}};if(document.getElementById('ajuda'))reveal();else{go('/');requestAnimationFrame(()=>requestAnimationFrame(reveal));}}},'Ajuda');}
export function HelpSection({react,settings,loading=false}){
 const R=react,h=R.createElement,dialog=R.useRef(null),[opened,setOpened]=R.useState(false),[zoom,setZoom]=R.useState(1),[imageFailed,setImageFailed]=R.useState(false);
 R.useEffect(()=>{if(!opened)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[opened]);
 R.useEffect(()=>{if(!loading&&location.hash==='#ajuda')document.getElementById('ajuda')?.scrollIntoView({behavior:'instant'});},[loading]);
 const openGuide=()=>{setZoom(1);dialog.current?.showModal();setOpened(true);};
 const closeGuide=()=>dialog.current?.close();
 const phone=String(settings.whatsapp||'5519971036503').replace(/\D/g,'');
 const contact='https://wa.me/'+phone+'?text='+encodeURIComponent('Olá, Lucas! Vi o guia do site e tenho uma dúvida sobre a edição dos templates no Canva.');
 return h('section',{className:'template-help section',id:'ajuda','aria-labelledby':'help-title'},
  h('header',{className:'help-intro'},
    h('h2',{id:'help-title'},'Ajuda'),
    h('p',null,'Um template é um modelo editável. No Canva, você pode manter a composição e trocar textos, fotos e cores para criar seu próprio cardápio, post ou tabela de serviços.')),
  h('figure',{className:'help-guide'},
   imageFailed?h('div',{className:'help-image-fallback',role:'status'},'O guia não carregou. Você pode seguir as instruções em texto abaixo.'):
   h('button',{type:'button',className:'help-guide-image','aria-label':'Ampliar guia: como editar seu template no Canva',onClick:openGuide},h('img',{src:GUIDE,srcSet:GUIDE_SMALL+' 688w, '+GUIDE+' 1376w',sizes:'(max-width:760px) calc(100vw - 48px), (max-width:1400px) calc(100vw - 96px), 1280px',width:1376,height:768,loading:'lazy',decoding:'async',alt:'Guia visual com seis etapas para editar textos, fotos, cores e elementos de um template no Canva e baixar a arte.',onError:()=>setImageFailed(true)}),h('span',{className:'help-expand'},h(Icon,{react:R,name:'expand',size:18}))),
   h('figcaption',null,h('span',null,'Como editar seu template no Canva'),!imageFailed&&h('button',{type:'button',className:'help-text-button',onClick:openGuide},'Ampliar guia',h(Icon,{react:R,name:'expand',size:16})))),
  h('div',{className:'help-bottom'},h('div',{className:'help-questions'},
   h('details',null,h('summary',null,'Passo a passo em texto',h('span',{'aria-hidden':true},'+')),h('ol',{className:'help-text-steps'},...steps.map(([title,text])=>h('li',{key:title},h('strong',null,title),h('p',null,text))))),
   h('details',null,h('summary',null,'Preciso saber design para editar?',h('span',{'aria-hidden':true},'+')),h('p',null,'Você pode começar pelas alterações básicas: trocar um texto, uma foto ou uma cor. O modelo mantém a organização visual, e o guia mostra o caminho para fazer cada ajuste.')),
   h('details',null,h('summary',null,'Preciso de uma conta Canva Pro?',h('span',{'aria-hidden':true},'+')),h('p',null,'Depende dos elementos usados no modelo. Confira a descrição do produto. Recursos Pro podem exigir uma assinatura do Canva ou a substituição por elementos gratuitos.'))),
   h('aside',{className:'help-contact'},h('a',{href:contact,target:'_blank',rel:'noopener noreferrer'},'Pergunte ao Lucas pelo WhatsApp',h(Icon,{react:R,name:'arrow',size:18})))),
  h('dialog',{ref:dialog,className:'guide-dialog','aria-labelledby':'guide-dialog-title',onClose:()=>{setOpened(false);setZoom(1);},onClick:event=>{if(event.target===event.currentTarget)closeGuide();}},
   h('div',{className:'guide-dialog-shell'},h('header',{className:'guide-dialog-header'},h('div',null,h('h2',{id:'guide-dialog-title'},'Guia de edição no Canva'),h('p',null,'Amplie e deslize para ler cada detalhe.')),
    h('button',{type:'button',className:'guide-icon-button','aria-label':'Fechar guia',onClick:closeGuide,autoFocus:true},h(Icon,{react:R,name:'close',size:21}))),
    h('div',{className:'guide-viewport',tabIndex:0,'aria-label':'Guia ampliado; use a rolagem para explorar a imagem'},h('img',{src:opened?GUIDE:undefined,alt:'Como editar seu template no Canva: abrir modelo, editar texto, trocar fotos, escolher cores, ajustar elementos e baixar.',width:1376,height:768,decoding:'async',style:{width:(zoom*100)+'%'},draggable:false})),
    h('div',{className:'guide-toolbar'},h('button',{type:'button',className:'guide-icon-button','aria-label':'Diminuir guia',disabled:zoom<=1,onClick:()=>setZoom(value=>Math.max(1,value-.5))},h(Icon,{react:R,name:'minus',size:18})),h('output',{'aria-live':'polite','aria-label':'Ampliação do guia'},Math.round(zoom*100)+'%'),h('button',{type:'button',className:'guide-icon-button','aria-label':'Aumentar guia',disabled:zoom>=4,onClick:()=>setZoom(value=>Math.min(4,value+.5))},h(Icon,{react:R,name:'plus',size:18})),h('button',{type:'button',className:'guide-fit-button',onClick:()=>setZoom(1)},'Ajustar à tela'))))
 );
}
