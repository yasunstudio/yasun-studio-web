from slugify import slugify as _slugify


def slugify(value: str) -> str:
    return _slugify(value, max_length=200, word_boundary=True)
