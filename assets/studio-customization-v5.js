import {FireworkBurst} from "./studio-ambient-v1.js";
// Shared by the storefront and the protected settings editor. No credentials.
const themes = ['classic', 'christmas', 'newyear'];
let current = {watermarkEnabled:true, watermarkOpacity:22, watermarkStyle:'diagonal'};
const cache = new Map();
export function normalize(s={}) {
  return {...s, theme:themes.includes(s.theme)?s.theme:'classic', watermarkEnabled:s.watermarkEnabled!==false,
    watermarkOpacity:Math.min(45,Math.max(10,Number(s.watermarkOpacity)||22)),
    watermarkStyle:s.watermarkStyle==='corner'?'corner':'diagonal', gridColumns:s.gridColumns===3?3:2, cardRadius:[8,16,24].includes(s.cardRadius)?s.cardRadius:16, density:s.density==='compact'?'compact':'airy', heroSize:s.heroSize==='compact'?'compact':'full', seasonalIcons:s.seasonalIcons!==false, promotionStyle:s.promotionStyle==='ribbon'?'ribbon':'badge'};
}
export function applyAppearance(settings) {
  const next=normalize(settings);
  const root=document.documentElement;
  root.dataset.studioTheme=next.theme;
  root.dataset.studioColumns=next.gridColumns;
  root.dataset.studioDensity=next.density;
  root.dataset.studioHero=next.heroSize;
  root.dataset.promotionStyle=next.promotionStyle;
  root.style.setProperty('--studio-radius',next.cardRadius+'px');
  const changed=['watermarkEnabled','watermarkOpacity','watermarkStyle'].some(k=>current[k]!==next[k]);
  current=next;
  if(changed) window.dispatchEvent(new Event('studio-watermark'));
}
export async function watermarked(src) {
  const options={...current};
  if(!options.watermarkEnabled) return src;
  const key=JSON.stringify([src,options.watermarkOpacity,options.watermarkStyle]);
  if(cache.has(key)) return cache.get(key);
  const task=(async()=>{
    const img=new Image(); img.crossOrigin='anonymous'; img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});
    const scale=Math.min(1,2000/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');if(!ctx) throw Error('Canvas indisponível');
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const size=Math.max(16,Math.round(canvas.width*.052));
    ctx.font=`600 ${size}px Manrope, Arial, sans-serif`;ctx.textBaseline='middle';
    ctx.fillStyle=`rgba(255,255,255,${options.watermarkOpacity/100})`;
    ctx.strokeStyle=`rgba(29,32,41,${options.watermarkOpacity/180})`;ctx.lineWidth=Math.max(1,size*.025);
    const draw=(x,y)=>{ctx.strokeText('Lucas Design',x,y);ctx.fillText('Lucas Design',x,y);};
    if(options.watermarkStyle==='corner') {ctx.textAlign='right';draw(canvas.width-size*.7,canvas.height-size*1.1);}
    else {ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(-Math.PI/6);ctx.textAlign='center';
      const radius=Math.hypot(canvas.width,canvas.height);
      for(let y=-radius;y<radius;y+=size*4.5)for(let x=-radius;x<radius;x+=size*9)draw(x,y);}
    const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.88));
    if(!blob)throw Error('Não foi possível preparar a imagem');
    return URL.createObjectURL(blob);
  })();
  cache.set(key,task);
  task.catch(()=>cache.delete(key));
  // Keep a small set of decoded previews; original files stay untouched.
  if(cache.size>32){const first=cache.keys().next().value;const old=cache.get(first);cache.delete(first);old.then(url=>setTimeout(()=>URL.revokeObjectURL(url),60000)).catch(()=>{});}
  return task;
}
export function CustomizationPanel({settings,onChange,react}) {
  const h=react.createElement, s=normalize(settings);
  const [preview,setPreview]=react.useState('');
  const [previewError,setPreviewError]=react.useState(false);
  const [previewTheme,setPreviewTheme]=react.useState(null);
  react.useEffect(()=>{let active=true;const before={...current};current=s;
    watermarked('/images/burger-cover-thumb.webp').then(url=>{if(active){setPreview(url);setPreviewError(false);}}).catch(()=>{if(active)setPreviewError(true);});current=before;
    return()=>{active=false;};},[s.watermarkEnabled,s.watermarkOpacity,s.watermarkStyle]);
  const field=(label,child)=>h('label',{className:'field'},h('span',null,label),child);
  return h('div',{className:'studio-customization'},
    h('section',{className:'form-panel'},h('h2',null,'Temas sazonais'),
      h('p',{className:'muted'},'Escolha a identidade visual. A estrutura e os produtos são preservados.'),
      h('div',{className:'studio-theme-options'},...themes.map((id,i)=>h('button',{key:id,type:'button',className:'studio-theme-option '+(s.theme===id?'selected':''),'aria-pressed':s.theme===id,onClick:()=>onChange('theme',id)},h('span',{className:'studio-swatch '+id}),['Original','Natal','Ano Novo'][i]))),
      h('button',{type:'button',className:'secondary',onClick:()=>setPreviewTheme(previewTheme?null:s.theme)},previewTheme?'Encerrar prévia':'Pré-visualizar tema'),
      previewTheme&&h('div',{className:'studio-theme-preview',style:{background:s.theme==='newyear'?'#141a2c':s.theme==='christmas'?'#193f36':'#f3edf8',color:s.theme==='classic'?'#1d2029':'#fff5df'}},h(SeasonalDecor,{settings:s,react}),h('strong',null,'Lucas de Oliveira Gomes'),h('span',null,'Designer')),
      h('p',{className:'muted'},'Use “Salvar configurações” para aplicar aos visitantes.')),
    h('section',{className:'form-panel'},h('h2',null,'Layout e destaques'),
      h('div',{className:'fields-row'},
        field('Colunas no computador',h('select',{value:s.gridColumns,onChange:e=>onChange('gridColumns',Number(e.target.value))},h('option',{value:2},'2 colunas'),h('option',{value:3},'3 colunas'))),
        field('Cantos dos cards',h('select',{value:s.cardRadius,onChange:e=>onChange('cardRadius',Number(e.target.value))},...[8,16,24].map(v=>h('option',{key:v,value:v},v+' px')))),
        field('Espaçamento',h('select',{value:s.density,onChange:e=>onChange('density',e.target.value)},h('option',{value:'airy'},'Amplo'),h('option',{value:'compact'},'Compacto'))),
        field('Altura da apresentação',h('select',{value:s.heroSize,onChange:e=>onChange('heroSize',e.target.value)},h('option',{value:'full'},'Ampla'),h('option',{value:'compact'},'Compacta'))),
        field('Destaque de promoções',h('select',{value:s.promotionStyle,onChange:e=>onChange('promotionStyle',e.target.value)},h('option',{value:'badge'},'Selo de desconto'),h('option',{value:'ribbon'},'Faixa de oferta')))),
      h('label',{className:'studio-check'},h('input',{type:'checkbox',checked:s.seasonalIcons,onChange:e=>onChange('seasonalIcons',e.target.checked)}),'Exibir ícones sazonais')),
    h('section',{className:'form-panel'},h('h2',null,'Marca-d’água · Lucas Design'),
      h('label',{className:'studio-check'},h('input',{type:'checkbox',checked:s.watermarkEnabled,onChange:e=>onChange('watermarkEnabled',e.target.checked)}),'Aplicar nas imagens exibidas'),
      h('div',{className:'fields-row'},field('Estilo',h('select',{value:s.watermarkStyle,onChange:e=>onChange('watermarkStyle',e.target.value)},h('option',{value:'diagonal'},'Trama diagonal'),h('option',{value:'corner'},'Assinatura no canto'))),
      field(`Opacidade: ${s.watermarkOpacity}%`,h('input',{type:'range',min:10,max:45,value:s.watermarkOpacity,onChange:e=>onChange('watermarkOpacity',Number(e.target.value))}))),
      h('div',{className:'studio-watermark-preview'},previewError?h('p',{role:'alert'},'Não foi possível gerar a prévia. Tente novamente.'):preview?h('img',{src:preview,alt:'Prévia da marca-d’água Lucas Design'}):h('p',null,'Preparando prévia…')),
      h('p',{className:'muted'},'A marca é incorporada aos pixels da prévia WebP. Os originais são preservados. Isso identifica a autoria, mas não impede capturas ou acesso a arquivos públicos.')));
}

