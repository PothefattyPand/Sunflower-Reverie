-- Additive migration: Add interests column to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

