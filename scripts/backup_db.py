#!/usr/bin/env python3
"""Backup service for okr-trader-web SQLite database (data/okr.db).

Runs as a long-lived process (systemd/pm2), not via cron. On startup it
takes a backup immediately, then schedules one every day at 00:00. Old
backups (older than RETENTION_DAYS) are pruned after each run.
"""
import gzip
import logging
import shutil
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from apscheduler.schedulers.blocking import BlockingScheduler

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_FILE = PROJECT_ROOT / "data" / "okr.db"
BACKUP_DIR = Path("/root/db-backups/okr-trader-web")
RETENTION_DAYS = 365

BACKUP_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(BACKUP_DIR / "backup.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("backup_okr_trader_web")


def prune_old_backups() -> None:
    cutoff = datetime.now() - timedelta(days=RETENTION_DAYS)
    for f in BACKUP_DIR.glob("okr_*.sqlite.gz"):
        if datetime.fromtimestamp(f.stat().st_mtime) < cutoff:
            f.unlink()
            log.info("Da xoa backup qua han: %s", f.name)


def backup_job() -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    if not DB_FILE.exists():
        log.warning("Khong tim thay DB: %s", DB_FILE)
        return

    stamp = datetime.now().strftime("%Y-%m-%d")
    tmp_sqlite = Path(f"/tmp/okr_{stamp}.sqlite")
    final_gz = BACKUP_DIR / f"okr_{stamp}.sqlite.gz"

    try:
        conn = sqlite3.connect(f"file:{DB_FILE}?mode=ro", uri=True)
        try:
            conn.execute(f"VACUUM INTO '{tmp_sqlite}'")
        finally:
            conn.close()

        with open(tmp_sqlite, "rb") as src, gzip.open(final_gz, "wb", compresslevel=9) as dst:
            shutil.copyfileobj(src, dst)

        prune_old_backups()
        log.info("Backup xong: %s", final_gz)
    except Exception:
        log.exception("Backup that bai")
    finally:
        tmp_sqlite.unlink(missing_ok=True)


def main() -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_job()  # chay ngay 1 lan khi service khoi dong

    scheduler = BlockingScheduler(timezone="Asia/Ho_Chi_Minh")
    scheduler.add_job(backup_job, "cron", hour=0, minute=0)
    log.info("Backup service da khoi dong, lich chay moi ngay 00:00")
    scheduler.start()


if __name__ == "__main__":
    main()
