import logging
import subprocess
import tempfile
from pathlib import Path

from selenium.webdriver.remote.webdriver import WebDriver

logger = logging.getLogger(__name__)

HARNESS_DIR = Path(__file__).parent / "harnesses"
SCRAPER_DIR = Path(__file__).parent


def get_harness_path(url_entry: dict) -> Path:
    """Get the file path of the harness for a URL entry."""
    harness_type = url_entry.get("harness_type", "config")
    harness_name = url_entry["harness"]

    if harness_type == "config":
        return HARNESS_DIR / "configs" / f"{harness_name}.json"
    else:
        return HARNESS_DIR / "custom" / f"{harness_name}.py"


def save_debug_artifacts(driver: WebDriver, university: str) -> tuple[Path, Path]:
    """Save page source and screenshot for debugging."""
    debug_dir = SCRAPER_DIR / "debug"
    debug_dir.mkdir(exist_ok=True)

    html_path = debug_dir / f"{university}_page.html"
    screenshot_path = debug_dir / f"{university}_screenshot.png"

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(driver.page_source)

    driver.save_screenshot(str(screenshot_path))

    logger.info(f"Saved debug artifacts: {html_path}, {screenshot_path}")
    return html_path, screenshot_path


def heal(url_entry: dict, error: str, driver: WebDriver) -> None:
    """Invoke claude -p to fix the harness based on the current page state.

    Saves the page HTML and screenshot, then asks Claude Code CLI
    to analyze them and update the harness file with correct selectors.
    """
    university = url_entry["university"]
    url = url_entry["url"]
    harness_path = get_harness_path(url_entry)

    # Save current page state for Claude to analyze
    html_path, screenshot_path = save_debug_artifacts(driver, university)

    prompt = f"""I'm running a web scraper that failed to extract course data.

University: {university}
URL: {url}
Error: {error}

The page HTML has been saved to: {html_path.resolve()}
A screenshot has been saved to: {screenshot_path.resolve()}
The harness config file is at: {harness_path.resolve()}

Please:
1. Read the HTML file to understand the page structure
2. Find the correct CSS selectors for these fields:
   - title: The course name/title
   - length: Course duration (e.g. "3 years full-time")
   - fees_uk: UK/home student tuition fees
   - fees_international: International student tuition fees
3. Update the harness file with the correct selectors

For JSON config harnesses, update the "selectors" object with correct "css" values.
For Python custom harnesses, update the scrape() method with correct selectors.

Also update "wait_for" if needed, and add any "actions_before" (like clicking tabs)
if the data requires interaction to reveal.

Only edit the harness file — do not create new files."""

    logger.info(f"Invoking claude -p to heal harness for {university}...")

    try:
        result = subprocess.run(
            ["claude", "-p", "--allowedTools", "Read,Edit,Write,Grep,Glob", prompt],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=str(SCRAPER_DIR),
        )

        if result.returncode != 0:
            logger.error(f"claude -p failed (exit {result.returncode}): {result.stderr[:500]}")
            raise RuntimeError(f"claude -p exited with code {result.returncode}")

        logger.info(f"claude -p completed. Output:\n{result.stdout[:500]}")

    except subprocess.TimeoutExpired:
        logger.error("claude -p timed out after 120s")
        raise RuntimeError("claude -p timed out")
