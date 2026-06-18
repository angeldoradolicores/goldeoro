-- PATCH: Add sizes_stock to products table for inventory management per size

ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes_stock JSONB DEFAULT '{}'::jsonb;

-- Optional: If you want to migrate existing data, you could set sizes_stock based on the sizes array.
-- For example, setting default stock 0 for each size, or spreading current stock evenly.
-- We will just leave it as '{}' and allow the admin to edit the products.

-- Add a function to decrement size stock
CREATE OR REPLACE FUNCTION decrement_size_stock(
  p_product_id uuid,
  p_size text,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock integer;
  current_sizes_stock jsonb;
  new_size_stock integer;
BEGIN
  -- Get current stock
  SELECT stock, COALESCE(sizes_stock, '{}'::jsonb) INTO current_stock, current_sizes_stock
  FROM products
  WHERE id = p_product_id;

  -- Decrement global stock
  IF current_stock >= p_quantity THEN
    UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
  ELSE
    UPDATE products SET stock = 0 WHERE id = p_product_id;
  END IF;

  -- Decrement size specific stock if size is provided
  IF p_size IS NOT NULL AND p_size != '' THEN
    -- Check if size exists in the JSONB
    IF current_sizes_stock ? p_size THEN
      new_size_stock := (current_sizes_stock->>p_size)::integer - p_quantity;
      IF new_size_stock < 0 THEN
        new_size_stock := 0;
      END IF;
      
      -- Update the sizes_stock column
      UPDATE products 
      SET sizes_stock = jsonb_set(
        sizes_stock, 
        array[p_size], 
        to_jsonb(new_size_stock)
      )
      WHERE id = p_product_id;
    END IF;
  END IF;
END;
$$;
