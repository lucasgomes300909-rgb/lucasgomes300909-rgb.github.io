const color=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;
const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Math.round(Number(v)))):fallback;
export function carouselConfig(settings={}){const c=settings.carousel||{};return {enabled:c.enabled!==false,autoplay:c.autoplay!==false,interval:bounded(c.interval,3000,20000,6000),duration:bounded(c.duration,200,1500,600),transition:['fade','slide','zoom'].includes(c.transition)?c.transition:'fade',height:c.height==='compact'?'compact':'regular',position:c.position==='beforeCatalog'?'beforeCatalog':'afterHero'};}
export function visibleBanners(settings,products){return (Array.isArray(settings.banners)?settings.banners:[]).slice(0,12).filter(b=>b.active!==false).flatMap(b=>{const product=products.find(p=>p.id===b.productId&&p.status==='published');return product?[{...b,product,color:color(b.color,'#eee9df'),textColor:color(b.textColor,'#1d2029'),fit:b.fit==='cover'?'cover':'contain'}]:[];});}
export function BannerCarousel({settings,products,go,react,Image}){
 const R=react,h=R.createElement,c=carouselConfig(settings),items=visibleBanners(settings,products),count=items.length;
 const [index,setIndex]=R.useState(0),[paused,setPaused]=R.useState(false),[hover,setHover]=R.useState(false),[focus,setFocus]=R.useState(false),[visible,setVisible]=R.useState(true),[hidden,setHidden]=R.useState(false),[reduced,setReduced]=R.useState(false);
 const region=R.useRef(null),touch=R.useRef(null),swiped=R.useRef(false),signature=items.map(b=>b.id).join('|');
 R.useEffect(()=>setIndex(0),[signature]);
 R.useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches),visibility=()=>setHidden(document.hidden);change();visibility();media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);let observer;
 if(window.IntersectionObserver&&region.current){observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.1});observer.observe(region.current);}
 return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);observer?.disconnect();};},[count>0,c.enabled]);
 const running=c.autoplay&&!paused&&!hover&&!focus&&visible&&!hidden&&!reduced&&count>1;
 R.useEffect(()=>{if(!running)return;const timer=setInterval(()=>setIndex(i=>(i+1)%count),c.interval);return()=>clearInterval(timer);},[running,c.interval,count,index]);
 const move=step=>setIndex(i=>(i+step+count)%count);
 if(!c.enabled||!count)return null;
 const active=index%count;
 return h('section',{ref:region,className:'banner-section section',role:'region','aria-roledescription':'carrossel','aria-label':'Templates em destaque',onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),onFocusCapture:()=>setFocus(true),onBlurCapture:e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);},onKeyDown:e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}}},
 h('div',{className:'banner-heading'},h('span',null,'Em destaque'),h('span',{'aria-live':running?'off':'polite','aria-atomic':true},`${String(active+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`)),
 h('div',{className:`banner-stage banner-${c.height} transition-${c.transition}`,style:{'--banner-duration':c.duration+'ms'},onTouchStart:e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};swiped.current=false;},onTouchEnd:e=>{if(!touch.current||!count)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){swiped.current=true;move(dx<0?1:-1);}touch.current=null;}},
 ...items.map((b,i)=>h('a',{key:b.id,className:'banner-slide '+(i===active?'is-active':''),href:'/templates/'+b.product.slug,'aria-hidden':i!==active,tabIndex:i===active?0:-1,style:{background:b.color,color:b.textColor},onClick:e=>{e.preventDefault();if(swiped.current){swiped.current=false;return}go('/templates/'+b.product.slug)}},
 h('div',{className:'banner-copy'},h('span',{className:'banner-kicker'},'Template'),h('h2',null,b.title||b.product.name),b.subtitle&&h('p',null,b.subtitle),h('span',{className:'banner-link'},b.button||'Ver template',h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,'aria-hidden':true},h('path',{d:'M4 12h16m-6-6 6 6-6 6'})))),
 h('div',{className:'banner-art '+b.fit},(i===active||i===(active+1)%count)&&h(Image,{src:b.image||b.product.cover,alt:b.title||b.product.name,loading:i===active?'eager':'lazy',decoding:'async'}))))),
 count>1&&h('div',{className:'banner-controls'},h('div',{className:'banner-dots',role:'group','aria-label':'Escolher banner'},...items.map((b,i)=>h('button',{key:b.id,type:'button',className:i===active?'active':'','aria-label':`Mostrar banner ${i+1}: ${b.title||b.product.name}`,'aria-current':i===active?'true':undefined,onClick:()=>setIndex(i)},h('span')))),
 h('div',{className:'banner-buttons'},h('button',{type:'button','aria-label':'Banner anterior',onClick:()=>move(-1)},'←'),c.autoplay&&h('button',{type:'button','aria-label':paused?'Retomar rotação':'Pausar rotação','aria-pressed':paused,onClick:()=>setPaused(!paused)},paused?'▶':'Ⅱ'),h('button',{type:'button','aria-label':'Próximo banner',onClick:()=>move(1)},'→'))));
}
export function BannerEditor({settings,onChange,products,react,Image,upload}){
 const R=react,h=R.createElement,c=carouselConfig(settings),banners=Array.isArray(settings.banners)?settings.banners:[],[busy,setBusy]=R.useState(''),[error,setError]=R.useState(''),[preview,setPreview]=R.useState(false),[previewLink,setPreviewLink]=R.useState('');
 const patch=(key,value)=>onChange('carousel',{...c,[key]:value});
 const edit=(id,change)=>onChange('banners',banners.map(b=>b.id===id?{...b,...change}:b));
 const reorder=(index,step)=>{const target=index+step;if(target<0||target>=banners.length)return;const result=[...banners];[result[index],result[target]]=[result[target],result[index]];onChange('banners',result)};
 const field=(label,child)=>h('label',{className:'field'},h('span',null,label),child);
 const check=(label,key)=>h('label',{className:'studio-check'},h('input',{type:'checkbox',checked:c[key],onChange:e=>patch(key,e.target.checked)}),label);
 return h('section',{className:'form-panel banner-editor'},h('div',{className:'panel-title'},h('h2',null,'Banners rotativos'),h('button',{type:'button',className:'secondary',disabled:banners.length>=12||!products.length,onClick:()=>onChange('banners',[...banners,{id:crypto.randomUUID(),productId:products.find(p=>p.status==='published')?.id||products[0].id,title:'',subtitle:'',image:'',active:true,color:'#eee9df',textColor:'#1d2029',fit:'contain',button:'Ver template'}])},'Adicionar banner')),
 h('p',{className:'muted'},'Até 12 banners. Escolha um produto e personalize a apresentação. Salve as configurações para publicar.'),
 check('Exibir carrossel','enabled'),check('Rotação automática','autoplay'),
 h('div',{className:'fields-row'},field('Transição',h('select',{value:c.transition,onChange:e=>patch('transition',e.target.value)},...['fade','slide','zoom'].map((v,i)=>h('option',{value:v,key:v},['Dissolver','Deslizar','Zoom suave'][i])))),
 field('Intervalo entre banners',h('select',{value:c.interval,onChange:e=>patch('interval',Number(e.target.value))},...[3000,5000,6000,8000,10000,15000,20000].map(v=>h('option',{key:v,value:v},v/1000+' segundos')))),
 field('Duração da transição',h('select',{value:c.duration,onChange:e=>patch('duration',Number(e.target.value))},...[300,600,900,1200].map(v=>h('option',{key:v,value:v},v+' ms')))),
 field('Altura',h('select',{value:c.height,onChange:e=>patch('height',e.target.value)},h('option',{value:'regular'},'Ampla'),h('option',{value:'compact'},'Compacta'))),
 field('Posição',h('select',{value:c.position,onChange:e=>patch('position',e.target.value)},h('option',{value:'afterHero'},'Depois da apresentação'),h('option',{value:'beforeCatalog'},'Antes dos templates')))),
 ...banners.map((b,index)=>h('div',{key:b.id,className:'banner-edit-card'},
 h('div',{className:'banner-edit-top'},h('strong',null,'Banner '+String(index+1).padStart(2,'0')),h('div',null,h('button',{type:'button',className:'icon',disabled:index===0,'aria-label':'Mover banner '+(index+1)+' para cima',onClick:()=>reorder(index,-1)},'↑'),h('button',{type:'button',className:'icon',disabled:index===banners.length-1,'aria-label':'Mover banner '+(index+1)+' para baixo',onClick:()=>reorder(index,1)},'↓'),h('button',{type:'button',className:'secondary',onClick:()=>onChange('banners',banners.filter(item=>item.id!==b.id))},'Remover'))),
 h('div',{className:'fields-row'},field('Produto de destino',h('select',{value:b.productId,required:true,onChange:e=>edit(b.id,{productId:e.target.value})},h('option',{value:''},'Selecione um produto'),...products.map(p=>h('option',{key:p.id,value:p.id},p.name+(p.status==='published'?'':' · não publicado'))))),
 field('Título',h('input',{value:b.title||'',maxLength:100,placeholder:'Usar nome do produto',onChange:e=>edit(b.id,{title:e.target.value})})),
 field('Texto complementar',h('input',{value:b.subtitle||'',maxLength:180,onChange:e=>edit(b.id,{subtitle:e.target.value})})),
 field('Texto do botão',h('input',{value:b.button||'Ver template',maxLength:35,onChange:e=>edit(b.id,{button:e.target.value})})),
 field('Cor de fundo',h('input',{type:'color',value:color(b.color,'#eee9df'),onChange:e=>edit(b.id,{color:e.target.value})})),
 field('Cor do texto',h('input',{type:'color',value:color(b.textColor,'#1d2029'),onChange:e=>edit(b.id,{textColor:e.target.value})})),
 field('Enquadramento',h('select',{value:b.fit||'contain',onChange:e=>edit(b.id,{fit:e.target.value})},h('option',{value:'contain'},'Imagem inteira'),h('option',{value:'cover'},'Preencher área')))),
 h('label',{className:'studio-check'},h('input',{type:'checkbox',checked:b.active!==false,onChange:e=>edit(b.id,{active:e.target.checked})}),'Banner ativo'),
 h('div',{className:'banner-image-tools'},h('label',{className:'secondary banner-upload'},busy===b.id?'Enviando…':'Enviar imagem personalizada',h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',disabled:!!busy,onChange:async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(b.id);setError('');try{const url=await upload(file);edit(b.id,{image:url})}catch(e){setError(e.message)}finally{setBusy('')}}})),b.image&&h('button',{type:'button',className:'text-btn',onClick:()=>edit(b.id,{image:''})},'Usar capa do produto')),
 h('p',{className:'muted'},'PNG, JPG ou WebP, até 8 MB. Imagens enviadas são otimizadas em WebP e públicas.'))),
 !banners.length&&h('p',{className:'muted'},'Nenhum banner cadastrado.'),error&&h('p',{className:'alert',role:'alert'},error),
 h('button',{type:'button',className:'secondary',onClick:()=>{setPreview(!preview);setPreviewLink('')}},preview?'Fechar prévia':'Pré-visualizar carrossel'),
 preview&&h('div',{className:'banner-editor-preview'},h(BannerCarousel,{settings,products,react,Image,go:url=>setPreviewLink(url)}),previewLink&&h('p',{role:'status',className:'muted'},'Destino: '+previewLink)),
 h('p',{className:'muted'},'Banners de produtos não publicados ficam ocultos. A rotação pausa com o mouse, foco do teclado, aba oculta ou carrossel fora da tela.'));
}
