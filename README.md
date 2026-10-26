# rx-record-spot-quiz-demo-v2

処方箋と調剤録を見比べて、調剤録の間違いを探す2問のお試し版です。

## v2 修正点
- 問題1の処方日は、見出しの「処方日」ではなく、右側の日付「10.23」をタップしたときに正解になります。
- 初期表示では処方箋・調剤録の画像全体が見えます。
- ＋ボタンで拡大したときだけ、画像枠の中でスクロールできます。

## ファイル
- index.html
- style.css
- script.js
- question1_rx.png
- question1_record.png
- question2_rx.png
- question2_record.png


## v3 修正
- 問題1の処方日の当たり判定を、見出しではなく右側の日付数字側に再調整しました。
- script.js にバージョン指定を付けて、古いキャッシュを読み込みにくくしました。
