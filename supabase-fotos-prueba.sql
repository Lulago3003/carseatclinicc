-- =====================================================================
-- Car Seat Clinic Center — Fotos de PRUEBA para ver la tienda con imágenes
-- ---------------------------------------------------------------------
-- Fotos de ejemplo (de catálogo público) SOLO para la demo. Reemplázalas
-- luego por las tuyas desde el panel (Editar → Subir fotos).
-- Corre en: Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- Silla para bebé (recién nacidos)
update public.products set images = '[
  "https://www.poppys.com/cdn/shop/files/e7745d742474451eff81bcc642634e4357635183.jpg"
]'::jsonb where id = 'p1';

-- Silla 360° (galería de 2 fotos)
update public.products set images = '[
  "https://www.poppys.com/cdn/shop/files/PB-CFX101GR-TWIST-GRIS-PREMIUMBABY-1_720x_0a76dd69-53af-430e-b5a4-e0f5b28f7881.jpg",
  "https://www.poppys.com/cdn/shop/files/5056080688978_10.png"
]'::jsonb where id = 'p2';

-- Booster con respaldo (galería de 5 fotos)
update public.products set images = '[
  "https://www.poppys.com/cdn/shop/files/20220921_i-chapp_shale_001_cs_cc_hr.jpg",
  "https://www.poppys.com/cdn/shop/files/20220921_i-chapp_shale_004_cs_cc_hr.jpg",
  "https://www.poppys.com/cdn/shop/files/20220921_i-chapp_shale_006_cs_cc_hr.jpg",
  "https://www.poppys.com/cdn/shop/files/20220921_i-chapp_shale_007_cs_cc_hr.jpg",
  "https://www.poppys.com/cdn/shop/files/20220921_i-chapp_shale_008_cs_cc_hr.jpg"
]'::jsonb where id = 'p3';

-- Convertible (Grupo 1)
update public.products set images = '[
  "https://www.poppys.com/cdn/shop/files/41sjb9Tcd5L._AC.jpg"
]'::jsonb where id = 'p10';

-- Combinada 2 en 1
update public.products set images = '[
  "https://www.poppys.com/cdn/shop/files/PB2389_GRAHAM_NEGRO_PREMIUMBABY_1_720x_f8f54e50-6186-4647-87b1-ab5df33dfb5e.jpg"
]'::jsonb where id = 'p11';

-- ¡Listo! Recarga la tienda: verás fotos en las tarjetas y la ficha del
-- Booster con galería de varias fotos.
