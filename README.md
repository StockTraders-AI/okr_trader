# OKR Trader Web

Ung dung React/Vite cho OKR Trader, tach component tu mau OKR Trader ban dau.

## Chay local

```bash
npm install
npm run dev
```

Mac dinh dev server chay o port `5175` va bind `0.0.0.0`.

## Build va chay ban build

```bash
npm run build
npm run start
```

Production server mac dinh:

- Host: `0.0.0.0`
- Port: `5175`
- Login API proxy: `/api/login`

Co the override bang bien moi truong:

```bash
HOST=0.0.0.0 PORT=5175 LOGIN_API_URL=https://stocktraders.vn/service/data/getUserLogin npm run start
```

## Routes

- `/`: man hinh dang nhap
- `/himlams`: man hinh admin sau khi dang nhap role admin
- `/trader`: man hinh trader sau khi dang nhap role trader
