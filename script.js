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

board.addEventListener("click", (event) => {
  // クイズクリア後は追加の判定をしない
  if (found.size === total) return;
  const hotspot = event.target.closest(".hit-area");
  if (!hotspot || !board.contains(hotspot)) {
    setMessage("そこは今回の間違いではありません。もう一度探してね！", true);
    return;
  }

  const key = hotspot.dataset.id;
  if (!(key in answerLabels)) return;
  if (found.has(key)) {
    setMessage("そこはすでに見つけた間違いです。氏名は上下どちらでも1か所分だよ😊");
    return;
  }

  found.add(key);
  // 上の氏名を押したら上、下なら下に赤い〇を表示する
  hotspot.classList.add("found");
  updateCounts();

  if (found.size === total) {
    showResults();
  } else {
    setMessage(`⭕ 正解！ ${answerLabels[key]}。あと${total - found.size}か所！`);
  }
});

retryButton.addEventListener("click", () => {
  found.clear();
  board.querySelectorAll(".hit-area").forEach((item) => item.classList.remove("found"));
  updateCounts();
  setMessage("調剤録の間違っている箇所をタップしてね😊");
  resultCard.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

updateCounts();
