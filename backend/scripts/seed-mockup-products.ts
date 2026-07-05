import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { id: "rolls", name: "Rolls" },
  { id: "nigiri", name: "Nigiri" },
  { id: "sashimi", name: "Sashimi" },
  { id: "combos", name: "Combos" },
  { id: "temaki", name: "Temaki" },
  { id: "entradas", name: "Entradas" },
  { id: "vegetariano", name: "Vegetariano" }
];

const products = [
  {
    id: "mockup-roll-especial-salmon",
    name: "Roll Especial de Salmon",
    description: "Roll de salmon, palta y queso crema con topping de semillas de sesamo",
    price: 8990,
    imageUrl: "https://cdn7.kiwilimon.com/recetaimagen/3938/640x640/15440.jpg.jpg",
    categoryId: "rolls"
  },
  {
    id: "mockup-nigiri-premium",
    name: "Nigiri Premium",
    description: "Seleccion de 8 piezas de nigiri fresco: salmon, atun, camaron y pez mantequilla",
    price: 12990,
    imageUrl:
      "https://us.123rf.com/450wm/gkrphoto/gkrphoto1504/gkrphoto150400339/39147592-the-composition-of-nigiri-sushi-with-tuna-salmon-shrimp-butterfish-on-rice.jpg",
    categoryId: "nigiri"
  },
  {
    id: "mockup-sashimi-deluxe",
    name: "Sashimi Deluxe",
    description: "Cortes premium de pescado fresco: salmon y atun rojo",
    price: 15990,
    imageUrl: "https://soyummy.com/wp-content/uploads/2024/05/close-up-of-fresh-sashimi-salmon-and-tuna-stockpack-istock-900x675.jpg",
    categoryId: "sashimi"
  },
  {
    id: "mockup-combo-familiar",
    name: "Combo Familiar",
    description: "32 piezas variadas para compartir: rolls, nigiri y hosomaki",
    price: 29990,
    imageUrl: "https://tokyo-sushi.fr/image/cache/catalog/category/410.-595x550.jpg",
    categoryId: "combos"
  },
  {
    id: "mockup-california-roll",
    name: "California Roll",
    description: "Clasico roll con surimi, palta y pepino, cubierto con masago",
    price: 7490,
    imageUrl: "https://cdn.britannica.com/54/171754-050-8581F347/California-rolls-sushi.jpg",
    categoryId: "rolls"
  },
  {
    id: "mockup-dragon-roll",
    name: "Dragon Roll",
    description: "Roll de anguila con palta encima, salsa teriyaki y sesamo",
    price: 11990,
    imageUrl: "https://images.unsplash.com/photo-1653122025835-69c5b0bc486f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    categoryId: "rolls"
  },
  {
    id: "mockup-temaki-atun",
    name: "Temaki de Atun",
    description: "Cono de alga nori relleno de atun fresco, palta y mayonesa picante",
    price: 5990,
    imageUrl: "https://t4.ftcdn.net/jpg/00/60/65/95/360_F_60659564_7kOsE4v0F2lQHKN3rECEEVMDx6UCMwiK.jpg",
    categoryId: "temaki"
  },
  {
    id: "mockup-gyoza-camaron",
    name: "Gyoza de Camaron",
    description: "6 piezas de empanadillas japonesas rellenas de camaron",
    price: 6490,
    imageUrl: "https://images.unsplash.com/photo-1703080173985-936514c7c8bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    categoryId: "entradas"
  },
  {
    id: "mockup-sushi-vegetariano",
    name: "Sushi Vegetariano",
    description: "12 piezas con palta, pepino, zanahoria y champinon",
    price: 8490,
    imageUrl: "https://th.bing.com/th/id/R.dca24af381f103c2f4b214b82506dc39?rik=LucBespyK9SvUg&pid=ImgRaw&r=0",
    categoryId: "vegetariano"
  },
  {
    id: "mockup-rainbow-roll",
    name: "Rainbow Roll",
    description: "Roll California cubierto con laminas de salmon, atun y palta",
    price: 13990,
    imageUrl: "https://recetadesushi.com/wp-content/uploads/2023/07/California-roll-de-salmon-y-aguacate.jpg",
    categoryId: "rolls"
  },
  {
    id: "mockup-nigiri-atun",
    name: "Nigiri de Atun",
    description: "4 piezas de nigiri de atun rojo premium",
    price: 9990,
    imageUrl: "https://www.kikkoman.es/fileadmin/_processed_/2/3/csm_417-recipe-page-Nigiri_desktop_4f926bea38.jpg",
    categoryId: "nigiri"
  },
  {
    id: "mockup-combo-pareja",
    name: "Combo Pareja",
    description: "20 piezas variadas: rolls especiales y nigiri seleccionado",
    price: 19990,
    imageUrl: "https://www.sushiexpress.com.py/wp-content/uploads/2020/03/combo-hiroshima-sushi_express.jpg",
    categoryId: "combos"
  }
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: category
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ...product, available: true },
      create: { ...product, available: true }
    });
  }
}

main()
  .then(async () => {
    console.log(`Mockup seed ready: ${categories.length} categories, ${products.length} products.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
