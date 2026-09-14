(() => {
  // Put your hosted image URLs here. Keep the order image01...image10 if desired.
  const IMAGE_URLS = [
    "https://files.catbox.moe/umamaq.jpeg",
    "https://files.catbox.moe/5uir2d.jpeg",
    "https://files.catbox.moe/7xuuma.jpeg",
    "https://files.catbox.moe/nxffrc.jpeg",
    "https://files.catbox.moe/vcj6n9.png",
    "https://files.catbox.moe/8fd9ox.jpeg",
    "https://files.catbox.moe/mb3n6z.jpeg",
    "https://files.catbox.moe/kuozzs.jpeg",
    "https://files.catbox.moe/ugvmgm.jpeg",
    "https://files.catbox.moe/ent79g.jpeg"
  ];

  const COLS = 10, ROWS = 5, PIECES = COLS * ROWS;
  const board = document.getElementById("board");
  const preview = document.getElementById("preview");
  const message = document.getElementById("message");
  const timerEl = document.getElementById("timer");
  let currentUrl = null, pieces = [], startTime = 0, timerId = null, solved = false;

  function usableUrls() {
    return IMAGE_URLS.filter(u => u && !u.includes("PASTE_IMAGE_URL"));
  }

  function chooseImage() {
    const urls = usableUrls();
    if (!urls.length) return null;
    let choices = urls.filter(u => u !== currentUrl);
    if (!choices.length) choices = urls;
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function shuffle(a) {
    for (let i=a.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function fmt(sec) {
    const m = Math.floor(sec/60), s = sec%60;
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }

  function startTimer() {
    clearInterval(timerId); startTime = Date.now();
    timerId = setInterval(() => timerEl.textContent = fmt(Math.floor((Date.now()-startTime)/1000)), 250);
  }

  function makePiece(i, imageUrl, bw, bh) {
    const col=i%COLS, row=Math.floor(i/COLS);
    const w=bw/COLS, h=bh/ROWS;
    const el=document.createElement("div");
    el.className="piece";
    el.dataset.correct=i;
    el.style.width=w+"px";
    el.style.height=h+"px";
    el.style.backgroundImage=`url("${imageUrl}")`;
    el.style.backgroundSize=`${bw}px ${bh}px`;
    el.style.backgroundPosition=`-${col*w}px -${row*h}px`;

    const maxX=Math.max(0,bw-w), maxY=Math.max(0,bh-h);
    el.style.left=Math.random()*maxX+"px";
    el.style.top=Math.random()*maxY+"px";

    let drag=null;
    const down = e => {
      if(solved) return;
      e.preventDefault();
      const r=el.getBoundingClientRect();
      const br=board.getBoundingClientRect();
      drag={id:e.pointerId, ox:e.clientX-r.left, oy:e.clientY-r.top};
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("dragging");
      el.style.zIndex=++makePiece.z;
    };
    const move = e => {
      if(!drag || e.pointerId!==drag.id) return;
      e.preventDefault();
      const br=board.getBoundingClientRect();
      let x=e.clientX-br.left-drag.ox, y=e.clientY-br.top-drag.oy;
      x=Math.max(0,Math.min(board.clientWidth-el.offsetWidth,x));
      y=Math.max(0,Math.min(board.clientHeight-el.offsetHeight,y));
      el.style.left=x+"px"; el.style.top=y+"px";
    };
    const up = e => {
      if(!drag || e.pointerId!==drag.id) return;
      drag=null; el.classList.remove("dragging");
      checkSolved();
    };
    el.addEventListener("pointerdown",down,{passive:false});
    el.addEventListener("pointermove",move,{passive:false});
    el.addEventListener("pointerup",up);
    el.addEventListener("pointercancel",up);
    board.appendChild(el);
    return el;
  }
  makePiece.z=10;

  function checkSolved() {
    const br=board.getBoundingClientRect();
    const bw=board.clientWidth, bh=board.clientHeight;
    const tol=Math.max(12,Math.min(bw/COLS,bh/ROWS)*0.28);
    let good=0;
    for(const el of pieces) {
      const i=+el.dataset.correct, col=i%COLS, row=Math.floor(i/COLS);
      const targetX=col*bw/COLS, targetY=row*bh/ROWS;
      const x=parseFloat(el.style.left), y=parseFloat(el.style.top);
      if(Math.abs(x-targetX)<tol && Math.abs(y-targetY)<tol) good++;
    }
    if(good===PIECES) {
      solved=true; clearInterval(timerId);
      message.textContent="🎉 Puzzle complete!";
    }
  }

  function load() {
    const url=chooseImage();
    if(!url) {
      message.textContent="Add your 10 image URLs in puzzle.js first.";
      return;
    }
    currentUrl=url; solved=false; pieces=[];
    board.innerHTML=""; message.textContent="Hold and drag each piece into place.";
    if(preview) preview.src=url;

    // Wait for board dimensions; pieces use the current board size.
    requestAnimationFrame(() => {
      const bw=board.clientWidth, bh=board.clientHeight;
      const order=shuffle([...Array(PIECES).keys()]);
      for(const i of order) pieces.push(makePiece(i,url,bw,bh));
      startTimer();
    });
  }

  document.getElementById("shuffle").onclick=()=> {
    const els=[...board.children];
    els.forEach(el=>{
      el.style.left=Math.random()*Math.max(0,board.clientWidth-el.offsetWidth)+"px";
      el.style.top=Math.random()*Math.max(0,board.clientHeight-el.offsetHeight)+"px";
    });
    solved=false; message.textContent="Shuffled — keep going!";
  };
  document.getElementById("newPuzzle").onclick=load;
  window.addEventListener("resize",()=>{ if(!solved) checkSolved(); });
  load();
})();
