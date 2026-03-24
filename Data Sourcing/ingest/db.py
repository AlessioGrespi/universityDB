"""Database helpers — connection, bulk insert, upsert via temp table."""

import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from config import DATABASE_URL


@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()


def bulk_insert(conn, table: str, columns: list[str], rows: list[tuple]):
    """Fast bulk insert using execute_values."""
    if not rows:
        return
    cols = ", ".join(columns)
    template = "(" + ", ".join(["%s"] * len(columns)) + ")"
    query = f"INSERT INTO {table} ({cols}) VALUES %s"
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, query, rows, template=template, page_size=500)
    conn.commit()


def upsert(
    conn,
    table: str,
    columns: list[str],
    rows: list[tuple],
    conflict_columns: list[str],
    update_columns: list[str],
):
    """Bulk upsert using execute_values with ON CONFLICT DO UPDATE."""
    if not rows:
        return
    cols = ", ".join(columns)
    template = "(" + ", ".join(["%s"] * len(columns)) + ")"
    conflict = ", ".join(conflict_columns)
    updates = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_columns)
    query = f"""
        INSERT INTO {table} ({cols}) VALUES %s
        ON CONFLICT ({conflict}) DO UPDATE SET {updates}
    """
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, query, rows, template=template, page_size=500)
    conn.commit()


def fetch_all(conn, query: str, params=None) -> list[dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params)
        return [dict(r) for r in cur.fetchall()]


def fetch_one(conn, query: str, params=None) -> dict | None:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params)
        r = cur.fetchone()
        return dict(r) if r else None


def execute(conn, query: str, params=None):
    with conn.cursor() as cur:
        cur.execute(query, params)
    conn.commit()