export function SeasonalDecor({settings,react}) {
 const h=react.createElement,s=normalize(settings);if(s.theme==='classic'||!s.seasonalIcons)return null;
 const line={fill:'none',stroke:'currentColor',strokeWidth:1.2,strokeLinecap:'round',strokeLinejoin:'round'};
 const tree=h('svg',{viewBox:'0 0 140 220',...line},h('path',{d:'M70 22 38 70h18L22 122h25L10 180h120l-37-58h25L84 70h18L70 22ZM61 180v22h18v-22'}),h('path',{d:'m70 3 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z',fill:'currentColor',stroke:'none'}),...[ [55,86],[87,116],[44,153],[88,162] ].map(([cx,cy],i)=>h('circle',{key:i,cx,cy,r:3.5,fill:'currentColor'})));
 const bauble=h('svg',{viewBox:'0 0 150 220',...line},h('path',{d:'M75 0v65m-12 0h24v15H63Z'}),h('circle',{cx:75,cy:129,r:50}),h('path',{d:'M29 109q46 48 92 0M29 148q46-48 92 0'}),h('path',{d:'m75 94 6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1Z'}));
 const fire=h(FireworkBurst,{react});
 return h('div',{className:'seasonal-decor','aria-hidden':true},h('div',{className:'seasonal-left'},s.theme==='christmas'?tree:fire),h('div',{className:'seasonal-right'},s.theme==='christmas'?bauble:h(FireworkBurst,{react,delay:2.6})));
}
export function discountInfo(p){return Number.isInteger(p.price)&&p.price>0&&Number.isInteger(p.sale_price)&&p.sale_price>=0&&p.sale_price<p.price?{percent:Math.max(1,Math.round((p.price-p.sale_price)*100/p.price)),saving:p.price-p.sale_price}:null;}
export function discountPrice(base,percent){if(!Number.isInteger(base)||base<=0||!Number.isFinite(percent)||percent<=0||percent>100)throw Error('Informe um preço-base e um desconto entre 1 e 100%.');return Math.round(base*(100-percent)/100);}
export function PromotionBadge({product,react,detail=false}){const h=react.createElement,deal=discountInfo(product);if(!deal)return null;return h('span',{className:detail?'promotion-detail':'promotion-badge'},h('svg',{viewBox:'0 0 24 24',width:14,height:14,fill:'none',stroke:'currentColor',strokeWidth:1.5,'aria-hidden':true},h('path',{d:'m3 3 9 0 9 9-9 9-9-9V3Z'}),h('circle',{cx:8,cy:8,r:1.3})),detail?`${deal.percent}% de desconto · Economize ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(deal.saving/100)}`:`−${deal.percent}%`);}
export function DiscountEditor({product,onChange,react}){const h=react.createElement,[percent,setPercent]=react.useState(''),[error,setError]=react.useState('');const apply=value=>{try{const sale=discountPrice(product.price,Number(value));onChange('sale_price',sale);setError('');setPercent(String(value));}catch(e){setError(e.message)}};return h('div',{className:'discount-editor'},h('h3',null,'Desconto por porcentagem'),h('p',{className:'muted'},'O preço promocional é salvo em centavos e usado no total do WhatsApp.'),h('div',{className:'discount-presets'},...[5,10,15,20,30,50].map(v=>h('button',{key:v,type:'button',className:'secondary',disabled:!(product.price>0),onClick:()=>apply(v)},v+'%'))),h('div',{className:'discount-custom'},h('input',{type:'number',min:1,max:100,step:1,value:percent,'aria-label':'Desconto percentual',placeholder:'Desconto %',onChange:e=>setPercent(e.target.value)}),h('button',{type:'button',className:'secondary',onClick:()=>apply(percent)},'Aplicar')),h(PromotionBadge,{product,react,detail:true}),product.sale_price!==null&&h('button',{type:'button',className:'text-btn',onClick:()=>{onChange('sale_price',null);setPercent('')}},'Remover desconto'),error&&h('p',{role:'alert',className:'alert'},error));}
