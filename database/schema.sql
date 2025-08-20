-- Supabase Database Schema for Realtor Web Application
-- This file documents the expected database structure

-- Admin table
CREATE TABLE "Admin" (
    admin_id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE
);

-- Buyer table  
CREATE TABLE "Buyer" (
    buyer_id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    name TEXT
);

-- Property table
CREATE TABLE "Property" (
    property_id SERIAL PRIMARY KEY,
    description TEXT,
    rooms INTEGER,
    washroom INTEGER,
    sq_feet INTEGER,
    price INTEGER,
    status INTEGER,
    garage INTEGER,
    gym INTEGER,
    office INTEGER,
    recreational_room INTEGER,
    basement_type TEXT,
    property_kind TEXT,
    lot_size INTEGER,
    image_urls TEXT[],
    buyer_id UUID REFERENCES "Buyer"(buyer_id)
);

-- ViewingRequests table
CREATE TABLE "ViewingRequests" (
    request_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES "Property"(property_id),
    buyer_id UUID REFERENCES "Buyer"(buyer_id),
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE "Bookmarks" (
    bookmark_id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES "Buyer"(buyer_id),
    property_id INTEGER REFERENCES "Property"(property_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, property_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Buyer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ViewingRequests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bookmarks" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin table
CREATE POLICY "Admins can view their own data" ON "Admin"
    FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own data" ON "Admin"
    FOR UPDATE USING (auth.uid() = admin_id);

-- RLS Policies for Buyer table
CREATE POLICY "Buyers can view their own data" ON "Buyer"
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own data" ON "Buyer"
    FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Allow signup inserts" ON "Buyer"
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for Property table
CREATE POLICY "Properties are viewable by everyone" ON "Property"
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all properties" ON "Property"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Admin" WHERE admin_id = auth.uid()
        )
    );

-- RLS Policies for ViewingRequests table
CREATE POLICY "Users can view their own viewing requests" ON "ViewingRequests"
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create viewing requests" ON "ViewingRequests"
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own viewing requests" ON "ViewingRequests"
    FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all viewing requests" ON "ViewingRequests"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Admin" WHERE admin_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update viewing requests" ON "ViewingRequests"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "Admin" WHERE admin_id = auth.uid()
        )
    );

-- RLS Policies for Bookmarks table
CREATE POLICY "Users can view their own bookmarks" ON "Bookmarks"
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create bookmarks" ON "Bookmarks"
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can delete their own bookmarks" ON "Bookmarks"
    FOR DELETE USING (auth.uid() = buyer_id);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Storage policies
CREATE POLICY "Property images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'property-images' AND
        EXISTS (
            SELECT 1 FROM "Admin" WHERE admin_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete property images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-images' AND
        EXISTS (
            SELECT 1 FROM "Admin" WHERE admin_id = auth.uid()
        )
    );
