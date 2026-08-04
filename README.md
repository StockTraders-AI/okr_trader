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

- `/`: man hinh dang nhap mac dinh
- `/himlamst`: link dang nhap admin; login API thanh cong se vao UI admin
- `/trader`: link dang nhap trader; login API thanh cong se vao UI trader

## Database

Server luu du lieu OKR vao SQLite file `data/okr.db`.

- `GET /api/okr-state?year=2026&month=7`: doc du lieu thang
- `PUT /api/okr-state`: luu danh sach trader/ngay cong/chi tieu hien tai
- `data/okr.db` la du lieu runtime va dang nam trong `.gitignore`
- Neu con file cu `data/okr-db.json`, server se tu migrate sang `data/okr.db` trong lan chay dau tien
