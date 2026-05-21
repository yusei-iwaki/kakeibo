# 家計簿

共有家計簿としても使える Next.js 製の家計簿アプリです。

## 主な機能

- カレンダー上で日別の収支を確認
- 日付を選んで収入・支出を入力
- 月次の収入、支出、差額を表示
- 直近6か月の収支グラフ
- 今月の支出カテゴリ別グラフ
- 毎月の固定費設定と月次反映
- 共有コードによる複数端末・家族間の同期
- PWA としてスマホのホーム画面に追加

## ストレージ

標準ではブラウザの `localStorage` に保存します。`DATABASE_URL` を設定した Next.js サーバー上では、設定タブから共有コードを作成し、Postgres DB に保存できます。

共有DBには `shared_ledgers` テーブルが自動作成されます。DB は Neon / Supabase Postgres / Vercel Postgres など、Postgres 接続文字列を発行できるサービスを使えます。

```bash
cp .env.example .env.local
# .env.local に DATABASE_URL を設定
```

共有コードを知っている人は同じ家計簿を読み書きできます。家族内の共有を軽く始めるための仕組みなので、不特定多数に公開する場合は認証を追加してください。

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

共有DBを使うため、GitHub Pages のような静的ホスティングではなく、Vercel や Node.js サーバーへデプロイしてください。

PWA としてホーム画面へ追加するには、デプロイ先を HTTPS で配信してください。デプロイ先の環境変数にも `DATABASE_URL` を設定します。
