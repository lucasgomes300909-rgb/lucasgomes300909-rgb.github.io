export function adminThemeValue(value){return value==='light'?'light':'dark';}
export function AdminThemeToggle({react}){
 const R=react,h=R.createElement,[theme,setTheme]=R.useState(()=>{try{return adminThemeValue(localStorage.getItem('studio-admin-theme'))}catch{return'dark'}});
 R.useEffect(()=>{document.documentElement.dataset.adminTheme=theme;try{localStorage.setItem('studio-admin-theme',theme)}catch{}return()=>{delete document.documentElement.dataset.adminTheme};},[theme]);
 return h('button',{type:'button',className:'text-btn admin-theme-toggle','aria-label':theme==='dark'?'Usar tema claro no painel':'Usar tema dark no painel','aria-pressed':theme==='dark',onClick:()=>setTheme(t=>t==='dark'?'light':'dark')},h('svg',{width:16,height:16,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,'aria-hidden':true},theme==='dark'?h('g',null,h('circle',{cx:12,cy:12,r:4}),h('path',{d:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'})):h('path',{d:'M20 14a8 8 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z'})),theme==='dark'?'Tema claro':'Tema dark');
}
export function FireworkBurst({react,delay=0}){
 const h=react.createElement;
 return h('svg',{className:'firework-burst',viewBox:'0 0 200 220',fill:'none',stroke:'currentColor',strokeWidth:1.1,style:{'--burst-delay':delay+'s'},'aria-hidden':true},
 h('path',{className:'firework-launch',d:'M100 210v-65',strokeWidth:1.4}),
 h('g',{className:'firework-rays'},...Array.from({length:12},(_,i)=>{const angle=i*Math.PI/6;return h('path',{key:i,d:`M${100+Math.cos(angle)*16} ${96+Math.sin(angle)*16}L${100+Math.cos(angle)*69} ${96+Math.sin(angle)*69}`})})),
 h('circle',{className:'firework-ring',cx:100,cy:96,r:46}),
 ...Array.from({length:12},(_,i)=>{const a=i*Math.PI/6+.14,r=72+(i%3)*7;return h('circle',{key:i,className:'firework-spark',cx:100,cy:96,r:i%3===0?2:1.35,fill:'currentColor',stroke:'none',style:{'--spark-x':(Math.cos(a)*r).toFixed(2)+'px','--spark-y':(Math.sin(a)*r+8).toFixed(2)+'px'}})}));
}
export function AmbientHero({settings,react,Decor}) {
 const R=react,h=R.createElement,root=R.useRef(null);
 const [paused,setPaused]=R.useState(false),[visible,setVisible]=R.useState(true),[hidden,setHidden]=R.useState(false),[reduced,setReduced]=R.useState(false);
 R.useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionPreference=()=>setReduced(media.matches),pageVisibility=()=>setHidden(document.hidden);
  motionPreference();pageVisibility();
  media.addEventListener('change',motionPreference);document.addEventListener('visibilitychange',pageVisibility);
  let observer;
  if(window.IntersectionObserver&&root.current){observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0});observer.observe(root.current)}
  return()=>{media.removeEventListener('change',motionPreference);document.removeEventListener('visibilitychange',pageVisibility);observer?.disconnect()};
 },[]);
 const stopped=paused||hidden||!visible||reduced;
 return h('section',{ref:root,className:'ambient-hero'+(stopped?' ambient-paused':''),'aria-label':settings.name},
  h('div',{className:'ambient-field','aria-hidden':true},h('div',{className:'ambient-flow flow-a'}),h('div',{className:'ambient-flow flow-b'}),h('div',{className:'ambient-flow flow-c'}),h('div',{className:'ambient-particles'},...Array.from({length:6},(_,i)=>h('i',{key:i,style:{'--drift-delay':(-i*6.7)+'s','--drift-duration':(29+i*4)+'s'}})))),
  Decor&&h(Decor,{settings,react}),
  h('div',{className:'ambient-content'},h('h1',{'aria-label':settings.name},settings.name==='Lucas de Oliveira Gomes'?h(R.Fragment,null,h('span',null,h('span',{className:'title-reveal'},'Lucas de')),h('span',{className:'ambient-name-serif'},h('span',{className:'title-reveal'},'Oliveira Gomes'))):h('span',null,h('span',{className:'title-reveal'},settings.name))),h('p',null,settings.subtitle)),
  h('a',{className:'ambient-down',href:'#templates','aria-label':'Explorar templates',onClick:e=>{e.preventDefault();document.getElementById('templates')?.scrollIntoView({behavior:reduced?'instant':'smooth'})}},h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.4,'aria-hidden':true},h('path',{d:'M12 4v16m-6-6 6 6 6-6'}))),
  h('button',{type:'button',className:'ambient-motion','aria-pressed':paused,disabled:reduced,onClick:()=>setPaused(value=>!value)},h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.4,'aria-hidden':true},h('path',{d:paused?'m8 5 11 7-11 7V5Z':'M8 5v14M16 5v14'})),reduced?'Movimento reduzido':paused?'Ativar fundo':'Pausar fundo'));
}

