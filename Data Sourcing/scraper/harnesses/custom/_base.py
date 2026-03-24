from abc import ABC, abstractmethod
from selenium.webdriver.remote.webdriver import WebDriver


class BaseHarness(ABC):
    """Base class for custom Python harnesses.

    Subclass this and implement scrape() to handle complex sites
    that need clicks, scrolling, tab switching, etc.
    """

    @abstractmethod
    def scrape(self, driver: WebDriver) -> dict:
        """Extract course data from the loaded page.

        Args:
            driver: Selenium WebDriver with the page already loaded.

        Returns:
            Dict with keys: title, length, fees_uk, fees_international.
            Values should be strings. Empty string if not found.
        """
        ...
