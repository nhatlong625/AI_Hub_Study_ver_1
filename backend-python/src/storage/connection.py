from contextlib import contextmanager
from typing import Iterator

import pyodbc

from src.core.config import get_settings


@contextmanager
def get_db_connection() -> Iterator[pyodbc.Connection]:
    settings = get_settings()
    connection = pyodbc.connect(settings.odbc_connection_string)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
