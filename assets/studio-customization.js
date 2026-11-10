// Shared by the storefront and the protected settings editor. No credentials.
const themes = ['classic', 'christmas', 'newyear'];
let current = {watermarkEnabled:true, watermarkOpacity:22, watermarkStyle:'diagonal'};
const cache = new Map();
export function normalize(s={}) {
  return {...s, theme:themes.includes(s.theme)?s.theme:'classic', watermarkEnabled:s.watermarkEnabled!==false,
    watermarkOpacity:Math.min(45,Math.max(10,Number(s.watermarkOpacity)||22)),
    watermarkStyle:s.watermarkStyle==='corner'?'corner':'diagonal'};
}
export function applyAppearance(settings) {
  const next=normalize(settings);
  document.documentElement.dataset.studioTheme=next.theme;
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
  react.useEffect(()=>{if(!previewTheme)return;const original=document.documentElement.dataset.studioTheme;
    document.documentElement.dataset.studioTheme=previewTheme;return()=>{document.documentElement.dataset.studioTheme=original;};},[previewTheme]);
  const field=(label,child)=>h('label',{className:'field'},h('span',null,label),child);
  return h('div',{className:'studio-customization'},
    h('section',{className:'form-panel'},h('h2',null,'Temas sazonais'),
      h('p',{className:'muted'},'Escolha a identidade visual. A estrutura e os produtos são preservados.'),
      h('div',{className:'studio-theme-options'},...themes.map((id,i)=>h('button',{key:id,type:'button',className:'studio-theme-option '+(s.theme===id?'selected':''),'aria-pressed':s.theme===id,onClick:()=>onChange('theme',id)},h('span',{className:'studio-swatch '+id}),['Original','Natal','Ano Novo'][i]))),
      h('button',{type:'button',className:'secondary',onClick:()=>setPreviewTheme(previewTheme?null:s.theme)},previewTheme?'Encerrar prévia':'Pré-visualizar tema'),
      h('p',{className:'muted'},'Use “Salvar configurações” para aplicar aos visitantes.')),
    h('section',{className:'form-panel'},h('h2',null,'Marca-d’água · Lucas Design'),
      h('label',{className:'studio-check'},h('input',{type:'checkbox',checked:s.watermarkEnabled,onChange:e=>onChange('watermarkEnabled',e.target.checked)}),'Aplicar nas imagens exibidas'),
      h('div',{className:'fields-row'},field('Estilo',h('select',{value:s.watermarkStyle,onChange:e=>onChange('watermarkStyle',e.target.value)},h('option',{value:'diagonal'},'Trama diagonal'),h('option',{value:'corner'},'Assinatura no canto'))),
      field(`Opacidade: ${s.watermarkOpacity}%`,h('input',{type:'range',min:10,max:45,value:s.watermarkOpacity,onChange:e=>onChange('watermarkOpacity',Number(e.target.value))}))),
      h('div',{className:'studio-watermark-preview'},previewError?h('p',{role:'alert'},'Não foi possível gerar a prévia. Tente novamente.'):preview?h('img',{src:preview,alt:'Prévia da marca-d’água Lucas Design'}):h('p',null,'Preparando prévia…')),
      h('p',{className:'muted'},'A marca é incorporada aos pixels da prévia WebP. Os originais são preservados. Isso identifica a autoria, mas não impede capturas ou acesso a arquivos públicos.')));
}
