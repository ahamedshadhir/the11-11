export type Category = {
  id: string;
  name: string;
  nameAr: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageHero: string;
  price: number;
  compareAt: number;
  stock: number;
  rating: number;
  reviews: number;
  categoryId: string;
};

export const CATEGORIES: Category[] = [
  { id: "computers", name: "Computer & Laptop", nameAr: "حواسيب", image: "/media/cat-laptop.png" },
  { id: "phones", name: "SmartPhone", nameAr: "هواتف", image: "/media/cat-phone.png" },
  { id: "headphones", name: "Headphones", nameAr: "سماعات", image: "/media/cat-headphones.png" },
  { id: "accessories", name: "Accessories", nameAr: "إكسسوارات", image: "/media/cat-accessories.png" },
  { id: "camera", name: "Camera & Photo", nameAr: "كاميرات", image: "/media/cat-camera.png" },
  { id: "tv", name: "TV & Homes", nameAr: "تلفزيونات", image: "/media/cat-tv.png" },
  { id: "fashion", name: "Fashion", nameAr: "أزياء", image: "/media/cat-fashion.jpg" },
];

export const PRODUCTS: Product[] = [
  {
    id: "8",
    name: "White Sneakers",
    slug: "white-sneakers",
    description: "Lightweight design. Breathable mesh. Anti-slip sole. Casual street style.",
    image: "/media/p8.jpg",
    imageHero: "/media/p8.jpg",
    price: 200,
    compareAt: 250,
    stock: 9,
    rating: 5,
    reviews: 1,
    categoryId: "fashion",
  },
  {
    id: "12",
    name: "Ultra Slim Gaming Laptop",
    slug: "ultra-slim-gaming-laptop",
    description: "Ultra thin design. Backlit keyboard. Fast SSD storage.",
    image: "/media/p12.jpg",
    imageHero: "/media/p12.jpg",
    price: 7500,
    compareAt: 8250,
    stock: 143,
    rating: 4.1,
    reviews: 5,
    categoryId: "computers",
  },
  {
    id: "6",
    name: "Apple iPhone 15",
    slug: "apple-iphone-15",
    description: "Dynamic Island display. A16 Bionic chip. 48MP main camera. USB-C charging. 5G connectivity.",
    image: "/media/p6.jpg",
    imageHero: "/media/p6.jpg",
    price: 4500,
    compareAt: 5000,
    stock: 111,
    rating: 5,
    reviews: 1,
    categoryId: "phones",
  },
  {
    id: "7",
    name: "Samsung Galaxy S23",
    slug: "samsung-galaxy-s23",
    description:
      "Compact premium smartphone. 6.1-inch Dynamic AMOLED 2X, 120Hz, Snapdragon 8 Gen 2 for Galaxy, triple camera.",
    image: "/media/p7.jpg",
    imageHero: "/media/p7.jpg",
    price: 6000,
    compareAt: 6500,
    stock: 43,
    rating: 3.2,
    reviews: 2,
    categoryId: "phones",
  },
  {
    id: "9",
    name: "Black Running Sneakers",
    slug: "black-running-sneakers",
    description: "Shock absorbing sole. Running comfort. Breathable design.",
    image: "/media/p9.jpg",
    imageHero: "/media/p9.jpg",
    price: 2999,
    compareAt: 3500,
    stock: 143,
    rating: 3.5,
    reviews: 1,
    categoryId: "fashion",
  },
  {
    id: "11",
    name: "White sneaker",
    slug: "white-sneaker",
    description: "Lightweight design. Breathable mesh. Anti-slip sole. Casual street style.",
    image: "/media/p11.jpg",
    imageHero: "/media/p11.jpg",
    price: 3500,
    compareAt: 3999,
    stock: 0,
    rating: 5,
    reviews: 1,
    categoryId: "fashion",
  },
];

export const BEST_SELLER_IDS = ["8", "12", "6", "7", "9"];
export const RECOMMENDED_IDS = ["6", "12", "11", "9", "8", "7"];

export const HERO_IMAGE = "/media/hero-offer.png";

export const QATAR_AREAS = [
  "Doha",
  "Al Wakrah",
  "Al Rayyan",
  "Lusail",
  "The Pearl",
  "West Bay",
  "Al Khor",
  "Msheireb",
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export function byCategory(id?: string) {
  if (!id) return PRODUCTS;
  return PRODUCTS.filter((p) => p.categoryId === id);
}

export function searchProducts(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return PRODUCTS;
  return PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s),
  );
}
