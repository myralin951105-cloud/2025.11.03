let questions = [];
let quiz = [];
let currentIndex = 0;
let score = 0;
let state = 'intro'; // intro, quiz, result
let buttons = [];
let startBtn, downloadBtn, retryBtn;
let messageDiv;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  initQuestionBank();
  createUI();
  positionUI();
}

function draw() {
  background('#ffc8dd'); // 背景改為粉色 #ffc8dd
  drawBackgroundParticles();
  fill(0); // 文字顏色改為黑色 #000000
  noStroke();
  if (state === 'intro') {
    drawIntro();
  } else if (state === 'quiz') {
    drawQuestion();
  } else if (state === 'result') {
    drawResult();
  }
  updateParticles();
}

function initQuestionBank() {
  // p5.js 題庫
  questions = [
    {id:1, q:"setup() 在 p5.js 中會在何時執行？", choices:["每一幀都執行","只執行一次（程式初始化時）","每次滑鼠點擊時執行","只有在 resize 時執行"], a:1, fb:"setup() 只在程式啟動時執行一次，用來建立 canvas 與初始化變數。"},
    {id:2, q:"draw() 的主要用途是？", choices:["只在初始化時執行一次","每一幀連續執行以更新畫面","只在滑鼠移動時執行","僅用於載入資源"], a:1, fb:"draw() 在預設情況下每一幀都會執行，常用來持續更新動畫或互動。"},
    {id:3, q:"createCanvas() 通常放在哪個函式內？", choices:["preload()","setup()","draw()","任何函式皆可"], a:1, fb:"createCanvas() 通常放在 setup() 內，用以建立繪圖區域。"},
    {id:4, q:"mouseX 在 p5.js 中表示什麼？", choices:["滑鼠是否被按下","滑鼠的 x 座標（相對於 canvas）","滑鼠移動的速度","滑鼠的按鍵編號"], a:1, fb:"mouseX 與 mouseY 分別表示滑鼠在 canvas 上的 x、y 座標。"},
    {id:5, q:"呼叫 noLoop() 會發生什麼事？", choices:["停止 draw() 的重複呼叫，使畫面停止更新","清除畫布內容","重設所有變數為初始值","加速 frameRate()"], a:0, fb:"noLoop() 會停止 draw() 的迴圈，畫面不再自動更新，除非呼叫 loop()。"},
    {id:6, q:"frameRate(30) 的作用是？", choices:["設定文字大小為 30","設定每秒幀數為 30","設定畫布寬度為 30","設定隨機數的上限為 30"], a:1, fb:"frameRate(n) 用來設定每秒繪製幀數（FPS）。"},
    {id:7, q:"stroke() 在 p5.js 中用來做什麼？", choices:["設定形狀的填色","設定形狀的外框（邊線）顏色","設定文字字型","清除畫布"], a:1, fb:"stroke() 設定形狀或線條的邊線顏色；fill() 則用於填充內部。"},
    {id:8, q:"preload() 的主要用途是？", choices:["每一幀都執行初始化","在程式開始前同步載入資源（如影像、聲音）","用於顯示結果畫面","取代 setup() 的功能"], a:1, fb:"preload() 用於在程式啟動前載入外部資源，確保資源可用後才進行 setup()。"},
    {id:9, q:"image(img, x, y) 在 p5.js 中用於？", choices:["畫矩形","顯示影像（image）","設定字型","改變座標系統"], a:1, fb:"image() 用來在畫布上顯示事先載入的影像物件。"},
    {id:10, q:"rectMode(CENTER) 會改變什麼行為？", choices:["將矩形的定位原點改為中心點","改變矩形的顏色","讓矩形自動旋轉","啟用矩形的圓角效果"], a:0, fb:"rectMode(CENTER) 使 rect(x,y,w,h) 的 x,y 以矩形中心為基準。"},
    {id:11, q:"random(10, 20) 回傳什麼類型的值？", choices:["介於 0 到 1 的數值","整數 10 到 20（含）","介於 10 到 20 的浮點數","回傳陣列"], a:2, fb:"random(a,b) 傳回介於 a 與 b 之間的浮點數（含 a，接近但通常不含 b）。若需整數可用 floor() 或 int()。"},
    {id:12, q:"createButton('OK') 回傳的是什麼？", choices:["p5 的 DOM 元素（p5.Element）","單純的字串 'button'","Canvas 元素","沒有回傳值"], a:0, fb:"createButton 會回傳一個 p5.Element，可以呼叫 .mousePressed() 等方法設定事件。"}
  ];
}

