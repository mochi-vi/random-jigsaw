(() => {
  // ==============================
  // YOUR 10 PUZZLE IMAGES
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

  // ==============================
  // PUZZLE SETTINGS
  // ==============================
  const COLS = 10;
  const ROWS = 5;
  const TOTAL = COLS * ROWS;

  // Size of the jigsaw tabs
  const TAB = 13;

  const board = document.getElementById("board");
  const preview = document.getElementById("preview");
  const message = document.getElementById("message");
  const timerEl = document.getElementById("timer");

  let pieces = [];
  let currentImage = null;
  let startTime = 0;
  let timerID = null;
  let solved = false;
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
