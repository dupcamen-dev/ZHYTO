ALTER TABLE products ADD COLUMN IF NOT EXISTS name_uk text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_uk text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en text;