function createUI() {
  // 清理舊 DOM（保留 canvas）
  // 只移除上一次建立的 controls（避免移除 canvas）
  selectAll('button').forEach(b => b.remove());
  selectAll('div').forEach(d => {
    if (d.elt && d.elt.id && d.elt.id !== 'defaultCanvas0') d.remove();
    if (d.elt && !d.elt.id && d.html() === '') d.remove();
  });

  startBtn = createButton('開始測驗');
  startBtn.mousePressed(startQuiz);

  downloadBtn = createButton('下載題庫 CSV');
  downloadBtn.mousePressed(downloadCSV);

  retryBtn = createButton('重新作答');
  retryBtn.mousePressed(() => {
    startQuiz();
  });

  messageDiv = createDiv('');
  messageDiv.style('color', '#000'); // 訊息文字改為黑色
  messageDiv.style('font-size', '16px'); // 放大訊息字體
  messageDiv.style('max-width', '60%');
}

function positionUI() {
  // 將按鈕放在視窗左下角（響應式）
  let padding = 20;
  let btnY = height - 80;
  startBtn.position(padding, btnY);
  downloadBtn.position(padding + 140, btnY);
  retryBtn.position(padding + 320, btnY);
  messageDiv.position(padding, btnY + 40);

  // 若已建立選項按鈕，重新定位
  if (buttons && buttons.length) {
    let btnX = width * 0.55;
    let btnW = constrain(width * 0.38, 220, 560);
    let startY = height * 0.25;
    let spacing = min(56, height * 0.08);
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].position(btnX, startY + i * spacing);
      buttons[i].size(btnW, 44);
      // 調整按鈕字體大小與顏色
      buttons[i].style('font-size', `${max(16, floor(width * 0.018))}px`);
      buttons[i].style('color', '#000');
    }
  }

  // 調整三個控制按鈕字體顏色/大小
  startBtn.style('font-size', `${max(16, floor(width * 0.018))}px`);
  downloadBtn.style('font-size', `${max(16, floor(width * 0.018))}px`);
  retryBtn.style('font-size', `${max(16, floor(width * 0.018))}px`);
  startBtn.style('color', '#000');
  downloadBtn.style('color', '#000');
  retryBtn.style('color', '#000');
}

function startQuiz() {
  // 亂數抽題
  quiz = shuffleArray(questions).slice(0, 4);
  currentIndex = 0;
  score = 0;
  state = 'quiz';
  messageDiv.html('');
  buttons.forEach(b => b.remove());
  buttons = [];
  createChoiceButtons();
  positionUI();
}

function createChoiceButtons() {
  buttons.forEach(b => b.remove());
  buttons = [];
  let btnX = width * 0.55;
  let btnW = constrain(width * 0.38, 220, 560);
  let startY = height * 0.25;
  let spacing = min(56, height * 0.08);
  for (let i = 0; i < 4; i++) {
    let b = createButton('');
    b.position(btnX, startY + i * spacing);
    b.size(btnW, 44);
    b.mousePressed(() => handleChoice(i));
    b.style('text-align', 'left');
    b.style('padding-left', '12px');
    b.style('background-color', '#ffffff');
    b.style('border-radius', '6px');
    b.style('border', '1px solid rgba(0,0,0,0.12)');
    b.style('color', '#000');
    buttons.push(b);
  }
  updateChoiceButtons();
}

function updateChoiceButtons() {
  if (state !== 'quiz') return;
  let item = quiz[currentIndex];
  for (let i = 0; i < 4; i++) {
    buttons[i].html(String.fromCharCode(65 + i) + '. ' + item.choices[i]);
  }
}

