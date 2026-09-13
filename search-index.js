(()=>{
  const BASE='/DEV-Website/';

  // IMPORTANT: MEN and WOMEN indexes stay completely separate.
  // When a new product is added, add it to the correct index with name, category,
  // colors and useful keywords so customers can find it from partial typing.
  const MEN_INDEX=[
    {name:'Close Your Eyes Tee',category:'T-Shirts',colors:['White'],keywords:['close your eyes','tee','tshirt','t-shirt','shirt','oversized','white'],url:BASE+'tshirts/',image:BASE+'close-eyes-front.jpeg',price:'AED 75'},
    {name:'Yujiro × Jack Hanma Tee',category:'T-Shirts',colors:['Black'],keywords:['yujiro','jack hanma','hanma','tee','tshirt','t-shirt','shirt','oversized','black','anime'],url:BASE+'tshirts/',image:BASE+'yujiro-jack-front.jfif',price:'AED 75'},
    {name:'Yeah Buddy Tee',category:'T-Shirts',colors:['Black'],keywords:['yeah buddy','ronnie coleman','ronnie','light weight','tee','tshirt','t-shirt','shirt','oversized','black'],url:BASE+'tshirts/',image:BASE+'yeah-buddy-front.jpeg',price:'AED 75'},
    {name:'DEV Zip Polo',category:'Polo',colors:['Black','Dark Olive Green','Beige'],keywords:['polo','zip polo','zipper','black','dark olive green','olive','green','beige','shirt'],url:BASE+'polo/',image:BASE+'polo-black-front.jfif',price:'AED 85'},
    {name:'DEV Shorts',category:'Shorts',colors:['Black'],keywords:['shorts','short','gym shorts','training shorts','black'],url:BASE+'shorts/',image:BASE+'dev-shorts-front.jfif',price:'AED 80'},
    {name:'DEV Baggy Pants',category:'Baggy Pants',colors:['Black','Light Grey'],keywords:['baggy pants','pants','pant','trousers','black','light grey','light gray','grey','gray','baggy'],url:BASE+'baggy-pants/',image:BASE+'baggy-pants-black-front.jfif',price:''},
    {name:'Hoodies',category:'Hoodies',colors:[],keywords:['hoodie','hoodies','sweatshirt'],url:BASE+'#collections',image:BASE+'hoodies.jpeg',price:'COMING SOON'},
    {name:'Sweaters',category:'Sweaters',colors:[],keywords:['sweater','sweaters','sweatshirt'],url:BASE+'#collections',image:BASE+'sweaters.jpeg',price:'COMING SOON'}
  ];

  const WOMEN_INDEX=[
    {name:'Women Tops',category:'Tops',colors:[],keywords:['women tops','top','tops','shirt','training top','gym top'],url:BASE+'women/',image:BASE+'women-tops.png',price:''},
    {name:'Women Leggings',category:'Leggings',colors:[],keywords:['women leggings','legging','leggings','gym leggings'],url:BASE+'women/',image:BASE+'women-leggings.png',price:''},
    {name:'Women Shorts',category:'Shorts',colors:[],keywords:['women shorts','shorts','short','gym shorts'],url:BASE+'women/',image:BASE+'women-shorts.png',price:''},
    {name:'Women Sets',category:'Sets',colors:[],keywords:['women sets','set','sets','matching set','gym set'],url:BASE+'women/',image:BASE+'women-sets.png',price:''}
  ];

  const normalize=s=>(s||'').toLowerCase().replace(/[×–—]/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
  const section=location.pathname.toLowerCase().includes('/women')?'women':'men';
  const INDEX=section==='women'?WOMEN_INDEX:MEN_INDEX;

  const style=document.createElement('style');
  style.textContent=`
    .dev-live-search{position:fixed;z-index:6000;background:#0b0b0b;border:1px solid #2a2a2a;box-shadow:0 18px 45px rgba(0,0,0,.45);display:none;max-height:min(520px,70vh);overflow:auto;color:#fff}
    .dev-live-search.open{display:block}
    .dev-search-head{padding:11px 13px;border-bottom:1px solid #202020;color:#777;font:800 8px/1.3 Arial,sans-serif;letter-spacing:2px}
    .dev-search-result{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;padding:10px 12px;border-bottom:1px solid #181818;text-decoration:none;color:#fff;background:#0b0b0b}
    .dev-search-result:hover,.dev-search-result.active{background:#151515}
    .dev-search-result img{width:58px;height:68px;object-fit:contain;background:#f2f2ef;display:block}
    .dev-search-result strong{display:block;font:900 11px/1.35 Arial,sans-serif;letter-spacing:.3px}
    .dev-search-meta{margin-top:5px;color:#777;font:700 8px/1.45 Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase;white-space:normal}
    .dev-search-price{margin-top:5px;color:#bbb;font:900 9px/1.3 Arial,sans-serif}
    .dev-search-empty{padding:20px 14px;color:#777;font:700 10px/1.6 Arial,sans-serif;text-align:center}
    @media(max-width:600px){.dev-live-search{left:4%!important;right:4%!important;width:auto!important}.dev-search-result{grid-template-columns:50px minmax(0,1fr)}.dev-search-result img{width:50px;height:60px}}
  `;
  document.head.appendChild(style);

  const box=document.createElement('div');
  box.className='dev-live-search';
  box.setAttribute('role','listbox');
  document.body.appendChild(box);

  let currentInput=null;
  let results=[];
  let activeIndex=-1;

  function searchable(item){
    return normalize([item.name,item.category,...(item.colors||[]),...(item.keywords||[])].join(' '));
  }

  function score(item,q,tokens){
    const hay=searchable(item);
    if(!tokens.every(t=>hay.includes(t))) return -1;
    const name=normalize(item.name), category=normalize(item.category), colors=normalize((item.colors||[]).join(' '));
    let s=0;
    if(name===q) s+=120;
    if(name.startsWith(q)) s+=70;
    if(name.includes(q)) s+=45;
    if(colors.includes(q)) s+=55;
    if(category.includes(q)) s+=35;
    tokens.forEach(t=>{if(name.startsWith(t))s+=15;if(colors.includes(t))s+=12;if(category.includes(t))s+=8;});
    return s;
  }

  function find(q){
    q=normalize(q);
    if(!q) return [];
    const tokens=q.split(' ').filter(Boolean);
    return INDEX.map(item=>({item,score:score(item,q,tokens)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score).slice(0,8).map(x=>x.item);
  }

  function position(){
    if(!currentInput||!box.classList.contains('open')) return;
    const r=currentInput.getBoundingClientRect();
    box.style.left=`${Math.round(r.left)}px`;
    box.style.top=`${Math.round(r.bottom+7)}px`;
    box.style.width=`${Math.max(Math.round(r.width),310)}px`;
  }

  function render(q){
    results=find(q);
    activeIndex=-1;
    const label=section==='women'?'WOMEN':'MEN';
    if(!normalize(q)){
      box.classList.remove('open');
      box.innerHTML='';
      return;
    }
    box.innerHTML=`<div class="dev-search-head">${label} SEARCH RESULTS</div>` + (results.length?results.map((r,i)=>{
      const colors=(r.colors||[]).join(' / ');
      const meta=[r.category,colors].filter(Boolean).join(' · ');
      return `<a class="dev-search-result" role="option" data-index="${i}" href="${r.url}">
        <img src="${r.image}" alt="${r.name}" loading="lazy">
        <div><strong>${r.name}</strong><div class="dev-search-meta">${meta}</div>${r.price?`<div class="dev-search-price">${r.price}</div>`:''}</div>
      </a>`;
    }).join(''):`<div class="dev-search-empty">No matching ${label.toLowerCase()} products yet.</div>`);
    box.classList.add('open');
    position();
  }

  function setActive(next){
    const els=[...box.querySelectorAll('.dev-search-result')];
    if(!els.length) return;
    activeIndex=(next+els.length)%els.length;
    els.forEach((el,i)=>el.classList.toggle('active',i===activeIndex));
    els[activeIndex].scrollIntoView({block:'nearest'});
  }

  function attach(input){
    if(input.dataset.devSearchReady==='1') return;
    input.dataset.devSearchReady='1';
    input.setAttribute('autocomplete','off');
    input.addEventListener('focus',()=>{currentInput=input;if(input.value.trim())render(input.value);});
    input.addEventListener('input',()=>{currentInput=input;render(input.value);});
    input.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();setActive(activeIndex+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();setActive(activeIndex-1);}
      else if(e.key==='Enter'&&activeIndex>=0&&results[activeIndex]){e.preventDefault();location.href=results[activeIndex].url;}
      else if(e.key==='Escape'){box.classList.remove('open');}
    });
  }

  function init(){
    const selectors=['#desktopSearch','.search-box input[type="search"]','.nav-search input[type="search"]','.dev-search-box input[type="search"]','.mobile-search-panel input[type="search"]','nav input[type="search"]'];
    [...new Set(selectors.flatMap(s=>[...document.querySelectorAll(s)]))].forEach(attach);
  }

  document.addEventListener('click',e=>{
    if(!box.contains(e.target)&&e.target!==currentInput) box.classList.remove('open');
  });
  window.addEventListener('resize',position);
  window.addEventListener('scroll',position,true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
