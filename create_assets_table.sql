-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    createdby VARCHAR(255) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies for assets table
CREATE POLICY "Enable all operations for authenticated users" ON public.assets
    FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_name ON public.assets(name);
CREATE INDEX IF NOT EXISTS idx_assets_createdby ON public.assets(createdby);
CREATE INDEX IF NOT EXISTS idx_assets_isactive ON public.assets(isactive);

-- Create trigger to automatically update updatedat
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updatedat 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
