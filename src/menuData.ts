export type MenuCategory =
  | 'Pizzas & Wood-Fired'
  | 'Manipal Specials'
  | 'Omelettes'
  | 'Toasts, Sandwiches & Burgers'
  | 'Starters, Mains & Pastas'
  | 'Desserts, Ice Cream, Shakes & Sundaes';

export type Cuisine = 'Thai' | 'Continental' | 'Pizza' | 'Mangalorean' | 'Desserts' | 'Italian' | 'Pasta' | 'Chinese';

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  category: MenuCategory;
  cuisine: Cuisine;
  price: string;
  topDish?: boolean;
  vegetarian?: boolean;
  ingredients: string;
  allergens: string;
  pairing: string;
};

type Base = Omit<MenuItem, 'id' | 'name' | 'price'>;
type Row = { name: string; price: string; topDish?: boolean; vegetarian?: boolean };
let nextId = 1;
const items = (base: Base, rows: Row[]): MenuItem[] => rows.map((row) => ({ id: nextId++, ...base, ...row }));

const pizzaBase: Base = { category: 'Pizzas & Wood-Fired', cuisine: 'Pizza', description: 'wood-fired thin crust · house tomato · mozzarella', topDish: true, ingredients: 'Hand-stretched dough, tomato sugo, mozzarella, herbs, olive oil.', allergens: 'Gluten · Dairy', pairing: 'A cold craft lager or citrus-forward soda.' };
const breakfastBase: Base = { category: 'Manipal Specials', cuisine: 'Mangalorean', description: 'breakfast plates · toast & butter · local favourites', ingredients: 'Eggs, toasted bread, butter, spice, and the particular comfort of Manipal.', allergens: 'Egg · Gluten · Dairy', pairing: 'Hot filter coffee or a fresh lime soda.' };
const omeletteBase: Base = { category: 'Omelettes', cuisine: 'Continental', description: 'with 2 toast & butter or garlic bread', ingredients: 'Two-egg omelette, toast and butter or garlic bread.', allergens: 'Egg · Gluten · Dairy', pairing: 'A chilled juice or black coffee.' };
const toastBase: Base = { category: 'Toasts, Sandwiches & Burgers', cuisine: 'Continental', description: 'pressed, toasted, and made for the table', ingredients: 'Fresh bread, seasonal fillings, house sauces, toast and butter.', allergens: 'Gluten · Dairy', pairing: 'A side of fries and something fizzy.' };
const dessertBase: Base = { category: 'Desserts, Ice Cream, Shakes & Sundaes', cuisine: 'Desserts', description: 'sweet things · baked, chilled, and made in-house', topDish: true, vegetarian: true, ingredients: 'House-baked dessert, seasonal fruit, cream, chocolate, or caramel.', allergens: 'Gluten · Dairy · Egg', pairing: 'A final coffee, always.' };

