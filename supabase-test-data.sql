-- ============================================================
-- ТЕСТОВІ ДАНІ для розробки
-- ============================================================

-- Створення тестового адміна (після реєстрації через UI)
-- Замініть 'USER_UUID_HERE' на реальний UUID користувача
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';

-- Додаткові тестові продукти
INSERT INTO products (name, description, price, unit, image, badge, category, stock, sort_order) VALUES
  ('Вареники з м''ясом', 'Соковиті вареники з яловичиною та свининою', 14, '/ kg', '/images/hero-varenyky.jpg', null, 'varenyky', 15, 11),
  ('Вареники з полуницею', 'Солодкі вареники з свіжою полуницею', 15, '/ kg', '/images/hero-varenyky.jpg', 'Сезонні', 'varenyky', 8, 12),
  ('Сирники з родзинками', 'Класичні сирники з родзинками', 11, '/ 600g', '/images/syrnyky.png', null, 'syrnyky', 12, 13),
  ('Пельмені (риба)', 'Ніжні пельмені з лососем', 18, '/ kg', '/images/pelmeni.png', 'Преміум', 'pelmeni', 6, 14)
ON CONFLICT DO NOTHING;

-- Тестові відгуки (потрібні реальні user_id після реєстрації)
-- INSERT INTO reviews (user_id, user_name, rating, comment, approved) VALUES
--   ('USER_UUID_1', 'Марія Коваленко', 5, 'Найкращі вареники в місті! Смак як у бабусі', true),
--   ('USER_UUID_2', 'Олександр Шевченко', 5, 'Швидка доставка, все свіже та смачне', true),
--   ('USER_UUID_3', 'Наталія Бондаренко', 4, 'Дуже смачно, але хотілося б більше начинки', true);

-- Тестові промокоди
INSERT INTO promo_codes (code, discount_percent, min_order, valid_until, max_uses, active) VALUES
  ('WELCOME10', 10, 20, NOW() + INTERVAL '30 days', 100, true),
  ('SUMMER20', 20, 50, NOW() + INTERVAL '60 days', 50, true),
  ('FREESHIP', NULL, 30, NOW() + INTERVAL '90 days', NULL, true)
ON CONFLICT DO NOTHING;

-- Оновлення налаштувань доставки
INSERT INTO settings (key, value) VALUES 
  ('delivery', '{"min_order": 10, "free_threshold": 50, "fee": 5}'),
  ('business_hours', '{"monday": "9:00-20:00", "tuesday": "9:00-20:00", "wednesday": "9:00-20:00", "thursday": "9:00-20:00", "friday": "9:00-21:00", "saturday": "10:00-21:00", "sunday": "10:00-18:00"}'),
  ('contact', '{"phone": "+380501234567", "email": "info@varenyky.com", "address": "вул. Хрещатик, 1, Київ"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Перевірка даних
SELECT 'Products count:' as info, COUNT(*) as count FROM products;
SELECT 'Reviews count:' as info, COUNT(*) as count FROM reviews;
SELECT 'Promo codes count:' as info, COUNT(*) as count FROM promo_codes;
SELECT 'Settings count:' as info, COUNT(*) as count FROM settings;
