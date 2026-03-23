-- Role Enum (Resilient creation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('donor', 'receiver');
    END IF;
END $$;

-- Drop existing tables to ensure a clean start if needed
-- To skip drop and just create, use IF NOT EXISTS below
-- DROP TABLE IF EXISTS public.requests CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'receiver',
  blood_group TEXT NOT NULL,
  city TEXT NOT NULL,
  availability_status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL,
  city TEXT NOT NULL,
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  notes TEXT,
  prescription_url TEXT,
  patient_photo_url TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'fulfilled', 'rejected', 'active')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Policies for users (DO block to avoid "already exists" errors)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all user profiles') THEN
        CREATE POLICY "Users can view all user profiles" ON public.users FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Policies for requests (DO block to avoid "already exists" errors)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active requests') THEN
        CREATE POLICY "Anyone can view active requests" ON public.requests FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Receivers can create requests') THEN
        CREATE POLICY "Receivers can create requests" ON public.requests FOR INSERT WITH CHECK (auth.uid() = receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Receivers can update their own requests') THEN
        CREATE POLICY "Receivers can update their own requests" ON public.requests FOR UPDATE USING (auth.uid() = receiver_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Donors can accept pending requests') THEN
        CREATE POLICY "Donors can accept pending requests" ON public.requests 
        FOR UPDATE 
        USING (status = 'pending')
        WITH CHECK (status = 'accepted');
    END IF;
END $$;

-- Messages Table for Chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view messages for their requests') THEN
        CREATE POLICY "Users can view messages for their requests" ON public.messages
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.requests
                WHERE requests.id = messages.request_id
                AND (requests.receiver_id = auth.uid() OR requests.donor_id = auth.uid())
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can send messages to their active requests') THEN
        CREATE POLICY "Users can send messages to their active requests" ON public.messages
        FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.requests
                WHERE requests.id = request_id
                AND (requests.receiver_id = auth.uid() OR requests.donor_id = auth.uid())
                AND requests.status = 'accepted'
            )
        );
    END IF;
END $$;

-- ENABLE REALTIME (This must be done for statuses and chat to live-update)
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- === STORAGE SETUP (Run these in SQL Editor) ===
-- Create bucket if not exists via SQL (requires supabase admin / dashboard usually)
-- Note: It's better to create the bucket 'requests' in the Dashboard Storage tab manually.

-- Storage Policies for 'requests' bucket (Run these AFTER manual bucket creation)
-- 1. Give users permission to upload their own files
-- INSERT INTO storage.buckets (id, name, public) VALUES ('requests', 'requests', true) ON CONFLICT DO NOTHING;

-- Policy: Allow authenticated users to upload to 'requests' bucket
-- CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'requests' AND auth.role() = 'authenticated');

-- Policy: Allow public to view 'requests' bucket files (if set to public)
-- CREATE POLICY "Public can view request files" ON storage.objects FOR SELECT USING (bucket_id = 'requests');
