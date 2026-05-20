ALTER TABLE products ADD COLUMN IF NOT EXISTS recipe_uk text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS recipe_en text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_uk text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_en text;
