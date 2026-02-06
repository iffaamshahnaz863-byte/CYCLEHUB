
-- Create custom types
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'cancelled'
);

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    phone text,
    address text,
    pincode text,
    role text NOT NULL DEFAULT 'user',
    updated_at timestamptz,
    PRIMARY KEY (id)
);
-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$;
-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Categories Table
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Products Table
CREATE TABLE public.products (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    discount_price numeric(10, 2),
    stock integer NOT NULL DEFAULT 0,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    images text[],
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Cart Table
CREATE TABLE public.cart (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id, product_id)
);

-- Orders Table
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    total_amount numeric(10, 2) NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending',
    payment_method text NOT NULL DEFAULT 'cod',
    shipping_address jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Order Items Table
CREATE TABLE public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL,
    price numeric(10, 2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Enable extensions for uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Supabase Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('category_images', 'category_images', true)
ON CONFLICT (id) DO NOTHING;
