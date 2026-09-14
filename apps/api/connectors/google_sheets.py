import httpx
from .base import Connector

class GoogleSheetsConnector(Connector):
    type = "google_sheets"

    def __init__(self, access_token: str | None = None):
        self.access_token = access_token

    async def test_connection(self) -> bool:
        return bool(self.access_token)

    async def pull(self) -> list[dict]:
        if not self.access_token:
            return []
        # MVP boundary: OAuth and spreadsheet discovery are intentionally isolated here.
        # Production implementation should call Sheets API v4 after source authorization.
        return []
