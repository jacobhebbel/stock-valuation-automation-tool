from sec_cik_mapper import StockMapper
from pathlib import Path

# Source: https://sec-cik-mapper.readthedocs.io/en/latest/

mapper = StockMapper()

csv_path = Path("tickerMapping.csv")
mapper.save_metadata_to_csv(csv_path)