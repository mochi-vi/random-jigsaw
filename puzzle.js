(() => {

  // ============================
  // YOUR 10 IMAGE URLS
  // ============================

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

  // 10 x 5 = 50 pieces
  const COLS = 10;
  const ROWS = 5;
  const TOTAL = COLS * ROWS;

  const board = document.getElementById("board");
  const preview = document.getElementById("preview");
  const message = document.getElementById("message");
  const timerEl = document.getElementById("timer");
  const shuffleBtn = document.getElementById("shuffle");
  const newPuzzleBtn = document.getElementById("newPuzzle");

  let currentUrl = null;
  let pieces = [];
  let lockedCount = 0;
  let solved = false;

  let timerId = null;
  let startTime = 0;
  let zCounter = 10;


  // ============================
  // RANDOM IMAGE
  // ============================

  function chooseImage() {

    let choices =
      IMAGE_URLS.filter(
        url => url !== currentUrl
      );

    if (choices.length === 0) {
      choices = IMAGE_URLS;
    }

    return choices[
      Math.floor(
        Math.random() * choices.length
      )
    ];
  }


  // ============================
  // TIMER
  // ============================

  function formatTime(seconds) {

    const minutes =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  }


  function startTimer() {

    clearInterval(timerId);

    startTime = Date.now();

    timerEl.textContent = "00:00";

    timerId = setInterval(() => {

      const elapsed =
        Math.floor(
          (Date.now() - startTime) / 1000
        );

      timerEl.textContent =
        formatTime(elapsed);

    }, 250);
  }


  // ============================
  // GET TILE SIZE
  // ============================

  function tileSize() {

    return {
      width:
        board.clientWidth / COLS,

      height:
        board.clientHeight / ROWS
    };
  }


  // ============================
  // CREATE ONE PIECE
  // ============================

  function createPiece(index, imageUrl) {

    const col =
      index % COLS;

    const row =
      Math.floor(index / COLS);

    const size =
      tileSize();

    const piece =
      document.createElement("div");

    piece.className = "piece";

    piece.dataset.index =
      index;

    piece.dataset.locked =
      "false";


    // ==========================
    // PIECE SIZE
    // ==========================

    piece.style.width =
      size.width + "px";

    piece.style.height =
      size.height + "px";


    // ==========================
    // IMAGE
    // ==========================

    piece.style.backgroundImage =
      `url("${imageUrl}")`;

    piece.style.backgroundRepeat =
      "no-repeat";

    piece.style.backgroundSize =
      `${board.clientWidth}px ${board.clientHeight}px`;

    piece.style.backgroundPosition =
      `-${col * size.width}px ` +
      `-${row * size.height}px`;


    // ==========================
    // RANDOM START POSITION
    // ==========================

    const maxX =
      board.clientWidth -
      size.width;

    const maxY =
      board.clientHeight -
      size.height;

    piece.style.left =
      Math.random() *
      Math.max(0, maxX) +
      "px";

    piece.style.top =
      Math.random() *
      Math.max(0, maxY) +
      "px";

    piece.style.zIndex =
      ++zCounter;


    // ==========================
    // DRAG VARIABLES
    // ==========================

    let dragging = false;
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;


    // ==========================
    // CHECK WHETHER CORRECT
    // ==========================

    function checkLock() {

      if (
        piece.dataset.locked ===
        "true"
      ) {
        return;
      }


      const currentSize =
        tileSize();


      const targetX =
        col * currentSize.width;

      const targetY =
        row * currentSize.height;


      const currentX =
        parseFloat(piece.style.left) || 0;

      const currentY =
        parseFloat(piece.style.top) || 0;


      /*
        30% tolerance.
        You don't have to place it
        perfectly.
      */

      const tolerance =
        Math.min(
          currentSize.width,
          currentSize.height
        ) * 0.30;


      const correct =
        Math.abs(
          currentX - targetX
        ) <= tolerance
        &&
        Math.abs(
          currentY - targetY
        ) <= tolerance;


      if (!correct) {
        return false;
      }


      // ==========================
      // SNAP
      // ==========================

      piece.style.left =
        targetX + "px";

      piece.style.top =
        targetY + "px";


      // ==========================
      // LOCK
      // ==========================

      piece.dataset.locked =
        "true";

      piece.classList.remove(
        "dragging"
      );

      piece.classList.add(
        "locked"
      );

      piece.style.zIndex =
        index + 1;

      lockedCount++;


      message.textContent =
        `${lockedCount} / ${TOTAL} pieces placed`;


      // ==========================
      // COMPLETE
      // ==========================

      if (
        lockedCount === TOTAL
      ) {

        solved = true;

        clearInterval(timerId);

        message.textContent =
          "🎉 Puzzle complete!";
      }


      return true;
    }


    // ==========================
    // TOUCH / MOUSE DOWN
    // ==========================

    piece.addEventListener(
      "pointerdown",
      event => {

        if (
          solved ||
          piece.dataset.locked ===
          "true"
        ) {
          return;
        }

        event.preventDefault();

        dragging = true;

        pointerId =
          event.pointerId;


        const pieceRect =
          piece.getBoundingClientRect();


        offsetX =
          event.clientX -
          pieceRect.left;

        offsetY =
          event.clientY -
          pieceRect.top;


        piece.style.zIndex =
          ++zCounter;

        piece.classList.add(
          "dragging"
        );


        try {
          piece.setPointerCapture(
            pointerId
          );
        } catch (e) {}

      },
      {
        passive: false
      }
    );


    // ==========================
    // DRAG
    // ==========================

    piece.addEventListener(
      "pointermove",
      event => {

        if (
          !dragging ||
          event.pointerId !== pointerId
        ) {
          return;
        }


        event.preventDefault();


        const boardRect =
          board.getBoundingClientRect();


        const currentSize =
          tileSize();


        let x =
          event.clientX -
          boardRect.left -
          offsetX;


        let y =
          event.clientY -
          boardRect.top -
          offsetY;


        // Keep inside board

        x =
          Math.max(
            0,
            Math.min(
              board.clientWidth -
              currentSize.width,
              x
            )
          );


        y =
          Math.max(
            0,
            Math.min(
              board.clientHeight -
              currentSize.height,
              y
            )
          );


        piece.style.left =
          x + "px";

        piece.style.top =
          y + "px";


        // =========================
        // INSTANT AUTO LOCK
        // =========================

        if (
          checkLock()
        ) {

          dragging = false;

          try {
            piece.releasePointerCapture(
              pointerId
            );
          } catch (e) {}

          pointerId = null;
        }

      },
      {
        passive: false
      }
    );


    // ==========================
    // RELEASE
    // ==========================

    piece.addEventListener(
      "pointerup",
      event => {

        if (
          !dragging ||
          event.pointerId !== pointerId
        ) {
          return;
        }


        dragging = false;

        piece.classList.remove(
          "dragging"
        );


        // One final lock check

        checkLock();


        try {
          piece.releasePointerCapture(
            pointerId
          );
        } catch (e) {}

        pointerId = null;
      }
    );


    piece.addEventListener(
      "pointercancel",
      () => {

        dragging = false;

        piece.classList.remove(
          "dragging"
        );

        pointerId = null;
      }
    );


    board.appendChild(piece);

    return piece;
  }


  // ============================
  // LOAD PUZZLE
  // ============================

  function loadPuzzle() {

    clearInterval(timerId);

    board.innerHTML = "";

    pieces = [];

    lockedCount = 0;

    solved = false;


    currentUrl =
      chooseImage();


    // Preview page only

    if (preview) {
      preview.src =
        currentUrl;
    }


    message.textContent =
      "Loading puzzle…";


    /*
      IMPORTANT:
      10 x 5 gives our clean
      50-piece puzzle.
    */

    board.style.aspectRatio =
      "2 / 1";


    requestAnimationFrame(() => {

      /*
        Wait until the board actually
        has dimensions.
      */

      const width =
        board.clientWidth;

      const height =
        board.clientHeight;


      if (
        width <= 0 ||
        height <= 0
      ) {

        setTimeout(
          loadPuzzle,
          100
        );

        return;
      }


      const order =
        Array.from(
          { length: TOTAL },
          (_, i) => i
        );


      // Random order

      for (
        let i = order.length - 1;
        i > 0;
        i--
      ) {

        const j =
          Math.floor(
            Math.random() *
            (i + 1)
          );

        [
          order[i],
          order[j]
        ] =
        [
          order[j],
          order[i]
        ];
      }


      for (
        const index of order
      ) {

        pieces.push(
          createPiece(
            index,
            currentUrl
          )
        );
      }


      message.textContent =
        `0 / ${TOTAL} pieces placed`;

      startTimer();

    });
  }


  // ============================
  // SHUFFLE
  // ============================

  shuffleBtn.addEventListener(
    "click",
    () => {

      if (solved) {
        return;
      }


      const size =
        tileSize();


      for (
        const piece of pieces
      ) {

        // IMPORTANT:
        // Locked pieces stay locked.

        if (
          piece.dataset.locked ===
          "true"
        ) {
          continue;
        }


        const maxX =
          board.clientWidth -
          size.width;

        const maxY =
          board.clientHeight -
          size.height;


        piece.style.left =
          Math.random() *
          Math.max(0, maxX) +
          "px";

        piece.style.top =
          Math.random() *
          Math.max(0, maxY) +
          "px";
      }


      message.textContent =
        `${lockedCount} / ${TOTAL} pieces placed`;
    }
  );


  // ============================
  // NEW PUZZLE
  // ============================

  newPuzzleBtn.addEventListener(
    "click",
    loadPuzzle
  );


  // ============================
  // START
  // ============================

  loadPuzzle();

})();      const j=Math.floor(Math.random()*(i+1));
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
