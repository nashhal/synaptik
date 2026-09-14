import re
from difflib import SequenceMatcher


def normalize_name(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^\w\s]", " ", value, flags=re.UNICODE)
    return re.sub(r"\s+", " ", value)


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()


def resolve_customer(name: str, candidates: list[str], threshold: float = 0.88):
    scored = sorted(((similarity(name, c), c) for c in candidates), reverse=True)
    if not scored or scored[0][0] < threshold:
        return None, scored[0][0] if scored else 0.0
    return scored[0][1], scored[0][0]
