-- Add assetnames column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS assetnames TEXT[];

-- Add a comment to describe the column
COMMENT ON COLUMN public.categories.assetnames IS 'Array of asset names associated with this category';

-- Update existing categories to have empty array if they don't have assetnames
UPDATE public.categories 
SET assetnames = ARRAY[]::TEXT[] 
WHERE assetnames IS NULL;