export const menuData: MenuItem[] = [
  ...items(pizzaBase, [
    { name: 'Paneer Tikka', price: '₹290 / 320', vegetarian: true }, { name: 'Green Mexican', price: '₹290 / 320', vegetarian: true }, { name: 'Red Mexican', price: '₹290 / 320', vegetarian: true }, { name: 'Rustic', price: '₹290 / 320', vegetarian: true },
    { name: 'Chicken Tikka', price: '₹330 / 360' }, { name: 'Burnt Garlic Chicken', price: '₹330 / 360' }, { name: 'Chicken Supreme', price: '₹330 / 360' },
    { name: 'POCO', price: 'Chef special' }, { name: 'COMO', price: 'Chef special' }, { name: 'BaOv', price: 'Chef special' }, { name: 'PCP', price: 'Chef special' }, { name: 'Toba', price: 'Chef special' }, { name: 'CiPa', price: 'Chef special' }, { name: 'CIOTO', price: 'Chef special' }, { name: 'SOM', price: 'Chef special' }, { name: '3CM', price: 'Chef special' }, { name: 'BMO', price: 'Chef special' }, { name: 'TCs', price: 'Chef special' }, { name: 'RCK', price: 'Chef special' }, { name: 'CSo', price: 'Chef special' }, { name: 'CscB', price: 'Chef special' }, { name: 'CmpI', price: 'Chef special' }, { name: 'Ckci', price: 'Chef special' }, { name: 'Ckco', price: 'Chef special' }, { name: 'CPt', price: 'Chef special' }, { name: 'SUCs', price: 'Chef special' }, { name: 'TO', price: 'Chef special' },
    { name: 'Make Your Own', price: 'Ask the kitchen', vegetarian: true }, { name: 'Extra Toppings Veg', price: '₹40', vegetarian: true }, { name: 'Extra Toppings Non-Veg', price: '₹60' },
  ]),

  ...items(breakfastBase, [
    { name: 'Keshto with Egg', price: '₹80' }, { name: 'Bun Omelette', price: '₹80' }, { name: 'Kannan Bulls Eye with Egg', price: '₹80' }, { name: 'Bulls Eye w/ toast & butter', price: '₹80' }, { name: 'Spicy Egg Burjee w/ toast & butter', price: '₹80' }, { name: 'Scrambled Eggs w/ toast & butter', price: '₹80' }, { name: 'Kejriwal', price: '₹80' },
    { name: 'Chilli Cheese Toast Veg', price: '₹100', vegetarian: true }, { name: 'Anda Paratha', price: '₹100' }, { name: 'Mota Special with Egg', price: '₹120' }, { name: 'Creamy Scrambled Eggs with Spinach', price: '₹120', vegetarian: true }, { name: 'Breakfast Sub', price: '₹140' },
  ]),

  ...items(omeletteBase, [
    { name: 'Plain', price: '₹100', vegetarian: true }, { name: 'Masala', price: '₹110', vegetarian: true }, { name: 'Cheese', price: '₹110', vegetarian: true }, { name: 'Tomato Basil', price: '₹130', vegetarian: true }, { name: '3 Cheese', price: '₹140', vegetarian: true }, { name: 'Ultimate Veggies', price: '₹150', vegetarian: true }, { name: "Menage 'a' trois", price: '₹150', vegetarian: true }, { name: 'Huevos Supremo', price: '₹150', vegetarian: true }, { name: 'Southwestern', price: '₹150', vegetarian: true }, { name: 'Garden', price: '₹150', vegetarian: true }, { name: 'Herbed Potato & Onion', price: '₹150', vegetarian: true }, { name: 'Chicken Stuffed', price: '₹150' }, { name: '3 Chicken Pepper Omelette with Cheese', price: '₹160' },
  ]),

  ...items(toastBase, [
    { name: 'Classic French Toast', price: '₹120 / 170', vegetarian: true }, { name: 'French Toast w/ Cream Cheese', price: '₹140 / 170', vegetarian: true }, { name: 'French Toast w/ Peanut Butter', price: '₹150 / 180', vegetarian: true }, { name: 'Bombay Style Sandwich Veg', price: '₹130 / 160', vegetarian: true }, { name: 'Chicken Tikka Sandwich', price: '₹150 / 180' }, { name: 'Curried Chicken Sandwich', price: '₹150' }, { name: 'Tandoori Chicken Sandwich', price: '₹150' }, { name: 'Thyme Roasted Chicken Sandwich', price: '₹150 / 180' }, { name: 'Spinach & Corn Sandwich', price: '₹160', vegetarian: true }, { name: 'Focaccia Sandwich Veg/Italian Chicken', price: '₹200 / 220' }, { name: 'Barbecue Chicken Sandwich', price: '₹180' }, { name: 'Classic Veggie Burger', price: '₹110 / 150', vegetarian: true }, { name: 'Paneer Tikka Burger', price: '₹130 / 160', vegetarian: true }, { name: 'Mexican Burger', price: '₹150 / 180', vegetarian: true }, { name: 'Grilled Crusty Chicken Burger', price: '₹170 / 200' }, { name: 'Tex Mex Habanero Chicken Burger', price: '₹170 / 200' },
  ]),

  ...items({ category: 'Starters, Mains & Pastas', cuisine: 'Continental', description: 'small plates, salads, and things to share', ingredients: 'Seasonal produce, toasted bread, herbs, dressings, and house sauces.', allergens: 'Gluten · Dairy · Nuts', pairing: 'Start with a fresh lime soda.' }, [
    { name: 'Egg Chop', price: '₹165' }, { name: 'Fresh Tomato Bruschetta', price: '₹120', vegetarian: true }, { name: 'Herbed Potato', price: '₹120', vegetarian: true }, { name: 'Chilli Cheese Toast Veg', price: '₹140', vegetarian: true }, { name: 'French Fries Classic/Peri Peri', price: '₹140', vegetarian: true }, { name: 'Chicken Crostini', price: '₹160' }, { name: 'Breakfast Sub', price: '₹160' }, { name: 'Caesar Salad Veg/Chicken', price: '₹180 / 220', vegetarian: true }, { name: 'Pasta Salad Veg/Non-Veg', price: '₹190 / 230' }, { name: 'Waldorf Salad', price: '₹200', vegetarian: true }, { name: 'Nachos Veg/Non-Veg', price: '₹180 / 220' },
  ]),
  ...items({ category: 'Starters, Mains & Pastas', cuisine: 'Pasta', description: 'house pasta · slow sauces · generous plates', topDish: true, ingredients: 'Durum pasta, herbs, vegetables or protein, parmesan, house sauce.', allergens: 'Gluten · Dairy · Egg', pairing: 'Ask for the day’s cold drink pairing.' }, [
    { name: 'Basil Pesto Pasta', price: '₹200–400', topDish: true, vegetarian: true }, { name: 'Aglio Olio', price: '₹200–400', topDish: true, vegetarian: true }, { name: 'Carbonara', price: '₹200–400', topDish: true }, { name: 'Spaghetti Bolognese', price: '₹200–400', topDish: true }, { name: 'Chicken Lasagne', price: '₹200–400', topDish: true },
  ]),
  ...items({ category: 'Starters, Mains & Pastas', cuisine: 'Italian', description: 'house pasta · slow sauces · generous plates', topDish: true, ingredients: 'Durum pasta, herbs, vegetables or protein, parmesan, house sauce.', allergens: 'Gluten · Dairy · Egg', pairing: 'Ask for the day’s cold drink pairing.' }, [
    { name: 'Schezwan Crispies', price: '₹200–400', topDish: true }, { name: 'Kung Pao', price: '₹200–400' }, { name: 'Satay Peanut', price: '₹200–400' }, { name: 'Tuscan Fried Chicken', price: '₹200–400' }, { name: 'Grilled Chicken', price: '₹200–400' }, { name: 'Grilled Fish', price: '₹200–400' },
  ]),
  ...items({ category: 'Starters, Mains & Pastas', cuisine: 'Thai', description: 'bright spice · herbs · wok-fired finish', ingredients: 'Wok vegetables, aromatics, house spice, herbs, rice or noodles.', allergens: 'Peanuts · Soy', pairing: 'A cold, sharp citrus cooler.' }, [
    { name: 'Thai Basil Rice', price: '₹230 / 320' }, { name: 'Thai Green Curry', price: '₹230 / 320' }, { name: 'Thai Chilli Noodles', price: '₹230 / 320' },
  ]),
  ...items({ category: 'Starters, Mains & Pastas', cuisine: 'Chinese', description: 'wok-tossed comfort with a Hadiqa edge', ingredients: 'Wok vegetables, aromatics, soy, chilli, spring onion.', allergens: 'Soy · Gluten', pairing: 'Fresh lime soda with extra ice.' }, [
    { name: 'Schezwan Fried Rice', price: '₹220 / 320' }, { name: 'Chilli Paneer', price: '₹220 / 320', vegetarian: true }, { name: 'Kung Pao Chicken', price: '₹220 / 320' },
  ]),

  ...items(dessertBase, [
    { name: 'Tarts', price: '₹40' }, { name: 'Oreo Cheese Ball', price: '₹50' }, { name: 'Caramel Custard', price: '₹100' }, { name: 'Mango Panna Cotta', price: '₹100' }, { name: 'Red Velvet Wedge', price: '₹110' }, { name: 'Chocolate Cookies Cake Eggless', price: '₹110' }, { name: 'Dark Chocolate Mousse Wedge', price: '₹110' }, { name: 'Caramel Mousse Slice', price: '₹120' }, { name: 'Creme Brulee', price: '₹130' }, { name: 'Oreo Cheese Cake Eggless Wedge', price: '₹150' }, { name: 'German Chocolate Wedge', price: '₹150' }, { name: 'Cheese Cake Wedge', price: '₹150' }, { name: 'Apple Crumble Cheese Cake', price: '₹160' }, { name: 'Gulab Jamun Cheese Cake', price: '₹160' }, { name: 'Banoffee Jar', price: '₹160' }, { name: 'Choco Lava Pie', price: '₹180' }, { name: 'Marble Cheese Cake w/ Ice Cream', price: '₹150 / 200' }, { name: 'Apple Pie w/ Ice Cream', price: '₹160 / 200' }, { name: 'Choco Lava Pie w/ Ice Cream', price: '₹240' }, { name: 'Dark Chocolate Brownie', price: '₹120–260' },
  ]),
  ...items({ ...dessertBase, description: 'ice cream single / milk shake', ingredients: 'Ice cream, milk, seasonal fruit, biscuit, or house crunch.', allergens: 'Dairy · Nuts' }, [
    { name: 'Belgian Chocolate', price: '₹90 / 160' }, { name: 'Belgian Chocolate Biscuit', price: '₹90 / 160' }, { name: 'Alphonso Mango', price: '₹90 / 160' }, { name: 'Vanilla', price: '₹90 / 160' }, { name: 'Butterscotch Crunch', price: '₹90 / 160' }, { name: 'Black Currant', price: '₹90 / 160' },
  ]),
  ...items({ ...dessertBase, description: 'sundaes · warm sauce · cold scoop', ingredients: 'Ice cream, warm sauce, fruit, nuts, biscuit, and a little theatre.', allergens: 'Dairy · Nuts · Gluten' }, [
    { name: 'Hot Chocolate Fudge', price: '₹120–240' }, { name: 'Chocolate Sundae', price: '₹120–240' }, { name: 'Grilled Pineapple', price: '₹120–240' }, { name: 'Mango Delight', price: '₹120–240' }, { name: 'Banana Split', price: '₹120–240' }, { name: 'Dry Fruits Ice Cream', price: '₹120–240' }, { name: 'Gadbad', price: '₹120–240' }, { name: 'Hot Fudge Nachos', price: '₹120–240' },
  ]),
];

export const categories: Array<'All' | MenuCategory> = [
  'All', 'Pizzas & Wood-Fired', 'Manipal Specials', 'Omelettes',
  'Toasts, Sandwiches & Burgers', 'Starters, Mains & Pastas', 'Desserts, Ice Cream, Shakes & Sundaes',
];

export const cuisines: Array<'All' | Cuisine> = ['All', 'Thai', 'Continental', 'Pizza', 'Mangalorean', 'Desserts', 'Italian', 'Pasta', 'Chinese'];
