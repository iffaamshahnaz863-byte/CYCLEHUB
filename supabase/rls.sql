
-- Helper function to check user role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Admin can see all profiles
CREATE POLICY "Admin can see all profiles" ON public.profiles FOR SELECT USING (is_admin());
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- Anyone can view categories
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
-- Admins can manage categories
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (is_admin());

-- PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- Anyone can view active products
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
-- Admins can view all products
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (is_admin());
-- Admins can manage products
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (is_admin());

-- CART
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
-- Users can manage their own cart
CREATE POLICY "Users can manage their own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);
-- Admins can view all carts (for support/debug)
CREATE POLICY "Admins can view all carts" ON public.cart FOR SELECT USING (is_admin());

-- ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
-- Users can create orders for themselves
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can manage all orders
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (is_admin());

-- ORDER_ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- Users can view items of their own orders
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
-- Admins can manage all order items
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert order items" ON public.order_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE USING (is_admin());


-- STORAGE: PRODUCT IMAGES
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND is_admin());
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product_images' AND is_admin());
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND is_admin());

-- STORAGE: CATEGORY IMAGES
CREATE POLICY "Anyone can view category images" ON storage.objects FOR SELECT USING (bucket_id = 'category_images');
CREATE POLICY "Admins can upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category_images' AND is_admin());
CREATE POLICY "Admins can update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'category_images' AND is_admin());
CREATE POLICY "Admins can delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'category_images' AND is_admin());
