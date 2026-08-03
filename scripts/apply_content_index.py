from __future__ import annotations

import hashlib
from pathlib import Path

PATH = Path("src/content/docs/CONTENT_INDEX.yml")
EXPECTED_BASE_SHA = "6fce349e42b4b1beb77ea097c9a3fad122c73495"
EXPECTED_RESULT_SHA = "f7fa631b08646552c45f89c3527a140e27d26146"

POST_BLOCK = """  - url: /arrival/post/
    title: Почта, международные посылки и таможня
    tags: [почта, посылка, таможня, PAK, адрес, интернет-покупка]
    aliases: [Почта Сербии, Pošta Srbije, международная посылка, таможенное оформление посылки, почтовый адресный код]
    link_when:
      - нужно правильно указать сербский адрес или PAK
      - ожидаешь международную посылку
      - нужно понять пошлину, НДС и сборы оператора
      - курьер просит доверенность на таможенное представительство
    anchors: []

"""

PETS_BLOCK = """  - url: /move/pets/
    title: Переезд и поездки с домашним животным
    tags: [животные, собака, кошка, микрочип, бешенство, ветеринарный сертификат, граница]
    aliases: [въезд с собакой в Сербию, въезд с кошкой в Сербию, перевозка животного, поездка с питомцем в ЕС]
    link_when:
      - переезжаешь в Сербию с собакой, кошкой или хорьком
      - нужно проверить чип, вакцинацию, титр и сертификат
      - планируешь поездку из Сербии в Европейский союз
      - нужно отличить некоммерческую перевозку от коммерческой
    anchors: []

"""

GOV_BLOCK = """  - url: /gov/notary/
    title: 'Нотариус в Сербии: заверение документов и доверенности'
    tags: [нотариус, доверенность, заверение, подпись, копия, solemnizacija, документы]
    aliases: [javni beležnik, нотариальная доверенность, overa potpisa, заверить документ в Сербии]
    link_when:
      - нужно оформить доверенность
      - нужно заверить подпись или копию
      - нужно выбрать между удостоверением подписи и солемнизацией
      - сербский документ будет использоваться за границей
    anchors: []

  - url: /gov/consumer-rights/
    title: Защита прав потребителей в Сербии
    tags: [потребитель, рекламация, возврат, недостаток, интернет-покупка, внесудебный спор]
    aliases: [reklamacija, возврат товара в Сербии, неисправный товар, защита покупателя]
    link_when:
      - товар или услуга не соответствуют договору
      - нужно подать рекламацию продавцу
      - нужно отказаться от дистанционной покупки
      - продавец отклонил рекламацию
    anchors: []

  - url: /gov/family/
    title: Брак и семейные документы в Сербии
    tags: [брак, семья, матичар, свидетельство, развод, брачный договор, иностранец]
    aliases: [заключить брак в Сербии, matičar, регистрация иностранного брака, признание иностранного развода, bračni ugovor]
    link_when:
      - иностранцы планируют заключить брак в Сербии
      - нужно зарегистрировать брак, заключённый за границей
      - нужно внести иностранное решение о разводе
      - нужен брачный договор
    anchors: []

"""


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode()
    return hashlib.sha1(header + data).hexdigest()


def insert_once(text: str, marker: str, block: str) -> str:
    if text.count(marker) != 1:
        raise RuntimeError(f"Expected one marker, found {text.count(marker)}: {marker!r}")
    return text.replace(marker, block + marker, 1)


def main() -> None:
    original = PATH.read_bytes()
    actual_base_sha = git_blob_sha(original)
    if actual_base_sha != EXPECTED_BASE_SHA:
        raise RuntimeError(
            f"CONTENT_INDEX.yml changed unexpectedly: {actual_base_sha} != {EXPECTED_BASE_SHA}"
        )

    text = original.decode("utf-8")
    for route in (
        "/arrival/post/",
        "/move/pets/",
        "/gov/notary/",
        "/gov/consumer-rights/",
        "/gov/family/",
    ):
        if f"  - url: {route}\n" in text:
            raise RuntimeError(f"Route already exists: {route}")

    text = text.replace(
        "# Last updated: 2026-07-31\n",
        "# Last updated: 2026-08-03\n",
        1,
    )
    text = insert_once(
        text,
        "  # ==== ADAPTATION SECTION (Адаптация) ====\n",
        POST_BLOCK,
    )
    text = insert_once(
        text,
        "  # ==== MEDICAL SECTION (Медицина) ====\n",
        PETS_BLOCK,
    )
    text = insert_once(
        text,
        "  # ==== EDUCATION ====\n",
        GOV_BLOCK,
    )

    urls = [line.removeprefix("  - url: ") for line in text.splitlines() if line.startswith("  - url: ")]
    duplicates = sorted({url for url in urls if urls.count(url) > 1})
    if duplicates:
        raise RuntimeError(f"Duplicate routes: {duplicates}")

    result = text.encode("utf-8")
    actual_result_sha = git_blob_sha(result)
    if actual_result_sha != EXPECTED_RESULT_SHA:
        raise RuntimeError(
            f"Generated index differs from reviewed local file: {actual_result_sha} != {EXPECTED_RESULT_SHA}"
        )

    PATH.write_bytes(result)
    print(f"Updated {PATH}: {len(urls)} routes, blob {actual_result_sha}")


if __name__ == "__main__":
    main()
