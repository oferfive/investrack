-- Migration: Update currency handling in assets and prices tables

-- First, rename original_value to value in assets table
ALTER TABLE public.assets RENAME COLUMN original_value TO value;

-- Remove value_usd column from assets table
ALTER TABLE public.assets DROP COLUMN value_usd;

-- Rename price_usd to price in prices table
ALTER TABLE public.prices RENAME COLUMN price_usd TO price;

-- Remove exchange_rate from transactions table
ALTER TABLE public.transactions DROP COLUMN exchange_rate;

-- Add a comment to explain the currency handling
COMMENT ON TABLE public.assets IS 'All values are stored in their original currency. USD conversions are handled at the application level.';
COMMENT ON TABLE public.prices IS 'All prices are stored in their original currency. USD conversions are handled at the application level.'; 