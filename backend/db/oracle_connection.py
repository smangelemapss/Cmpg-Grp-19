import os
from dotenv import load_dotenv

load_dotenv()

try:
    import cx_Oracle as _cx_Oracle
    _CX_ORACLE_AVAILABLE = True
except ImportError:
    _cx_Oracle = None
    _CX_ORACLE_AVAILABLE = False


def get_connection():
    if not _CX_ORACLE_AVAILABLE:
        raise RuntimeError(
            "cx_Oracle is not installed. Install Oracle Instant Client and cx_Oracle."
        )
    user = os.getenv("ORA_USER", "system")
    password = os.getenv("ORA_PASSWORD", "")
    host = os.getenv("ORA_HOST", "localhost")
    port = int(os.getenv("ORA_PORT", "1521"))
    sid = os.getenv("ORA_SID", "XE")

    dsn = _cx_Oracle.makedsn(host, port, sid=sid)
    return _cx_Oracle.connect(user=user, password=password, dsn=dsn)
