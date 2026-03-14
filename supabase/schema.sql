-- Supabase schema for FarmAssist

-- 1. Crops Table
CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    season TEXT NOT NULL,
    average_price INTEGER NOT NULL,
    growth_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Crops Data
INSERT INTO public.crops (name_en, season, average_price, growth_days) VALUES
    ('Tomato', 'All Season', 40, 90),
    ('Potato', 'Winter', 25, 100),
    ('Onion', 'All Season', 35, 120),
    ('Carrot', 'Winter', 50, 90),
    ('Cabbage', 'Winter', 30, 100),
    ('Cauliflower', 'Winter', 40, 100),
    ('Brinjal', 'Summer', 30, 90),
    ('Chilli', 'All Season', 80, 150),
    ('Capsicum', 'Summer', 60, 90),
    ('Beans', 'Summer', 45, 60),
    ('Peas', 'Winter', 60, 60),
    ('Pumpkin', 'Summer', 15, 120),
    ('Bitter gourd', 'Summer', 40, 60),
    ('Bottle gourd', 'Summer', 20, 60),
    ('Ridge gourd', 'Summer', 25, 60),
    ('Cucumber', 'Summer', 20, 60),
    ('Watermelon', 'Summer', 15, 90),
    ('Muskmelon', 'Summer', 20, 90),
    ('Corn', 'Summer', 25, 90),
    ('Wheat', 'Winter', 25, 120),
    ('Rice', 'Monsoon', 30, 150),
    ('Millet', 'Summer', 40, 90),
    ('Ragi', 'Summer', 35, 90),
    ('Groundnut', 'Summer', 60, 110),
    ('Cotton', 'Summer', 70, 150),
    ('Sugarcane', 'All Season', 3, 300),
    ('Banana', 'All Season', 25, 300),
    ('Mango', 'Summer', 80, 1000),
    ('Papaya', 'All Season', 30, 150),
    ('Guava', 'All Season', 40, 150),
    ('Pomegranate', 'All Season', 100, 180),
    ('Turmeric', 'All Season', 150, 240),
    ('Ginger', 'All Season', 120, 240),
    ('Garlic', 'All Season', 100, 150),
    ('Coriander', 'Winter', 50, 45),
    ('Fenugreek', 'Winter', 40, 45),
    ('Mustard', 'Winter', 60, 90),
    ('Sunflower', 'Summer', 50, 100),
    ('Soybean', 'Summer', 45, 100),
    ('Chickpea', 'Winter', 60, 120),
    ('Lentil', 'Winter', 70, 120),
    ('Black gram', 'Summer', 80, 90),
    ('Green gram', 'Summer', 75, 75),
    ('Sesame', 'Summer', 100, 90),
    ('Tapioca', 'All Season', 25, 240),
    ('Sweet potato', 'All Season', 30, 120),
    ('Drumstick', 'All Season', 40, 180),
    ('Coconut', 'All Season', 20, 1000),
    ('Betel leaf', 'All Season', 100, 180);

-- 2. Transport Table
CREATE TABLE public.transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    route TEXT NOT NULL,
    available_date DATE NOT NULL,
    price_per_km NUMERIC NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Transport Data
INSERT INTO public.transport (driver_name, vehicle_type, capacity, route, available_date, price_per_km) VALUES
    ('Ramesh Kumar', 'Mini Truck', 1500, 'Farm to City Market', CURRENT_DATE, 150),
    ('Suresh Singh', 'Pickup Van', 800, 'Village to Transport Hub', CURRENT_DATE + INTERVAL '1 day', 100),
    ('Abdul Khan', 'Tractor', 2000, 'Village to Cold Storage', CURRENT_DATE, 200);

-- 3. Cold Storage Bookings Table
CREATE TABLE public.cold_storage_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    days_required INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
