from .base import Connector

class QuickBooksConnector(Connector):
    type = "quickbooks"

    def __init__(self, access_token: str | None = None, realm_id: str | None = None):
        self.access_token = access_token
        self.realm_id = realm_id

    async def test_connection(self) -> bool:
        return bool(self.access_token and self.realm_id)

    async def pull(self) -> list[dict]:
        if not await self.test_connection():
            return []
        # MVP boundary: OAuth/token refresh and QBO query mapping belong here.
        # No credentials are stored in source control.
        return []
