-- Add phone_number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number text;

-- Add current_crops column for active crops in field (different from primary_crops which is general)
ALTER TABLE public.profiles 
ADD COLUMN current_crops text[] DEFAULT '{}';