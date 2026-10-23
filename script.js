// 正解箇所の当たり判定は、画像の横幅・縦幅を100%とした座標で指定します。
// 上と下の氏名は、同じidなので1か所としてカウントします。
const correctRegions = [
  { id: "name", label: "上部の氏名", x: 3.5, y: 9.25, width: 10.8, height: 2.85 },
  { id: "name", label: "下部の氏名", x: 14.0, y: 68.2, width: 10.2, height: 3.2 },
  { id: "date", label: "処方日", x: 85.3, y: 4.15, width: 10.5, height: 2.4 }
];

const answerLabels = {
  name: "氏名の表記（てすと → テスト）",
  date: "処方日（08.10.23 → 08.10.22）"
};

const found = new Set();
const total = Object.keys(answerLabels).length;
const board = document.getElementById("quizBoard");
const foundCount = document.getElementById("foundCount");
const remainingCount = document.getElementById("remainingCount");
const message = document.getElementById("message");
const resultCard = document.getElementById("resultCard");
const retryButton = document.getElementById("retryButton");

function updateCounts() {
  foundCount.textContent = String(found.size);
  remainingCount.textContent = String(total - found.size);
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error-message", isError);
}

function showResults() {
  setMessage("2か所とも発見！下の解説を確認してね✨");
  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function locateClick(event) {
  // 画像全体のどこをクリックしても同じイベントを受け取る。
  // border 1px の影響を避けるため画像の実際の描画領域を基準にする。
  const image = board.querySelector("img");
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return correctRegions.find(region =>
    x >= region.x && x <= region.x + region.width &&
    y >= region.y && y <= region.y + region.height
  ) || null;
}

function addRedCircle(region) {
  const mark = document.createElement("div");
  mark.className = "found-mark";
  mark.style.left = `${region.x}%`;
  mark.style.top = `${region.y}%`;
  mark.style.width = `${region.width}%`;
  mark.style.height = `${region.height}%`;
  board.appendChild(mark);
}

board.addEventListener("click", (event) => {
  // クリア後は追加でカウントしない。
  if (found.size === total) return;

  const region = locateClick(event);
  if (!region) {
    setMessage("そこは今回の間違いではありません。もう一度探してね！", true);
    return;
  }

  if (found.has(region.id)) {
    setMessage("そこはすでに見つけた間違いです。氏名は上下どちらでも1か所分だよ😊");
    return;
  }

  found.add(region.id);
  // 同じ氏名のうち、実際にタップした側だけに赤丸を表示する。
  addRedCircle(region);
  updateCounts();

  if (found.size === total) {
    showResults();
  } else {
    setMessage(`⭕ 正解！ ${answerLabels[region.id]}。あと${total - found.size}か所！`);
  }
});

retryButton.addEventListener("click", () => {
  found.clear();
  board.querySelectorAll(".found-mark").forEach(mark => mark.remove());
  updateCounts();
  setMessage("調剤録の間違っている箇所をタップしてね😊");
  resultCard.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

updateCounts();
