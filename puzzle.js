(() => {

  // ==============================
  // YOUR 10 IMAGES
  // ==============================

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

  // 10 × 5 = 50 pieces
  const COLS = 10;
  const ROWS = 5;
  const TOTAL = 50;

  const board = document.getElementById("board");
  const preview = document.getElementById("preview");
  const message = document.getElementById("message");
  const timerEl = document.getElementById("timer");

  let pieces = [];
  let currentImage = null;
  let lockedCount = 0;
  let solved = false;

  let timerID = null;
  let startTime = 0;
  let zIndex = 100;

  let imageRatio = 2;


  // ==============================
  // RANDOM IMAGE
  // ==============================

  function chooseImage() {

    let available =
      IMAGE_URLS.filter(
        url => url !== currentImage
      );

    if (!available.length) {
      available = IMAGE_URLS;
    }

    return available[
      Math.floor(
        Math.random() * available.length
      )
    ];
  }


  // ==============================
  // SHUFFLE
  // ==============================

  function shuffleArray(array) {

    for (
      let i = array.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        array[i],
        array[j]
      ] = [
        array[j],
        array[i]
      ];
    }

    return array;
  }


  // ==============================
  // TIMER
  // ==============================

  function formatTime(seconds) {

    return (
      String(
        Math.floor(seconds / 60)
      ).padStart(2, "0")
      +
      ":"
      +
      String(
        seconds % 60
      ).padStart(2, "0")
    );
  }


  function startTimer() {

    clearInterval(timerID);

    startTime = Date.now();

    timerID = setInterval(() => {

      const elapsed =
        Math.floor(
          (Date.now() - startTime) / 1000
        );

      timerEl.textContent =
        formatTime(elapsed);

    }, 250);
  }


  // ==============================
  // BOARD SIZE
  //
  // Keeps the selected image's
  // aspect ratio.
  // ==============================

  function updateBoardSize() {

    if (!board) return;

    const section =
      board.parentElement;

    const availableWidth =
      section.clientWidth;

    const availableHeight =
      Math.max(
        180,
        section.clientHeight -
        (message?.offsetHeight || 24) -
        44
      );

    let width =
      availableWidth;

    let height =
      width / imageRatio;

    if (height > availableHeight) {

      height =
        availableHeight;

      width =
        height * imageRatio;
    }

    board.style.width =
      Math.max(
        160,
        width
      ) + "px";

    board.style.height =
      Math.max(
        120,
        height
      ) + "px";
  }


  // ==============================
  // CREATE CLEAN SQUARE-STYLE TILE
  // ==============================

  function createPiece(
    index,
    imageURL,
    boardWidth,
    boardHeight
  ) {

    const col =
      index % COLS;

    const row =
      Math.floor(
        index / COLS
      );


    const pieceWidth =
      boardWidth / COLS;

    const pieceHeight =
      boardHeight / ROWS;


    const piece =
      document.createElement("div");

    piece.className =
      "piece";

    piece.dataset.correct =
      index;

    piece.dataset.locked =
      "false";


    piece.style.width =
      pieceWidth + "px";

    piece.style.height =
      pieceHeight + "px";


    // =================================
    // IMAGE FRAGMENT
    // =================================

    piece.style.backgroundImage =
      `url("${imageURL}")`;

    piece.style.backgroundRepeat =
      "no-repeat";

    piece.style.backgroundSize =
      `${boardWidth}px ${boardHeight}px`;

    piece.style.backgroundPosition =
      `-${col * pieceWidth}px ` +
      `-${row * pieceHeight}px`;


    // =================================
    // RANDOM START LOCATION
    // =================================

    const maxX =
      Math.max(
        0,
        boardWidth - pieceWidth
      );

    const maxY =
      Math.max(
        0,
        boardHeight - pieceHeight
      );


    piece.style.left =
      Math.random() *
      maxX +
      "px";

    piece.style.top =
      Math.random() *
      maxY +
      "px";

    piece.style.zIndex =
      ++zIndex;


    // =================================
    // DRAG VARIABLES
    // =================================

    let dragging = false;
    let pointerID = null;

    let offsetX = 0;
    let offsetY = 0;


    // =================================
    // AUTO-LOCK CHECK
    // =================================

    function checkCorrectPosition() {

      if (
        piece.dataset.locked === "true"
      ) {
        return;
      }


      const currentPieceWidth =
        board.clientWidth / COLS;

      const currentPieceHeight =
        board.clientHeight / ROWS;


      const targetX =
        col * currentPieceWidth;

      const targetY =
        row * currentPieceHeight;


      const currentX =
        parseFloat(
          piece.style.left || 0
        );

      const currentY =
        parseFloat(
          piece.style.top || 0
        );


      /*
        The piece automatically locks when
        it gets close enough to its correct
        grid position.
      */

      const tolerance =
        Math.min(
          currentPieceWidth,
          currentPieceHeight
        ) * 0.30;


      if (
        Math.abs(
          currentX - targetX
        ) <= tolerance &&

        Math.abs(
          currentY - targetY
        ) <= tolerance
      ) {

        // SNAP EXACTLY INTO PLACE

        piece.style.left =
          targetX + "px";

        piece.style.top =
          targetY + "px";


        // LOCK IT

        piece.dataset.locked =
          "true";

        piece.classList.add(
          "locked"
        );

        piece.style.zIndex =
          index + 1;


        lockedCount++;


        message.textContent =
          `${lockedCount} / ${TOTAL} pieces placed`;


        if (
          lockedCount === TOTAL
        ) {

          solved = true;

          clearInterval(timerID);

          message.textContent =
            "🎉 Puzzle complete!";
        }


        return true;
      }


      return false;
    }


    // =================================
    // POINTER DOWN
    // =================================

    piece.addEventListener(
      "pointerdown",
      event => {

        if (
          solved ||
          piece.dataset.locked === "true"
        ) {
          return;
        }


        event.preventDefault();


        dragging = true;

        pointerID =
          event.pointerId;


        piece.setPointerCapture(
          pointerID
        );


        const rect =
          piece.getBoundingClientRect();


        offsetX =
          event.clientX -
          rect.left;

        offsetY =
          event.clientY -
          rect.top;


        piece.classList.add(
          "dragging"
        );


        piece.style.zIndex =
          ++zIndex;
      },
      {
        passive: false
      }
    );


    // =================================
    // POINTER MOVE
    //
    // AUTO-LOCK HAPPENS HERE
    // =================================

    piece.addEventListener(
      "pointermove",
      event => {

        if (
          !dragging ||
          event.pointerId !== pointerID
        ) {
          return;
        }


        event.preventDefault();


        const boardRect =
          board.getBoundingClientRect();


        let x =
          event.clientX -
          boardRect.left -
          offsetX;

        let y =
          event.clientY -
          boardRect.top -
          offsetY;


        const currentPieceWidth =
          board.clientWidth / COLS;

        const currentPieceHeight =
          board.clientHeight / ROWS;


        const maxX =
          board.clientWidth -
          currentPieceWidth;

        const maxY =
          board.clientHeight -
          currentPieceHeight;


        x =
          Math.max(
            0,
            Math.min(
              maxX,
              x
            )
          );


        y =
          Math.max(
            0,
            Math.min(
              maxY,
              y
            )
          );


        piece.style.left =
          x + "px";

        piece.style.top =
          y + "px";


        // ==============================
        // INSTANT AUTO LOCK
        // ==============================

        if (
          checkCorrectPosition()
        ) {

          dragging = false;

          piece.classList.remove(
            "dragging"
          );


          try {

            piece.releasePointerCapture(
              pointerID
            );

          } catch (e) {}


          pointerID = null;
        }

      },
      {
        passive: false
      }
    );


    // =================================
    // POINTER UP
    // =================================

    piece.addEventListener(
      "pointerup",
      event => {

        if (!dragging) {
          return;
        }


        dragging = false;

        piece.classList.remove(
          "dragging"
        );


        pointerID = null;


        // Backup check
        checkCorrectPosition();
      }
    );


    piece.addEventListener(
      "pointercancel",
      () => {

        dragging = false;

        piece.classList.remove(
          "dragging"
        );

        pointerID = null;
      }
    );


    board.appendChild(
      piece
    );


    return piece;
  }


  // ==============================
  // LOAD PUZZLE
  // ==============================

  function loadPuzzle() {

    clearInterval(timerID);

    solved = false;

    lockedCount = 0;

    pieces = [];

    board.innerHTML = "";


    currentImage =
      chooseImage();


    message.textContent =
      "Loading puzzle…";


    const img =
      new Image();


    img.onload = () => {

      imageRatio =
        img.naturalWidth /
        img.naturalHeight;


      if (preview) {

        preview.src =
          currentImage;
      }


      updateBoardSize();


      requestAnimationFrame(() => {

        const boardWidth =
          board.clientWidth;

        const boardHeight =
          board.clientHeight;


        /*
          Every puzzle always has
          exactly 50 pieces.
        */

        const order =
          shuffleArray(
            [...Array(TOTAL).keys()]
          );


        order.forEach(index => {

          const piece =
            createPiece(
              index,
              currentImage,
              boardWidth,
              boardHeight
            );


          pieces.push(piece);
        });


        message.textContent =
          `0 / ${TOTAL} pieces placed`;


        startTimer();

      });
    };


    img.onerror = () => {

      message.textContent =
        "Unable to load puzzle image.";
    };


    img.src =
      currentImage;
  }


  // ==============================
  // SHUFFLE
  //
  // LOCKED PIECES NEVER MOVE
  // ==============================

  document
    .getElementById("shuffle")
    ?.addEventListener(
      "click",
      () => {

        if (
          !pieces.length ||
          solved
        ) {
          return;
        }


        pieces.forEach(
          piece => {

            if (
              piece.dataset.locked ===
              "true"
            ) {
              return;
            }


            const maxX =
              board.clientWidth -
              piece.offsetWidth;

            const maxY =
              board.clientHeight -
              piece.offsetHeight;


            piece.style.left =
              Math.random() *
              Math.max(
                0,
                maxX
              ) +
              "px";


            piece.style.top =
              Math.random() *
              Math.max(
                0,
                maxY
              ) +
              "px";


            piece.style.zIndex =
              ++zIndex;
          }
        );


        message.textContent =
          `${lockedCount} / ${TOTAL} pieces placed`;
      }
    );


  // ==============================
  // NEW PUZZLE
  // ==============================

  document
    .getElementById("newPuzzle")
    ?.addEventListener(
      "click",
      loadPuzzle
    );


  // ==============================
  // SCREEN RESIZE
  // ==============================

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          () => {

            /*
              New puzzle after orientation/
              major screen-size changes so
              every tile remains perfectly
              aligned with the image.
            */

            loadPuzzle();

          },
          150
        );
    }
  );


  // ==============================
  // START
  // ==============================

  loadPuzzle();

})();  let imageHeight = 1;

  let lockedCount = 0;
  let solved = false;

  let timerID = null;
  let startTime = 0;

  let zIndex = 100;

  /*
    Shared edge arrays.

    horizontalEdges[r][c]
      = cut between row r-1 and row r.

    verticalEdges[r][c]
      = cut between column c-1 and column c.

    IMPORTANT:
    Each shared edge is generated ONLY ONCE.
    Therefore neighboring pieces always receive
    the exact complementary cut.
  */

  let horizontalEdges = [];
  let verticalEdges = [];


  // =========================================================
  // RANDOM IMAGE
  // =========================================================

  function chooseImage() {

    let available =
      IMAGE_URLS.filter(url => url !== currentImage);

    if (available.length === 0) {
      available = IMAGE_URLS;
    }

    return available[
      Math.floor(Math.random() * available.length)
    ];
  }


  // =========================================================
  // SHUFFLE ARRAY
  // =========================================================

  function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

      const j =
        Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] =
        [array[j], array[i]];
    }

    return array;
  }


  // =========================================================
  // TIMER
  // =========================================================

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

    clearInterval(timerID);

    startTime = Date.now();

    timerID = setInterval(() => {

      const elapsed =
        Math.floor(
          (Date.now() - startTime) / 1000
        );

      timerEl.textContent =
        formatTime(elapsed);

    }, 250);
  }


  // =========================================================
  // CREATE SHARED JIGSAW EDGES
  // =========================================================

  function generateEdges() {

    horizontalEdges =
      Array.from(
        { length: ROWS + 1 },
        () => Array(COLS).fill(0)
      );

    verticalEdges =
      Array.from(
        { length: ROWS },
        () => Array(COLS + 1).fill(0)
      );


    // Horizontal internal cuts
    for (let row = 1; row < ROWS; row++) {

      for (let col = 0; col < COLS; col++) {

        horizontalEdges[row][col] =
          Math.random() < 0.5 ? 1 : -1;
      }
    }


    // Vertical internal cuts
    for (let row = 0; row < ROWS; row++) {

      for (let col = 1; col < COLS; col++) {

        verticalEdges[row][col] =
          Math.random() < 0.5 ? 1 : -1;
      }
    }
  }


  // =========================================================
  // HORIZONTAL JIGSAW EDGE
  //
  // Starts at x=0 and finishes at x=w.
  //
  // sign:
  //   +1 = tab outward
  //   -1 = indentation
  //    0 = straight border
  // =========================================================

  function horizontalEdge(
    w,
    h,
    y,
    sign,
    reverse = false
  ) {

    if (sign === 0) {

      return reverse
        ? `L 0 ${y}`
        : `L ${w} ${y}`;
    }


    const depth =
      Math.min(w, h) * 0.23;

    const neck =
      Math.min(w, h) * 0.075;

    const a = w * 0.36;
    const b = w * 0.64;
    const mid = w * 0.50;


    /*
      Smooth cubic curves create a rounded
      jigsaw knob instead of a crude bump.
    */

    let path =
      `L ${a} ${y}
       C ${w*0.40} ${y},
         ${w*0.43} ${y + sign*neck},
         ${mid} ${y + sign*neck}

       C ${w*0.57} ${y + sign*neck},
         ${w*0.59} ${y + sign*depth},
         ${mid} ${y + sign*depth}

       C ${w*0.41} ${y + sign*depth},
         ${w*0.43} ${y + sign*neck},
         ${b} ${y + sign*neck}

       C ${w*0.60} ${y + sign*neck},
         ${w*0.62} ${y},
         ${b} ${y}

       L ${w} ${y}`;


    /*
      Bottom edges are traversed backwards.
      Reverse the completed path mathematically
      by using a dedicated mirrored form.
    */

    if (reverse) {

      path =
        `L ${b} ${y}
         C ${w*0.62} ${y},
           ${w*0.60} ${y + sign*neck},
           ${w*0.57} ${y + sign*neck}

         C ${w*0.59} ${y + sign*neck},
           ${w*0.57} ${y + sign*depth},
           ${mid} ${y + sign*depth}

         C ${w*0.43} ${y + sign*depth},
           ${w*0.41} ${y + sign*neck},
           ${mid} ${y + sign*neck}

         C ${w*0.43} ${y + sign*neck},
           ${w*0.40} ${y},
           ${a} ${y}

         L 0 ${y}`;
    }

    return path;
  }


  // =========================================================
  // VERTICAL JIGSAW EDGE
  // =========================================================

  function verticalEdge(
    w,
    h,
    x,
    sign,
    reverse = false
  ) {

    if (sign === 0) {

      return reverse
        ? `L ${x} 0`
        : `L ${x} ${h}`;
    }


    const depth =
      Math.min(w, h) * 0.23;

    const neck =
      Math.min(w, h) * 0.075;

    const a = h * 0.36;
    const b = h * 0.64;
    const mid = h * 0.50;


    let path =
      `L ${x} ${a}

       C ${x} ${h*0.40},
         ${x + sign*neck} ${h*0.43},
         ${x + sign*neck} ${mid}

       C ${x + sign*neck} ${h*0.57},
         ${x + sign*depth} ${h*0.59},
         ${x + sign*depth} ${mid}

       C ${x + sign*depth} ${h*0.41},
         ${x + sign*neck} ${h*0.43},
         ${x + sign*neck} ${b}

       C ${x + sign*neck} ${h*0.60},
         ${x} ${h*0.62},
         ${x} ${b}

       L ${x} ${h}`;


    if (reverse) {

      path =
        `L ${x} ${b}

         C ${x} ${h*0.62},
           ${x + sign*neck} ${h*0.60},
           ${x + sign*neck} ${h*0.57}

         C ${x + sign*neck} ${h*0.59},
           ${x + sign*depth} ${h*0.57},
           ${x + sign*depth} ${mid}

         C ${x + sign*depth} ${h*0.43},
           ${x + sign*neck} ${h*41},
           ${x + sign*neck} ${a}

         C ${x + sign*neck} ${h*0.43},
           ${x} ${h*0.40},
           ${x} ${a}

         L ${x} 0`;
    }

    return path;
  }


  // =========================================================
  // BUILD COMPLETE PIECE PATH
  // =========================================================

  function createPiecePath(
    pw,
    ph,
    top,
    right,
    bottom,
    left
  ) {

    let d = `M 0 0`;

    // TOP: left -> right
    d += horizontalEdge(
      pw,
      ph,
      0,
      top,
      false
    );

    // RIGHT: top -> bottom
    d += verticalEdge(
      pw,
      ph,
      pw,
      right,
      false
    );

    // BOTTOM: right -> left
    d += horizontalEdge(
      pw,
      ph,
      ph,
      bottom,
      true
    );

    // LEFT: bottom -> top
    d += verticalEdge(
      pw,
      ph,
      0,
      left,
      true
    );

    d += " Z";

    return d;
  }


  // =========================================================
  // GET PIECE EDGE VALUES
  //
  // Every neighboring pair uses the same shared edge
  // with opposite direction.
  // =========================================================

  function getEdges(row, col) {

    return {

      top:
        row === 0
          ? 0
          : -horizontalEdges[row][col],

      right:
        col === COLS - 1
          ? 0
          : verticalEdges[row][col + 1],

      bottom:
        row === ROWS - 1
          ? 0
          : horizontalEdges[row + 1][col],

      left:
        col === 0
          ? 0
          : -verticalEdges[row][col]

    };
  }


  // =========================================================
  // CREATE PIECE
  // =========================================================

  function createPiece(
    index,
    imageURL,
    boardWidth,
    boardHeight
  ) {

    const col =
      index % COLS;

    const row =
      Math.floor(index / COLS);


    const pw =
      boardWidth / COLS;

    const ph =
      boardHeight / ROWS;


    /*
      Extra room allows the tabs to extend
      outside the normal tile rectangle.
    */

    const padding =
      Math.min(pw, ph) * 0.27;


    const piece =
      document.createElement("div");

    piece.className = "piece";

    piece.dataset.correct =
      index;

    piece.dataset.locked =
      "false";


    piece.style.width =
      pw + "px";

    piece.style.height =
      ph + "px";


    // =======================================================
    // SVG
    // =======================================================

    const svg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    svg.setAttribute(
      "viewBox",
      `${-padding} ${-padding} ${
        pw + padding * 2
      } ${
        ph + padding * 2
      }`
    );

    svg.setAttribute(
      "preserveAspectRatio",
      "none"
    );


    const defs =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs"
      );


    const clip =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "clipPath"
      );


    const clipID =
      "clip_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2);


    clip.id = clipID;


    const path =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );


    const edges =
      getEdges(row, col);


    const pathData =
      createPiecePath(
        pw,
        ph,
        edges.top,
        edges.right,
        edges.bottom,
        edges.left
      );


    path.setAttribute(
      "d",
      pathData
    );


    clip.appendChild(path);

    defs.appendChild(clip);


    // =======================================================
    // IMAGE
    // =======================================================

    const image =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
      );


    image.setAttribute(
      "href",
      imageURL
    );


    /*
      Position the complete image underneath
      the piece. Extra padding prevents tabs
      from becoming empty.
    */

    image.setAttribute(
      "x",
      -col * pw - padding
    );

    image.setAttribute(
      "y",
      -row * ph - padding
    );

    image.setAttribute(
      "width",
      boardWidth + padding * 2
    );

    image.setAttribute(
      "height",
      boardHeight + padding * 2
    );

    image.setAttribute(
      "clip-path",
      `url(#${clipID})`
    );

    image.setAttribute(
      "preserveAspectRatio",
      "none"
    );


    // =======================================================
    // CUT OUTLINE
    // =======================================================

    const outline =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );


    outline.setAttribute(
      "d",
      pathData
    );

    outline.setAttribute(
      "fill",
      "none"
    );

    outline.setAttribute(
      "stroke",
      "rgba(255,255,255,.42)"
    );

    outline.setAttribute(
      "stroke-width",
      Math.max(
        1,
        Math.min(pw, ph) * 0.012
      )
    );


    svg.appendChild(defs);
    svg.appendChild(image);
    svg.appendChild(outline);

    piece.appendChild(svg);


    // =======================================================
    // RANDOM START POSITION
    // =======================================================

    const maxX =
      Math.max(
        0,
        boardWidth - pw
      );

    const maxY =
      Math.max(
        0,
        boardHeight - ph
      );


    piece.style.left =
      Math.random() * maxX + "px";

    piece.style.top =
      Math.random() * maxY + "px";

    piece.style.zIndex =
      ++zIndex;


    // =======================================================
    // DRAG STATE
    // =======================================================

    let dragging = false;

    let pointerID = null;

    let offsetX = 0;

    let offsetY = 0;


    // =======================================================
    // TARGET CHECK
    // =======================================================

    function isCorrectPosition() {

      const targetX =
        col * (board.clientWidth / COLS);

      const targetY =
        row * (board.clientHeight / ROWS);


      const currentX =
        parseFloat(
          piece.style.left || 0
        );

      const currentY =
        parseFloat(
          piece.style.top || 0
        );


      const currentPW =
        board.clientWidth / COLS;

      const currentPH =
        board.clientHeight / ROWS;


      /*
        The instant the piece gets close enough,
        it is considered correctly placed.

        This is deliberately generous so the user
        doesn't need pixel-perfect mouse control.
      */

      const tolerance =
        Math.min(
          currentPW,
          currentPH
        ) * 0.32;


      return (
        Math.abs(
          currentX - targetX
        ) <= tolerance &&

        Math.abs(
          currentY - targetY
        ) <= tolerance
      );
    }


    // =======================================================
    // LOCK PIECE
    // =======================================================

    function lockPiece() {

      if (
        piece.dataset.locked === "true"
      ) {
        return;
      }


      const currentPW =
        board.clientWidth / COLS;

      const currentPH =
        board.clientHeight / ROWS;


      const targetX =
        col * currentPW;

      const targetY =
        row * currentPH;


      // EXACT FINAL POSITION

      piece.style.left =
        targetX + "px";

      piece.style.top =
        targetY + "px";


      piece.dataset.locked =
        "true";


      piece.classList.add(
        "locked"
      );


      piece.style.zIndex =
        index + 1;


      lockedCount++;


      message.textContent =
        `${lockedCount} / ${TOTAL} pieces placed`;


      // COMPLETE

      if (
        lockedCount === TOTAL
      ) {

        solved = true;

        clearInterval(timerID);

        message.textContent =
          "🎉 Puzzle complete!";
      }
    }


    // =======================================================
    // POINTER DOWN
    // =======================================================

    piece.addEventListener(
      "pointerdown",
      event => {

        if (
          solved ||
          piece.dataset.locked === "true"
        ) {
          return;
        }


        event.preventDefault();


        dragging = true;

        pointerID =
          event.pointerId;


        piece.setPointerCapture(
          pointerID
        );


        const rect =
          piece.getBoundingClientRect();


        offsetX =
          event.clientX -
          rect.left;


        offsetY =
          event.clientY -
          rect.top;


        piece.classList.add(
          "dragging"
        );


        piece.style.zIndex =
          ++zIndex;

      },
      {
        passive: false
      }
    );


    // =======================================================
    // POINTER MOVE
    //
    // AUTO-LOCK HAPPENS HERE.
    // =======================================================

    piece.addEventListener(
      "pointermove",
      event => {

        if (
          !dragging ||
          event.pointerId !== pointerID
        ) {
          return;
        }


        event.preventDefault();


        const boardRect =
          board.getBoundingClientRect();


        let x =
          event.clientX -
          boardRect.left -
          offsetX;


        let y =
          event.clientY -
          boardRect.top -
          offsetY;


        const currentPW =
          board.clientWidth / COLS;

        const currentPH =
          board.clientHeight / ROWS;


        const maxX =
          board.clientWidth -
          currentPW;

        const maxY =
          board.clientHeight -
          currentPH;


        x =
          Math.max(
            0,
            Math.min(
              maxX,
              x
            )
          );


        y =
          Math.max(
            0,
            Math.min(
              maxY,
              y
            )
          );


        piece.style.left =
          x + "px";


        piece.style.top =
          y + "px";


        // ==================================================
        // IMMEDIATE AUTO LOCK
        // ==================================================

        if (
          isCorrectPosition()
        ) {

          dragging = false;

          piece.classList.remove(
            "dragging"
          );


          try {

            piece.releasePointerCapture(
              pointerID
            );

          } catch (e) {}


          pointerID = null;


          lockPiece();
        }

      },
      {
        passive: false
      }
    );


    // =======================================================
    // POINTER UP
    // =======================================================

    function pointerUp(event) {

      if (!dragging) {
        return;
      }


      if (
        event.pointerId !== undefined &&
        event.pointerId !== pointerID
      ) {
        return;
      }


      dragging = false;

      piece.classList.remove(
        "dragging"
      );


      pointerID = null;


      /*
        Backup check in case the pointer
        stopped exactly at the target.
      */

      if (
        isCorrectPosition()
      ) {

        lockPiece();
      }
    }


    piece.addEventListener(
      "pointerup",
      pointerUp
    );


    piece.addEventListener(
      "pointercancel",
      pointerUp
    );


    board.appendChild(
      piece
    );


    return piece;
  }


  // =========================================================
  // BOARD SIZE
  // =========================================================

  function updateBoardLayout() {

    if (!board) {
      return;
    }


    const section =
      board.parentElement;


    const availableWidth =
      section.clientWidth;


    const availableHeight =
      Math.max(
        180,
        section.clientHeight -
        (message?.offsetHeight || 24) -
        44
      );


    let width =
      availableWidth;


    let height =
      width / imageRatio;


    if (
      height > availableHeight
    ) {

      height =
        availableHeight;

      width =
        height * imageRatio;
    }


    board.style.width =
      Math.max(
        160,
        width
      ) + "px";


    board.style.height =
      Math.max(
        120,
        height
      ) + "px";


    board.style.aspectRatio =
      imageRatio;


    /*
      If the screen changed size,
      resize every piece while keeping
      locked pieces exactly locked.
    */

    if (!pieces.length) {
      return;
    }


    const newW =
      board.clientWidth;

    const newH =
      board.clientHeight;


    pieces.forEach(
      piece => {

        const index =
          Number(
            piece.dataset.correct
          );


        const col =
          index % COLS;

        const row =
          Math.floor(
            index / COLS
          );


        const pw =
          newW / COLS;

        const ph =
          newH / ROWS;


        if (
          piece.dataset.locked ===
          "true"
        ) {

          piece.style.left =
            col * pw + "px";

          piece.style.top =
            row * ph + "px";
        }

        else {

          const x =
            parseFloat(
              piece.style.left || 0
            );

          const y =
            parseFloat(
              piece.style.top || 0
            );


          piece.style.left =
            Math.min(
              Math.max(
                0,
                x
              ),
              newW - pw
            ) + "px";


          piece.style.top =
            Math.min(
              Math.max(
                0,
                y
              ),
              newH - ph
            ) + "px";
        }


        piece.style.width =
          pw + "px";


        piece.style.height =
          ph + "px";


        /*
          Rebuild the SVG viewBox/image
          so the cuts remain perfect after
          resizing or reference minimization.
        */

        const svg =
          piece.querySelector(
            "svg"
          );


        if (!svg) {
          return;
        }


        const padding =
          Math.min(
            pw,
            ph
          ) * 0.27;


        svg.setAttribute(
          "viewBox",
          `${-padding} ${-padding} ${
            pw + padding * 2
          } ${
            ph + padding * 2
          }`
        );


        const row2 =
          Math.floor(
            index / COLS
          );


        const edges =
          getEdges(
            row2,
            col
          );


        const pathData =
          createPiecePath(
            pw,
            ph,
            edges.top,
            edges.right,
            edges.bottom,
            edges.left
          );


        const paths =
          svg.querySelectorAll(
            "path"
          );


        if (paths.length >= 2) {

          paths[0].setAttribute(
            "d",
            pathData
          );

          paths[1].setAttribute(
            "d",
            pathData
          );
        }


        const image =
          svg.querySelector(
            "image"
          );


        if (image) {

          image.setAttribute(
            "x",
            -col * pw - padding
          );

          image.setAttribute(
            "y",
            -row2 * ph - padding
          );

          image.setAttribute(
            "width",
            newW + padding * 2
          );

          image.setAttribute(
            "height",
            newH + padding * 2
          );
        }
      }
    );
  }


  // =========================================================
  // LOAD PUZZLE
  // =========================================================

  function loadPuzzle() {

    clearInterval(timerID);

    solved = false;

    lockedCount = 0;

    pieces = [];

    board.innerHTML = "";


    currentImage =
      chooseImage();


    message.textContent =
      "Loading puzzle…";


    const img =
      new Image();


    img.onload = () => {

      imageWidth =
        img.naturalWidth;

      imageHeight =
        img.naturalHeight;


      imageRatio =
        imageWidth /
        imageHeight;


      if (preview) {

        preview.src =
          currentImage;
      }


      /*
        Generate shared cuts BEFORE
        creating any pieces.
      */

      generateEdges();


      updateBoardLayout();


      requestAnimationFrame(
        () => {

          const bw =
            board.clientWidth;

          const bh =
            board.clientHeight;


          const order =
            shuffleArray(
              [...Array(TOTAL).keys()]
            );


          order.forEach(
            index => {

              const piece =
                createPiece(
                  index,
                  currentImage,
                  bw,
                  bh
                );


              pieces.push(
                piece
              );
            }
          );


          message.textContent =
            `0 / ${TOTAL} pieces placed`;


          startTimer();
        }
      );
    };


    img.onerror = () => {

      message.textContent =
        "Unable to load puzzle image.";
    };


    img.src =
      currentImage;
  }


  // =========================================================
  // SHUFFLE
  //
  // LOCKED PIECES ARE NEVER MOVED.
  // =========================================================

  document
    .getElementById("shuffle")
    ?.addEventListener(
      "click",
      () => {

        if (
          !pieces.length ||
          solved
        ) {
          return;
        }


        pieces.forEach(
          piece => {

            if (
              piece.dataset.locked ===
              "true"
            ) {
              return;
            }


            const maxX =
              board.clientWidth -
              piece.offsetWidth;


            const maxY =
              board.clientHeight -
              piece.offsetHeight;


            piece.style.left =
              Math.random() *
              Math.max(
                0,
                maxX
              ) + "px";


            piece.style.top =
              Math.random() *
              Math.max(
                0,
                maxY
              ) + "px";


            piece.style.zIndex =
              ++zIndex;
          }
        );


        message.textContent =
          `${lockedCount} / ${TOTAL} pieces placed`;
      }
    );


  // =========================================================
  // NEW PUZZLE
  // =========================================================

  document
    .getElementById("newPuzzle")
    ?.addEventListener(
      "click",
      loadPuzzle
    );


  // =========================================================
  // SCREEN RESIZE
  // =========================================================

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          updateBoardLayout,
          150
        );
    }
  );


  // =========================================================
  // START
  // =========================================================

  window.updatePuzzleLayout =
    updateBoardLayout;


  loadPuzzle();

})();
  let imageWidth = 1;
  let imageHeight = 1;

  let solved = false;

  let startTime = 0;
  let timerID = null;

  let zIndex = 20;


  // ==============================
  // SHUFFLE
  // ==============================

  function shuffle(array){

    for(let i = array.length - 1; i > 0; i--){

      const j =
        Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] =
        [array[j], array[i]];
    }

    return array;
  }


  // ==============================
  // RANDOM IMAGE
  // ==============================

  function chooseImage(){

    let choices =
      IMAGE_URLS.filter(
        url => url !== currentImage
      );

    if(choices.length === 0){
      choices = IMAGE_URLS;
    }

    return choices[
      Math.floor(Math.random() * choices.length)
    ];
  }


  // ==============================
  // TIMER
  // ==============================

  function formatTime(seconds){

    const mins =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    return (
      String(mins).padStart(2,"0") +
      ":" +
      String(secs).padStart(2,"0")
    );
  }


  function startTimer(){

    clearInterval(timerID);

    startTime = Date.now();

    timerID = setInterval(() => {

      const elapsed =
        Math.floor(
          (Date.now() - startTime) / 1000
        );

      timerEl.textContent =
        formatTime(elapsed);

    },250);
  }


  // ==============================
  // SET BOARD SIZE
  // ==============================

  function setBoardSize(){

    const ratio =
      imageWidth / imageHeight;

    board.style.aspectRatio =
      `${imageWidth} / ${imageHeight}`;

    /*
      Limit the board height so it fits
      comfortably on the screen.
    */

    const availableWidth =
      board.parentElement.clientWidth;

    const maxHeight =
      window.innerHeight * 0.68;

    let width =
      availableWidth;

    let height =
      width / ratio;

    if(height > maxHeight){

      height = maxHeight;

      width = height * ratio;
    }

    board.style.width =
      Math.min(
        width,
        availableWidth
      ) + "px";

    board.style.height =
      height + "px";
  }


  // ==============================
  // CREATE ONE SQUARE/GRID TILE
  // ==============================

  function createPiece(
    index,
    imageURL,
    boardWidth,
    boardHeight
  ){

    const col =
      index % COLS;

    const row =
      Math.floor(index / COLS);

    const pieceW =
      boardWidth / COLS;

    const pieceH =
      boardHeight / ROWS;


    const piece =
      document.createElement("div");

    piece.className = "piece";

    piece.dataset.correct = index;

    piece.dataset.locked = "false";


    piece.style.width =
      pieceW + "px";

    piece.style.height =
      pieceH + "px";


    /*
      Show the correct part of the
      selected image.
    */

    piece.style.backgroundImage =
      `url("${imageURL}")`;

    piece.style.backgroundSize =
      `${boardWidth}px ${boardHeight}px`;

    piece.style.backgroundPosition =
      `-${col * pieceW}px -${row * pieceH}px`;


    // ==========================
    // RANDOM START POSITION
    // ==========================

    const maxX =
      Math.max(0, boardWidth - pieceW);

    const maxY =
      Math.max(0, boardHeight - pieceH);

    piece.style.left =
      Math.random() * maxX + "px";

    piece.style.top =
      Math.random() * maxY + "px";


    // ==========================
    // DRAGGING
    // ==========================

    let dragging = false;

    let pointerID = null;

    let offsetX = 0;
    let offsetY = 0;


    piece.addEventListener(
      "pointerdown",
      event => {

        if(
          solved ||
          piece.dataset.locked === "true"
        ){
          return;
        }

        event.preventDefault();

        dragging = true;

        pointerID =
          event.pointerId;

        piece.setPointerCapture(
          event.pointerId
        );


        const rect =
          piece.getBoundingClientRect();

        offsetX =
          event.clientX - rect.left;

        offsetY =
          event.clientY - rect.top;


        piece.style.zIndex =
          ++zIndex;

        piece.classList.add("dragging");

      },
      {passive:false}
    );


    piece.addEventListener(
      "pointermove",
      event => {

        if(
          !dragging ||
          event.pointerId !== pointerID
        ){
          return;
        }

        event.preventDefault();


        const boardRect =
          board.getBoundingClientRect();


        let x =
          event.clientX -
          boardRect.left -
          offsetX;

        let y =
          event.clientY -
          boardRect.top -
          offsetY;


        const maxX =
          board.clientWidth -
          piece.offsetWidth;

        const maxY =
          board.clientHeight -
          piece.offsetHeight;


        x =
          Math.max(
            0,
            Math.min(maxX,x)
          );

        y =
          Math.max(
            0,
            Math.min(maxY,y)
          );


        piece.style.left =
          x + "px";

        piece.style.top =
          y + "px";

      },
      {passive:false}
    );


    function stopDragging(event){

      if(!dragging){
        return;
      }

      if(
        event &&
        event.pointerId !== undefined &&
        event.pointerId !== pointerID
      ){
        return;
      }


      dragging = false;

      pointerID = null;

      piece.classList.remove(
        "dragging"
      );


      checkPiece(piece);
    }


    piece.addEventListener(
      "pointerup",
      stopDragging
    );

    piece.addEventListener(
      "pointercancel",
      stopDragging
    );


    board.appendChild(piece);

    return piece;
  }


  // ==============================
  // CHECK ONE PIECE
  // ==============================

  function checkPiece(piece){

    if(
      piece.dataset.locked === "true"
    ){
      return;
    }


    const index =
      Number(piece.dataset.correct);


    const col =
      index % COLS;

    const row =
      Math.floor(index / COLS);


    const pieceW =
      board.clientWidth / COLS;

    const pieceH =
      board.clientHeight / ROWS;


    const targetX =
      col * pieceW;

    const targetY =
      row * pieceH;


    const currentX =
      parseFloat(
        piece.style.left || 0
      );

    const currentY =
      parseFloat(
        piece.style.top || 0
      );


    /*
      Piece only needs to be reasonably close.
      Then it snaps exactly into position.
    */

    const tolerance =
      Math.min(
        pieceW,
        pieceH
      ) * 0.28;


    if(
      Math.abs(currentX - targetX)
        <= tolerance &&

      Math.abs(currentY - targetY)
        <= tolerance
    ){

      piece.style.left =
        targetX + "px";

      piece.style.top =
        targetY + "px";


      // 🔒 PERMANENTLY LOCK IT

      piece.dataset.locked =
        "true";

      piece.classList.add(
        "locked"
      );


      piece.style.zIndex =
        index + 1;


      checkSolved();
    }
  }


  // ==============================
  // CHECK COMPLETE
  // ==============================

  function checkSolved(){

    const locked =
      pieces.filter(
        piece =>
          piece.dataset.locked === "true"
      ).length;


    message.textContent =
      `${locked} / ${TOTAL} pieces placed`;


    if(locked === TOTAL){

      solved = true;

      clearInterval(timerID);

      message.textContent =
        "🎉 Puzzle complete!";
    }
  }


  // ==============================
  // LOAD PUZZLE
  // ==============================

  function loadPuzzle(){

    clearInterval(timerID);

    solved = false;

    pieces = [];

    board.innerHTML = "";

    currentImage =
      chooseImage();


    message.textContent =
      "Loading puzzle…";


    /*
      Load image first so we know
      its real width/height.
    */

    const img =
      new Image();


    img.onload = () => {

      imageWidth =
        img.naturalWidth;

      imageHeight =
        img.naturalHeight;


      preview.src =
        currentImage;


      setBoardSize();


      requestAnimationFrame(() => {

        const boardWidth =
          board.clientWidth;

        const boardHeight =
          board.clientHeight;


        const order =
          shuffle(
            [...Array(TOTAL).keys()]
          );


        order.forEach(index => {

          const piece =
            createPiece(
              index,
              currentImage,
              boardWidth,
              boardHeight
            );

          pieces.push(piece);
        });


        message.textContent =
          "Hold and drag the pieces into place.";

        startTimer();

      });

    };


    img.onerror = () => {

      message.textContent =
        "Unable to load puzzle image.";

    };


    img.src =
      currentImage;
  }


  // ==============================
  // SHUFFLE PIECES
  // ==============================

  document
    .getElementById("shuffle")
    .addEventListener(
      "click",
      () => {

        if(!pieces.length){
          return;
        }


        pieces.forEach(piece => {

          /*
            Locked pieces are NEVER moved.
          */

          if(
            piece.dataset.locked === "true"
          ){
            return;
          }


          const maxX =
            board.clientWidth -
            piece.offsetWidth;

          const maxY =
            board.clientHeight -
            piece.offsetHeight;


          piece.style.left =
            Math.random() *
            Math.max(0,maxX) +
            "px";

          piece.style.top =
            Math.random() *
            Math.max(0,maxY) +
            "px";


          piece.style.zIndex =
            ++zIndex;
        });


        message.textContent =
          "Unplaced pieces shuffled 🔀";
      }
    );


  // ==============================
  // NEW PUZZLE
  // ==============================

  document
    .getElementById("newPuzzle")
    .addEventListener(
      "click",
      loadPuzzle
    );


  // ==============================
  // RESIZE
  // ==============================

  window.addEventListener(
    "resize",
    () => {

      /*
        Rebuild only when the screen
        changes size significantly.
      */

      if(pieces.length){
        loadPuzzle();
      }

    }
  );


  // ==============================
  // START
  // ==============================

  loadPuzzle();

})();  let solved = false;
  let zIndex = 20;

  // Random number between -1 and 1
  function randSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  // Shuffle array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Choose another image, avoiding immediate repeat
  function chooseImage() {
    let choices = IMAGE_URLS.filter(url => url !== currentImage);

    if (choices.length === 0) {
      choices = IMAGE_URLS;
    }

    return choices[Math.floor(Math.random() * choices.length)];
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
      String(mins).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  }

  function startTimer() {
    clearInterval(timerID);

    startTime = Date.now();

    timerID = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTime) / 1000
      );

      timerEl.textContent = formatTime(elapsed);
    }, 250);
  }

  // ==========================================
  // CREATE A CURVED JIGSAW EDGE
  // ==========================================

  /*
     direction:
     top    = -1
     right  = 1
     bottom = 1
     left   = -1

     tab:
     +1 = sticking OUT
     -1 = going IN
  */

  function edgePath(
    x,
    y,
    length,
    direction,
    tabDirection,
    horizontal
  ) {
    const mid = length / 2;
    const neck = length * 0.18;
    const tabWidth = length * 0.20;
    const tabDepth = TAB * tabDirection;

    if (horizontal) {
      const y2 = y + direction * tabDepth;

      return `
        L ${x + mid - tabWidth} ${y}
        C ${x + mid - tabWidth * 0.65} ${y},
          ${x + mid - tabWidth * 0.65} ${y2},
          ${x + mid} ${y2}
        C ${x + mid + tabWidth * 0.65} ${y2},
          ${x + mid + tabWidth * 0.65} ${y},
          ${x + mid + tabWidth} ${y}
        L ${x + length} ${y}
      `;
    } else {
      const x2 = x + direction * tabDepth;

      return `
        L ${x} ${y + mid - tabWidth}
        C ${x} ${y + mid - tabWidth * 0.65},
          ${x2} ${y + mid - tabWidth * 0.65},
          ${x2} ${y + mid}
        C ${x2} ${y + mid + tabWidth * 0.65},
          ${x} ${y + mid + tabWidth * 0.65},
          ${x} ${y + mid + tabWidth}
        L ${x} ${y + length}
      `;
    }
  }

  // ==========================================
  // BUILD SVG JIGSAW PIECE
  // ==========================================

  function createPiece(index, imageURL, boardWidth, boardHeight, edges) {

    const col = index % COLS;
    const row = Math.floor(index / COLS);

    const pieceW = boardWidth / COLS;
    const pieceH = boardHeight / ROWS;

    const svgW = pieceW + TAB * 2;
    const svgH = pieceH + TAB * 2;

    // Offset inside SVG so tabs have room
    const ox = TAB;
    const oy = TAB;

    let path = `M ${ox} ${oy}`;

    // TOP
    if (row === 0) {
      path += ` L ${ox + pieceW} ${oy}`;
    } else {
      path += edgePath(
        ox,
        oy,
        pieceW,
        -1,
        edges.horizontal[row - 1][col],
        true
      );
    }

    // RIGHT
    if (col === COLS - 1) {
      path += ` L ${ox + pieceW} ${oy + pieceH}`;
    } else {
      path += edgePath(
        ox + pieceW,
        oy,
        pieceH,
        1,
        edges.vertical[row][col],
        false
      );
    }

    // BOTTOM
    if (row === ROWS - 1) {
      path += ` L ${ox} ${oy + pieceH}`;
    } else {
      path += edgePath(
        ox + pieceW,
        oy + pieceH,
        pieceW,
        1,
        edges.horizontal[row][col],
        true
      );
    }

    // LEFT
    if (col === 0) {
      path += ` L ${ox} ${oy}`;
    } else {
      path += edgePath(
        ox,
        oy + pieceH,
        pieceH,
        -1,
        edges.vertical[row][col - 1],
        false
      );
    }

    path += " Z";

    // Create SVG
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    svg.setAttribute("width", svgW);
    svg.setAttribute("height", svgH);
    svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

    svg.style.position = "absolute";
    svg.style.width = svgW + "px";
    svg.style.height = svgH + "px";
    svg.style.userSelect = "none";
    svg.style.webkitUserSelect = "none";
    svg.style.touchAction = "none";
    svg.style.cursor = "grab";
    svg.style.zIndex = ++zIndex;
    svg.dataset.correct = index;

    // Unique IDs
    const clipID =
      "clip_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2);

    const clip = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "clipPath"
    );

    clip.setAttribute("id", clipID);

    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    pathElement.setAttribute("d", path);

    clip.appendChild(pathElement);

    // Image
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );

    image.setAttribute("href", imageURL);

    /*
      The entire board-sized image is placed underneath
      the piece, so every piece shows the correct portion.
    */
    image.setAttribute("x", ox - col * pieceW);
    image.setAttribute("y", oy - row * pieceH);
    image.setAttribute("width", boardWidth);
    image.setAttribute("height", boardHeight);
    image.setAttribute("preserveAspectRatio", "none");

    image.setAttribute("clip-path", `url(#${clipID})`);

    // Slight outline
    const outline = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    outline.setAttribute("d", path);
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", "rgba(255,255,255,0.65)");
    outline.setAttribute("stroke-width", "1");

    svg.appendChild(clip);
    svg.appendChild(image);
    svg.appendChild(outline);

    // ==========================================
    // DRAGGING — WORKS WITH MOUSE + TOUCH
    // ==========================================

    let dragging = false;
    let pointerID = null;
    let offsetX = 0;
    let offsetY = 0;

    svg.addEventListener(
      "pointerdown",
      event => {
        if (solved) return;

        event.preventDefault();

        dragging = true;
        pointerID = event.pointerId;

        svg.setPointerCapture(event.pointerId);

        const boardRect = board.getBoundingClientRect();
        const rect = svg.getBoundingClientRect();

        offsetX =
          event.clientX - rect.left;

        offsetY =
          event.clientY - rect.top;

        svg.style.cursor = "grabbing";
        svg.style.zIndex = ++zIndex;
      },
      { passive: false }
    );

    svg.addEventListener(
      "pointermove",
      event => {
        if (!dragging || event.pointerId !== pointerID) {
          return;
        }

        event.preventDefault();

        const boardRect =
          board.getBoundingClientRect();

        let x =
          event.clientX -
          boardRect.left -
          offsetX;

        let y =
          event.clientY -
          boardRect.top -
          offsetY;

        // Keep pieces mostly inside board
        x = Math.max(
          -TAB,
          Math.min(
            board.clientWidth - svgW + TAB,
            x
          )
        );

        y = Math.max(
          -TAB,
          Math.min(
            board.clientHeight - svgH + TAB,
            y
          )
        );

        svg.style.left = x + "px";
        svg.style.top = y + "px";
      },
      { passive: false }
    );

    function stopDragging(event) {
      if (!dragging) return;

      if (
        event &&
        event.pointerId !== undefined &&
        event.pointerId !== pointerID
      ) {
        return;
      }

      dragging = false;
      pointerID = null;

      svg.style.cursor = "grab";

      checkSolved();
    }

    svg.addEventListener("pointerup", stopDragging);
    svg.addEventListener("pointercancel", stopDragging);

    board.appendChild(svg);

    return svg;
  }

  // ==========================================
  // CREATE RANDOM TAB DIRECTIONS
  // ==========================================

  function generateEdges() {

    const horizontal = [];

    for (let r = 0; r < ROWS - 1; r++) {
      horizontal[r] = [];

      for (let c = 0; c < COLS; c++) {
        horizontal[r][c] = randSign();
      }
    }

    const vertical = [];

    for (let r = 0; r < ROWS; r++) {
      vertical[r] = [];

      for (let c = 0; c < COLS - 1; c++) {
        vertical[r][c] = randSign();
      }
    }

    return {
      horizontal,
      vertical
    };
  }

  // ==========================================
  // CHECK WHETHER ALL PIECES ARE SOLVED
  // ==========================================

  function checkSolved() {

    if (!pieces.length || solved) return;

    const boardWidth = board.clientWidth;
    const boardHeight = board.clientHeight;

    const pieceW = boardWidth / COLS;
    const pieceH = boardHeight / ROWS;

    // How close a piece has to be
    const tolerance = Math.min(
      pieceW,
      pieceH
    ) * 0.25;

    let correct = 0;

    pieces.forEach(piece => {

      const index = Number(
        piece.dataset.correct
      );

      const col = index % COLS;
      const row = Math.floor(index / COLS);

      const targetX =
        col * pieceW - TAB;

      const targetY =
        row * pieceH - TAB;

      const currentX =
        parseFloat(piece.style.left || 0);

      const currentY =
        parseFloat(piece.style.top || 0);

      if (
        Math.abs(currentX - targetX) <
          tolerance &&
        Math.abs(currentY - targetY) <
          tolerance
      ) {
        correct++;
      }
    });

    if (correct === TOTAL) {

      solved = true;

      clearInterval(timerID);

      message.textContent =
        "🎉 Puzzle complete!";

      // Snap every piece perfectly into place
      pieces.forEach(piece => {

        const index =
          Number(piece.dataset.correct);

        const col = index % COLS;
        const row = Math.floor(index / COLS);

        piece.style.left =
          col * pieceW - TAB + "px";

        piece.style.top =
          row * pieceH - TAB + "px";

        piece.style.zIndex = index + 1;
      });
    }
  }

  // ==========================================
  // LOAD NEW RANDOM PUZZLE
  // ==========================================

  function loadPuzzle() {

    currentImage = chooseImage();

    solved = false;
    pieces = [];

    board.innerHTML = "";

    message.textContent =
      "Hold and drag the pieces into place.";

    if (preview) {
      preview.src = currentImage;
    }

    requestAnimationFrame(() => {

      const boardWidth =
        board.clientWidth;

      const boardHeight =
        board.clientHeight;

      const edges = generateEdges();

      const order = shuffle(
        [...Array(TOTAL).keys()]
      );

      order.forEach(index => {

        const piece = createPiece(
          index,
          currentImage,
          boardWidth,
          boardHeight,
          edges
        );

        const pieceW =
          boardWidth / COLS;

        const pieceH =
          boardHeight / ROWS;

        const svgW = pieceW + TAB * 2;
        const svgH = pieceH + TAB * 2;

        // Random starting location
        const maxX =
          boardWidth - svgW + TAB;

        const maxY =
          boardHeight - svgH + TAB;

        piece.style.left =
          (
            Math.random() *
            Math.max(0, maxX)
          ) + "px";

        piece.style.top =
          (
            Math.random() *
            Math.max(0, maxY)
          ) + "px";
      });

      pieces = [
        ...board.querySelectorAll("svg")
      ];

      startTimer();
    });
  }

  // ==========================================
  // SHUFFLE
  // ==========================================

  document
    .getElementById("shuffle")
    .addEventListener("click", () => {

      if (!pieces.length) return;

      solved = false;

      const boardWidth =
        board.clientWidth;

      const boardHeight =
        board.clientHeight;

      pieces.forEach(piece => {

        const rect =
          piece.getBoundingClientRect();

        const maxX =
          boardWidth -
          rect.width +
          TAB;

        const maxY =
          boardHeight -
          rect.height +
          TAB;

        piece.style.left =
          Math.random() *
          Math.max(0, maxX) +
          "px";

        piece.style.top =
          Math.random() *
          Math.max(0, maxY) +
          "px";

        piece.style.zIndex =
          ++zIndex;
      });

      message.textContent =
        "Shuffled — keep going!";
    });

  // ==========================================
  // NEW PUZZLE
  // ==========================================

  document
    .getElementById("newPuzzle")
    .addEventListener(
      "click",
      loadPuzzle
    );

  // Start
  loadPuzzle();

})();
