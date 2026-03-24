import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from models import ScrapeResult, ScrapeFailure
from runner import create_driver
from parser import scrape
from healer import heal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

URLS_FILE = Path(__file__).parent / "urls.json"
OUTPUT_DIR = Path(__file__).parent / "output"
MAX_HEAL_RETRIES = 2


def load_urls() -> list[dict]:
    with open(URLS_FILE) as f:
        return json.load(f)


def save_result(result: ScrapeResult) -> Path:
    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{result.university}_{timestamp}.json"
    out_path = OUTPUT_DIR / filename

    with open(out_path, "w") as f:
        json.dump(result.to_dict(), f, indent=2)

    logger.info(f"Saved: {out_path}")
    return out_path


def run(urls: list[dict] | None = None):
    """Run the scraper for all URLs (or a filtered subset)."""
    all_urls = load_urls()

    if urls is not None:
        # Filter to only requested URLs
        url_set = set(urls)
        all_urls = [u for u in all_urls if u["url"] in url_set]

    if not all_urls:
        logger.warning("No URLs to scrape.")
        return

    driver = create_driver(headless=True)
    results = {"success": 0, "failed": 0, "healed": 0}

    try:
        for entry in all_urls:
            url = entry["url"]
            university = entry["university"]
            logger.info(f"--- Scraping: {university} | {url} ---")

            try:
                data = scrape(driver, entry)
                result = ScrapeResult(url=url, university=university, data=data)
                save_result(result)
                results["success"] += 1
                logger.info(f"OK: {data.title}")

            except ScrapeFailure as e:
                logger.warning(f"Scrape failed: {e}")
                healed = False

                for attempt in range(1, MAX_HEAL_RETRIES + 1):
                    logger.info(f"Heal attempt {attempt}/{MAX_HEAL_RETRIES}...")

                    try:
                        heal(
                            url_entry=entry,
                            error=str(e),
                            driver=driver,
                        )
                    except Exception as heal_err:
                        logger.error(f"Healer failed: {heal_err}")
                        continue

                    # Retry the scrape after healing
                    try:
                        # Reload the page fresh
                        data = scrape(driver, entry)
                        result = ScrapeResult(url=url, university=university, data=data)
                        save_result(result)
                        results["success"] += 1
                        results["healed"] += 1
                        logger.info(f"Healed and scraped: {data.title}")
                        healed = True
                        break
                    except ScrapeFailure as retry_err:
                        logger.warning(f"Still failing after heal: {retry_err}")
                        e = retry_err  # Update error for next heal attempt

                if not healed:
                    results["failed"] += 1
                    logger.error(f"FAILED (gave up): {url}")

    finally:
        driver.quit()

    logger.info(
        f"Done. Success: {results['success']}, Failed: {results['failed']}, "
        f"Healed: {results['healed']}"
    )


if __name__ == "__main__":
    # Optional: pass specific URLs as arguments
    target_urls = sys.argv[1:] if len(sys.argv) > 1 else None
    run(target_urls)
