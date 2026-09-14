from abc import ABC, abstractmethod
from typing import Any

class Connector(ABC):
    type: str

    @abstractmethod
    async def test_connection(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def pull(self) -> list[dict[str, Any]]:
        raise NotImplementedError
