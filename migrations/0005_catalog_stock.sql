alter table store_products add column if not exists reviews integer not null default 0;

insert into store_products
  (id, slug, name, description, image, category_id, price, compare_at, stock, rating, reviews)
values
  ('8', 'white-sneakers', 'White Sneakers', 'Lightweight design. Breathable mesh. Anti-slip sole. Casual street style.', '/media/p8.jpg', 'fashion', 200, 250, 9, 5, 1),
  ('12', 'ultra-slim-gaming-laptop', 'Ultra Slim Gaming Laptop', 'Ultra thin design. Backlit keyboard. Fast SSD storage.', '/media/p12.jpg', 'computers', 7500, 8250, 143, 4.1, 5),
  ('6', 'apple-iphone-15', 'Apple iPhone 15', 'Dynamic Island display. A16 Bionic chip. 48MP main camera. USB-C charging. 5G connectivity.', '/media/p6.jpg', 'phones', 4500, 5000, 111, 5, 1),
  ('7', 'samsung-galaxy-s23', 'Samsung Galaxy S23', 'Compact premium smartphone. 6.1-inch Dynamic AMOLED 2X, 120Hz, Snapdragon 8 Gen 2 for Galaxy, triple camera.', '/media/p7.jpg', 'phones', 6000, 6500, 43, 3.2, 2),
  ('9', 'black-running-sneakers', 'Black Running Sneakers', 'Shock absorbing sole. Running comfort. Breathable design.', '/media/p9.jpg', 'fashion', 2999, 3500, 143, 3.5, 1),
  ('11', 'white-sneaker', 'White sneaker', 'Lightweight design. Breathable mesh. Anti-slip sole. Casual street style.', '/media/p11.jpg', 'fashion', 3500, 3999, 0, 5, 1)
on conflict (id) do nothing;