function drawIntro() {
  push();
  fill(0); // 文字黑色
  textSize(min(48, width * 0.06)); // 放大標題字體
  text('隨機測驗（每次 4 題）', 40, 80);
  textSize(min(24, width * 0.03)); // 放大描述字體
  text('按「開始測驗」抽題並作答。完成後會顯示成績與回饋。', 40, 140, width * 0.5);
  pop();
}

function drawQuestion() {
  let item = quiz[currentIndex];
  push();
  fill(0); // 題目文字改為黑色
  textSize(min(30, width * 0.035)); // 放大題目字體
  textAlign(LEFT, TOP);
  text('題目 ' + (currentIndex + 1) + ' / ' + quiz.length, 40, 40);
  textSize(min(26, width * 0.026)); // 放大問題內容字體
  let maxW = width * 0.45;
  text(item.q, 40, 80, maxW, height * 0.6);
  pop();
}

function handleChoice(choiceIndex) {
  let item = quiz[currentIndex];
  let correct = (choiceIndex === item.a);
  if (correct) {
    score++;
    spawnParticles(true);
  } else {
    spawnParticles(false);
  }
  // 顯示當題回饋短暫提示
  messageDiv.html((correct ? '答對！ ' : '答錯。 ') + item.fb);
  // 間隔後進入下一題或結束
  setTimeout(() => {
    currentIndex++;
    messageDiv.html('');
    if (currentIndex >= quiz.length) {
      state = 'result';
      buttons.forEach(b => b.hide());
    } else {
      updateChoiceButtons();
    }
  }, 800);
}

function drawResult() {
  push();
  fill(0); // 結果文字改為黑色
  textSize(min(40, width * 0.045)); // 放大標題字體
  textAlign(LEFT, TOP);
  text('測驗結果', 40, 60);
  textSize(min(28, width * 0.03)); // 放大副標題字體
  text('得分: ' + score + ' / ' + quiz.length, 40, 110);

  let pct = Math.round((score / quiz.length) * 100);
  let fb = feedbackForScore(pct);
  textSize(min(24, width * 0.024)); // 放大回饋字體
  text('正確率: ' + pct + '%', 40, 150);
  text('回饋: ' + fb, 40, 190, width * 0.45);

  // 視覺化：根據成績顯示不同的動畫（位置響應式）
  let baseX = width * 0.65;
  let baseY = height * 0.2;
  if (pct >= 75) {
    fill(255, 215, 0, 200);
    for (let i = 0; i < 6; i++) {
      ellipse(baseX + sin(frameCount * 0.05 + i) * (width * 0.03), baseY + i * (height * 0.05), 18, 18);
    }
  } else if (pct >= 50) {
    fill(100, 200, 255, 200);
    rect(baseX - 20, baseY + 40, width * 0.25, height * 0.18, 12);
  } else {
    fill(255, 100, 100, 160);
    for (let i = 0; i < 8; i++) {
      triangle(baseX + i * (width * 0.015), baseY + height * 0.18, baseX + i * (width * 0.015) + 6, baseY + height * 0.14, baseX + i * (width * 0.015) + 12, baseY + height * 0.18);
    }
  }
  pop();
}

function feedbackForScore(pct) {
  if (pct === 100) return "太棒了！完全答對，繼續保持！";
  if (pct >= 75) return "表現良好，但還有進步空間。";
  if (pct >= 50) return "基礎概念掌握，但建議再複習。";
  return "多做練習並複習相關知識再挑戰一次。";
}

