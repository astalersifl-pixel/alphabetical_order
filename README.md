# カード画像格納フォルダ (Card Images Folder)

ここに用意したカードのイラスト画像（.png, .jpg, .webp など）を配置してください。

### おすすめの命名例（簡単ルール）:
- A.png（または A.jpg）
- B.png
- C.png
...
- Z.png

### 指定方法:
`src/data/cards.ts` の各カードの `imageUrl` に `/cards/ファイル名` を記載します。
例:
```ts
imageUrl: '/cards/A.png',
```
