# 家計簿

自分だけで使うことを前提にした Next.js 製の家計簿アプリです。

## 主な機能

- カレンダー上で日別の収支を確認
- 日付を選んで収入・支出を入力
- 月次の収入、支出、差額を表示
- 直近6か月の収支グラフ
- 今月の支出カテゴリ別グラフ
- 毎月の固定費設定と月次反映
- JSON でのデータ書き出し・読み込み
- PWA としてスマホのホーム画面に追加

## ストレージ

データはブラウザの `localStorage` に保存します。認証なしでデプロイする前提のため、初期版ではサーバーDBを使いません。

複数端末同期や安全なクラウド保存が必要になったら、認証を追加した上で Supabase Postgres または Neon への移行を検討します。

## 開発

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 検証

```bash
npm run lint
npm run build
```

## デプロイ

GitHub Pages へのデプロイに対応しています。`main` ブランチへ push すると、GitHub Actions が `next build` で静的出力を作成し、`out/` を GitHub Pages にデプロイします。

PWA としてホーム画面へ追加するには、デプロイ先を HTTPS で配信してください。

初回だけ GitHub のリポジトリ設定で `Pages` の source を `GitHub Actions` に設定してください。
