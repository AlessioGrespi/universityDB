from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone


@dataclass
class CourseData:
    title: str = ""
    length: str = ""
    fees_uk: str = ""
    fees_international: str = ""

    def is_valid(self) -> bool:
        """At minimum, title must be non-empty."""
        return bool(self.title.strip())

    def empty_fields(self) -> list[str]:
        """Return names of fields that are empty."""
        return [k for k, v in asdict(self).items() if not v.strip()]


@dataclass
class ScrapeResult:
    url: str
    university: str
    scraped_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data: CourseData = field(default_factory=CourseData)

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "university": self.university,
            "scraped_at": self.scraped_at,
            "data": asdict(self.data),
        }


class ScrapeFailure(Exception):
    """Raised when a scrape fails or returns invalid data."""

    def __init__(self, message: str, url: str = "", empty_fields: list[str] | None = None):
        super().__init__(message)
        self.url = url
        self.empty_fields = empty_fields or []
