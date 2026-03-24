import importlib
import json
import logging
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import NoSuchElementException

from models import CourseData, ScrapeFailure
from runner import load_page, run_actions

logger = logging.getLogger(__name__)

HARNESS_DIR = Path(__file__).parent / "harnesses"


def load_config(harness_name: str) -> dict:
    """Load a JSON config harness."""
    config_path = HARNESS_DIR / "configs" / f"{harness_name}.json"
    if not config_path.exists():
        raise ScrapeFailure(f"Config harness not found: {config_path}")
    with open(config_path) as f:
        return json.load(f)


def extract_field(driver: WebDriver, selector_def: dict) -> str:
    """Extract a single field from the page using a selector definition."""
    css = selector_def.get("css", "")
    attribute = selector_def.get("attribute", "text")

    if not css:
        return ""

    try:
        element = driver.find_element(By.CSS_SELECTOR, css)
        if attribute == "text":
            return element.text.strip()
        else:
            return (element.get_attribute(attribute) or "").strip()
    except NoSuchElementException:
        logger.warning(f"Element not found: {css}")
        return ""


def scrape_with_config(driver: WebDriver, url_entry: dict) -> CourseData:
    """Scrape a page using a JSON config harness."""
    config = load_config(url_entry["harness"])

    # Load the page
    load_page(
        driver,
        url_entry["url"],
        wait_for=config.get("wait_for", "body"),
        wait_timeout=config.get("wait_timeout", 10),
    )

    # Run any pre-scrape actions
    actions = config.get("actions_before", [])
    if actions:
        run_actions(driver, actions)

    # Extract each field
    selectors = config.get("selectors", {})
    data = CourseData(
        title=extract_field(driver, selectors.get("title", {})),
        length=extract_field(driver, selectors.get("length", {})),
        fees_uk=extract_field(driver, selectors.get("fees_uk", {})),
        fees_international=extract_field(driver, selectors.get("fees_international", {})),
    )

    return data


def scrape_with_custom(driver: WebDriver, url_entry: dict) -> CourseData:
    """Scrape a page using a custom Python harness module."""
    harness_name = url_entry["harness"]
    module_path = HARNESS_DIR / "custom" / f"{harness_name}.py"

    if not module_path.exists():
        raise ScrapeFailure(f"Custom harness not found: {module_path}")

    # Dynamic import
    spec = importlib.util.spec_from_file_location(f"harness_{harness_name}", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    harness = module.Harness()

    # Load the page first
    load_page(driver, url_entry["url"])

    # Let the custom harness do its thing
    raw = harness.scrape(driver)

    return CourseData(
        title=raw.get("title", ""),
        length=raw.get("length", ""),
        fees_uk=raw.get("fees_uk", ""),
        fees_international=raw.get("fees_international", ""),
    )


def scrape(driver: WebDriver, url_entry: dict) -> CourseData:
    """Scrape a URL using the appropriate harness type."""
    harness_type = url_entry.get("harness_type", "config")

    if harness_type == "config":
        data = scrape_with_config(driver, url_entry)
    elif harness_type == "custom":
        data = scrape_with_custom(driver, url_entry)
    else:
        raise ScrapeFailure(f"Unknown harness type: {harness_type}")

    # Validate
    if not data.is_valid():
        empty = data.empty_fields()
        raise ScrapeFailure(
            f"Scrape returned invalid data (empty fields: {empty})",
            url=url_entry["url"],
            empty_fields=empty,
        )

    return data
