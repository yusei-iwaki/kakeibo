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

本番は Vercel にデプロイします。GitHub リポジトリと Vercel プロジェクトを接続し、Vercel の Environment Variables に本番用 Supabase Postgres の `DATABASE_URL` を設定してください。

ローカル開発では `.env.local` に開発用DBの `DATABASE_URL` を入れ、本番では Vercel 側に本番用DBの `DATABASE_URL` を入れます。共有コードと家計簿データは接続先DBごとに分かれます。

Supabase の接続文字列を使う場合は、pooler の接続文字列を使います。DBパスワードに `%`、`#`、`@`、`/`、`?` などの記号が含まれる場合は、接続文字列内では URL エンコードしてください。たとえば `%` は `%25`、`#` は `%23`、`@` は `%40` です。

Vercel の標準設定で動きます。

```bash
npm run build
```

PWA としてホーム画面へ追加するには、Vercel の HTTPS 配信URLを使ってください。
