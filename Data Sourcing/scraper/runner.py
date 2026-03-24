import logging
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

logger = logging.getLogger(__name__)

# Common cookie banner selectors to try dismissing
COOKIE_DISMISS_SELECTORS = [
    "#onetrust-accept-btn-handler",
    ".cookie-accept",
    "[data-action='accept-cookies']",
    "button[aria-label='Accept cookies']",
    "#accept-cookies",
    ".cc-accept",
    ".cky-btn-accept",
]


def create_driver(headless: bool = True) -> webdriver.Chrome:
    """Create and return a configured Chrome WebDriver."""
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(30)
    return driver


def dismiss_cookies(driver: webdriver.Chrome) -> None:
    """Try to dismiss common cookie banners."""
    for selector in COOKIE_DISMISS_SELECTORS:
        try:
            btn = driver.find_element(By.CSS_SELECTOR, selector)
            if btn.is_displayed():
                btn.click()
                logger.info(f"Dismissed cookie banner via: {selector}")
                time.sleep(0.5)
                return
        except (NoSuchElementException, Exception):
            continue


def load_page(driver: webdriver.Chrome, url: str, wait_for: str = "body", wait_timeout: int = 10) -> None:
    """Navigate to URL and wait for an element to be present."""
    logger.info(f"Loading: {url}")
    driver.get(url)

    try:
        WebDriverWait(driver, wait_timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, wait_for))
        )
    except TimeoutException:
        logger.warning(f"Timed out waiting for '{wait_for}' on {url}")

    # Give JS a moment to finish rendering
    time.sleep(1)
    dismiss_cookies(driver)


def run_actions(driver: webdriver.Chrome, actions: list[dict]) -> None:
    """Execute pre-scrape actions like clicking or scrolling."""
    for action in actions:
        if "click" in action:
            try:
                el = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, action["click"]))
                )
                el.click()
                time.sleep(0.5)
                logger.info(f"Clicked: {action['click']}")
            except TimeoutException:
                logger.warning(f"Could not click: {action['click']}")

        elif "scroll_to" in action:
            try:
                el = driver.find_element(By.CSS_SELECTOR, action["scroll_to"])
                driver.execute_script("arguments[0].scrollIntoView(true);", el)
                time.sleep(0.3)
                logger.info(f"Scrolled to: {action['scroll_to']}")
            except NoSuchElementException:
                logger.warning(f"Could not scroll to: {action['scroll_to']}")

        elif "wait" in action:
            time.sleep(action["wait"])
