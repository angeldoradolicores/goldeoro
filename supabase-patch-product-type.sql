-- =====================================================
-- GOL DE ORO - SQL PATCH (Tipo de Producto e Trigger de Slugs)
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- -----------------------------------------------------
-- PARTE 1: Cambiar el tipo de columna de product_type a TEXT
-- -----------------------------------------------------
-- 1. Eliminar el valor predeterminado temporalmente
ALTER TABLE products ALTER COLUMN product_type DROP DEFAULT;

-- 2. Cambiar el tipo de datos de la columna de ENUM a TEXT
ALTER TABLE products ALTER COLUMN product_type TYPE TEXT USING product_type::TEXT;

-- 3. Volver a colocar el valor predeterminado como 'gorra' (ahora tipo TEXT)
ALTER TABLE products ALTER COLUMN product_type SET DEFAULT 'gorra';


-- -----------------------------------------------------
-- PARTE 2: Crear trigger para generar automáticamente el slug de categorías
-- -----------------------------------------------------
-- Habilitar extensión unaccent si no existe (para quitar acentos)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Función para generar/limpiar el slug de la categoría
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
DECLARE
  clean_slug TEXT;
BEGIN
  -- Si no se provee slug, o viene vacío o con espacios
  IF NEW.slug IS NULL OR TRIM(NEW.slug) = '' THEN
    -- Tomar el nombre, quitar acentos y pasarlo a minúsculas
    clean_slug := lower(unaccent(NEW.name));
  ELSE
    -- Si se provee, limpiar el slug provisto
    clean_slug := lower(unaccent(NEW.slug));
  END IF;

  -- Reemplazar caracteres no alfanuméricos por guiones
  clean_slug := regexp_replace(clean_slug, '[^a-z0-9]+', '-', 'g');
  -- Quitar guiones duplicados y extremos
  clean_slug := regexp_replace(clean_slug, '-+', '-', 'g');
  clean_slug := regexp_replace(clean_slug, '(^-+|-+$)', '', 'g');

  NEW.slug := clean_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger antes de insertar o actualizar en la tabla categories
DROP TRIGGER IF EXISTS trg_generate_category_slug ON categories;
CREATE TRIGGER trg_generate_category_slug
BEFORE INSERT OR UPDATE OF name, slug ON categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_slug();
