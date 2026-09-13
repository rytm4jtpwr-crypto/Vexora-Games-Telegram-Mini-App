from pathlib import Path

import fitz


source = Path("attached_assets/rocket-animation-demo_1789331014619.pdf")
output_dir = Path(".agents/outputs/rocket-animation-demo")
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    pixmap.save(output_dir / f"page-{index + 1}.png")
    print(
        f"page={index + 1} size={page.rect.width}x{page.rect.height} "
        f"images={len(page.get_images(full=True))}"
    )