function downloadCSV() {
  // 產生 CSV 內容
  let lines = [];
  lines.push(['id','question','choiceA','choiceB','choiceC','choiceD','answerIndex','feedback'].join(','));
  questions.forEach(q => {
    // 以雙引號包住，並替換內部雙引號
    let row = [
      q.id,
      '"' + q.q.replace(/"/g, '""') + '"',
      '"' + q.choices[0].replace(/"/g, '""') + '"',
      '"' + q.choices[1].replace(/"/g, '""') + '"',
      '"' + q.choices[2].replace(/"/g, '""') + '"',
      '"' + q.choices[3].replace(/"/g, '""') + '"',
      q.a,
      '"' + q.fb.replace(/"/g, '""') + '"'
    ];
    lines.push(row.join(','));
  });
  let csv = lines.join('\r\n');
  // 建立下載
  let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  let url = URL.createObjectURL(blob);
  let a = createA(url, 'download');
  a.attribute('download', 'question_bank.csv');
  a.elt.click();
  URL.revokeObjectURL(url);
  a.remove();
}

function shuffleArray(arr) {
  let copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ----------------- 更豐富的粒子/動畫效果 ----------------- */

function spawnParticles(correct) {
  // 更生動的 confetti / 粒子效果
  let count = correct ? 50 : 24;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: random(width * 0.55, width * 0.95),
      y: random(height * 0.15, height * 0.45),
      vx: random(-6, 6),
      vy: random(-10, -2),
      life: random(80, 200),
      maxLife: random(80, 200),
      col: color(
        correct ? random(140,255) : random(200,255),
        correct ? random(120,220) : random(90,160),
        correct ? random(60,180) : random(90,140)
      ),
      size: random(6, 18),
      rot: random(0, TWO_PI),
      rotSpeed: random(-0.35, 0.35),
      shape: random(['rect','ellipse','triangle']),
      gravity: random(0.12, 0.28),
      friction: random(0.985, 0.997),
      bounce: 0.55 + random(0,0.2),
      trail: []
    });
  }
}

function updateParticles() {
  // 更新並渲染粒子，加入尾跡與簡單碰撞
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    // store trail
    p.trail.unshift({x: p.x, y: p.y, a: map(p.life, 0, p.maxLife, 0, 160)});
    if (p.trail.length > 8) p.trail.pop();

    p.vx *= p.friction;
    p.x += p.vx;
    p.vy += p.gravity;
    p.y += p.vy;
    p.rot += p.rotSpeed;
    p.life--;

    // 地面碰撞（從畫面底部回彈）
    if (p.y > height - 20) {
      p.y = height - 20;
      p.vy *= -p.bounce;
      p.vx *= 0.7;
      // 減少壽命以避免無限反彈
      p.life -= 6;
    }

    push();
    translate(p.x, p.y);
    rotate(p.rot);
    noStroke();
    // draw trail (fainter ellipses behind)
    for (let t = 0; t < p.trail.length; t++) {
      let tt = p.trail[t];
      let a = tt.a * (1 - t / p.trail.length);
      fill(red(p.col), green(p.col), blue(p.col), a * 0.6);
      ellipse(tt.x - p.x - p.vx * t * 0.6, tt.y - p.y - p.vy * t * 0.6, p.size * (1 - t / (p.trail.length+1)) * 0.7, p.size * 0.4);
    }

    // main particle
    let alpha = map(p.life, 0, p.maxLife, 0, 255);
    fill(red(p.col), green(p.col), blue(p.col), alpha);
    if (p.shape === 'rect') {
      rectMode(CENTER);
      rect(0, 0, p.size, p.size * 0.6, 2);
    } else if (p.shape === 'ellipse') {
      ellipse(0, 0, p.size, p.size);
    } else {
      // triangle as small shard
      triangle(-p.size*0.5, p.size*0.5, 0, -p.size*0.6, p.size*0.5, p.size*0.5);
    }
    pop();

    if (p.life <= 0 || p.size <= 0.1) {
      particles.splice(i, 1);
    }
  }
}

function drawBackgroundParticles() {
  // 背景大顆粒、緩慢漂浮並加上視差效果
  noStroke();
  let cols = max(8, floor(width / 120));
  for (let i = 0; i < cols; i++) {
    let x = (i * 137 + frameCount * 0.15) % width;
    let y = height * 0.08 + (sin(frameCount * 0.01 + i) * height * 0.02) + ((i * 43) % (height * 0.6));
    let size = map(sin(frameCount * 0.01 + i), -1, 1, 4, 14);
    fill(0, 0, 0, 18); // 以黑色低透明度點綴（與背景粉色形成對比）
    ellipse(x, y, size, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
}