from pathlib import Path
import re
from urllib.parse import urljoin

import fitz
import requests
from bs4 import BeautifulSoup

SITE_DIR = Path(__file__).resolve().parents[1]
HTML_PATH = SITE_DIR / "publications.html"
OUT_DIR = SITE_DIR / "_media" / "publications"
OUT_DIR.mkdir(parents=True, exist_ok=True)

session = requests.Session()
session.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
        )
    }
)

PDF_TEXT_PRIORITY = {"PDF", "Full text"}
META_KEYS = [
    "citation_pdf_url",
    "bepress_citation_pdf_url",
    "wkhealth_pdf_url",
]


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:120]


def fetch(url: str):
    response = session.get(url, timeout=45, allow_redirects=True)
    response.raise_for_status()
    return response


def find_pdf(url: str, seen=None):
    seen = seen or set()
    if url in seen:
        return None
    seen.add(url)

    try:
        response = fetch(url)
    except Exception as exc:
        print(f"FETCH FAIL {url}: {exc}")
        return None

    content_type = response.headers.get("content-type", "").lower()
    final_url = response.url
    if "application/pdf" in content_type or final_url.lower().endswith(".pdf"):
        return final_url, response.content

    soup = BeautifulSoup(response.text, "lxml")

    for key in META_KEYS:
        node = soup.find("meta", attrs={"name": key}) or soup.find(
            "meta", attrs={"property": key}
        )
        if node and node.get("content"):
            return find_pdf(urljoin(final_url, node["content"]), seen)

    for node in soup.find_all("meta"):
        content = node.get("content", "")
        if content and ".pdf" in content.lower():
            found = find_pdf(urljoin(final_url, content), seen)
            if found:
                return found

    for anchor in soup.find_all("a", href=True):
        href = urljoin(final_url, anchor["href"])
        label = anchor.get_text(" ", strip=True).lower()
        if href.lower().endswith(".pdf"):
            return find_pdf(href, seen)
        if any(token in label for token in ["pdf", "download pdf", "view pdf"]):
            found = find_pdf(href, seen)
            if found:
                return found

    return None


def render_thumbnail(pdf_bytes: bytes, out_path: Path):
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = document.load_page(0)
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pixmap.save(out_path)
    document.close()


def main():
    soup = BeautifulSoup(HTML_PATH.read_text(encoding="utf-8"), "lxml")
    for article in soup.select("article"):
        title_node = article.find("h3")
        if not title_node:
            continue

        title = title_node.get_text(" ", strip=True)
        candidates = []
        for link in article.select(".person-links a[href]"):
            label = link.get_text(" ", strip=True)
            href = link["href"]
            priority = 0 if label in PDF_TEXT_PRIORITY else 1
            candidates.append((priority, label, href))
        candidates.sort(key=lambda item: (item[0], item[1]))

        pdf_match = None
        for _, _, href in candidates:
            pdf_match = find_pdf(href)
            if pdf_match:
                break

        if not pdf_match:
            print(f"NO PDF {title}")
            continue

        out_path = OUT_DIR / f"{slugify(title)}.png"
        render_thumbnail(pdf_match[1], out_path)
        print(f"OK {title} -> {out_path.name}")


if __name__ == "__main__":
    main()
