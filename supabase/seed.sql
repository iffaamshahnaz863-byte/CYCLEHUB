
-- Clear existing data
-- Use with caution in production!
-- DELETE FROM public.products;
-- DELETE FROM public.categories;

-- Create Categories
INSERT INTO public.categories (name, image_url) VALUES
('Mountain Bikes', 'https://picsum.photos/seed/mtb/500'),
('Road Bikes', 'https://picsum.photos/seed/road/500')
ON CONFLICT (name) DO NOTHING;

-- Get Category IDs
DO $$
DECLARE
    mtb_cat_id uuid;
    road_cat_id uuid;
BEGIN
    SELECT id INTO mtb_cat_id FROM public.categories WHERE name = 'Mountain Bikes';
    SELECT id INTO road_cat_id FROM public.categories WHERE name = 'Road Bikes';

    -- Create Products
    INSERT INTO public.products (name, description, price, discount_price, stock, category_id, images, is_active)
    VALUES
    (
        'Trailblazer Pro MTB',
        'A rugged and reliable mountain bike designed for the toughest trails. Features a lightweight aluminum frame, front suspension, and hydraulic disc brakes.',
        45000.00,
        42500.00,
        15,
        mtb_cat_id,
        ARRAY['https://picsum.photos/seed/trailblazer1/800', 'https://picsum.photos/seed/trailblazer2/800'],
        true
    ),
    (
        'Velocity Sprint R1',
        'Experience pure speed with this aerodynamic road bike. Carbon fiber frame, Shimano groupset, and a design built for competitive racing.',
        85000.00,
        NULL,
        8,
        road_cat_id,
        ARRAY['https://picsum.photos/seed/velocity1/800', 'https://picsum.photos/seed/velocity2/800'],
        true
    ),
    (
        'Rockhopper Expert',
        'The perfect entry-level mountain bike for new enthusiasts. Durable, versatile, and ready for adventure on any dirt path.',
        32000.00,
        NULL,
        25,
        mtb_cat_id,
        ARRAY['https://picsum.photos/seed/rockhopper1/800', 'https://picsum.photos/seed/rockhopper2/800'],
        true
    );
END $$;

-- Note on creating an admin user:
-- 1. Sign up a new user through the application or Supabase dashboard.
-- 2. Get the user's ID from the `auth.users` table.
-- 3. Run the following SQL command, replacing 'user-id-here' with the actual ID:
--    UPDATE public.profiles SET role = 'admin' WHERE id = 'user-id-here';
