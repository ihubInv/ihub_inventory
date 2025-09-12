-- Add assetcategory column to existing assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS assetcategory VARCHAR(255);
