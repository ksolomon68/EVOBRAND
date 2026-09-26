"""Apply a consistent web-ready cleanup pass to an image sequence."""

from pathlib import Path
import sys

from PIL import Image, ImageEnhance, ImageFilter


def enhance(source: Path, destination: Path) -> None:
    with Image.open(source) as image:
        frame = image.convert("RGB")
        frame = ImageEnhance.Contrast(frame).enhance(1.04)
        frame = ImageEnhance.Color(frame).enhance(1.02)
        frame = frame.filter(ImageFilter.GaussianBlur(radius=0.22))
        frame = frame.filter(ImageFilter.UnsharpMask(radius=1.45, percent=155, threshold=3))
        frame.save(
            destination,
            "JPEG",
            quality=92,
            subsampling=0,
            optimize=True,
            progressive=True,
        )


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: enhance-sequence.py SOURCE_DIR DESTINATION_DIR")

    source_dir = Path(sys.argv[1]).resolve()
    destination_dir = Path(sys.argv[2]).resolve()
    files = sorted(source_dir.glob("ezgif-frame-*.jpg"))
    if len(files) != 151:
        raise SystemExit(f"expected 151 frames, found {len(files)}")

    destination_dir.mkdir(parents=True, exist_ok=True)
    for source in files:
        destination = destination_dir / source.name.removeprefix("ezgif-")
        if destination.exists() and destination.stat().st_mtime > source.stat().st_mtime:
            continue
        enhance(source, destination)

    total_bytes = sum(path.stat().st_size for path in destination_dir.glob("frame-*.jpg"))
    print(f"enhanced {len(files)} frames ({total_bytes} bytes)")


if __name__ == "__main__":
    main()
