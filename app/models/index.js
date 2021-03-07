const Customer = require('./customer');
const Image = require('./image');
const Order = require('./order');
const Product = require('./product');
const Seller = require('./seller');
const Category = require('./category');

// un customer a plusieurs orders
Customer.hasMany(Order, {
    foreignKey: "customer_id",
    as: "orders"
});

// réciproque : un order est lié à un seul customer
Order.belongsTo(Customer, {
    foreignKey: "customer_id",
    as: "customer"
});

// un seller a plusieurs products
Seller.hasMany(Product, {
    foreignKey: "seller_id",
    as: "products"
});

// réciproque : un product est lié à un seul seller
Product.belongsTo(Seller, {
    foreignKey: "seller_id",
    as: "seller"
});

// un product a plusieurs images
Product.hasMany(Image, {
    foreignKey: "product_id",
    as: "images"
});

// réciproque : une image est liée à un seul product
Image.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});


// Product <> Order, via la table de liaison
// "Un Product possède plusieurs Orders"
Product.belongsToMany(Order, {
    as: "orders", // alias de l'association 
    through: 'order_has_product', // "via la table de liaison qui s'appelle ..."
    foreignKey: 'product_id', // le nom de la clef de Product dans la table de liaison
    otherKey: 'order_id', // le nom de la clef de "l'autre" (donc Order)
    timestamps: false // il n'y a pas de updated-at dans la table de liaison
});

// et la réciproque..
Order.belongsToMany(Product, {
    as: "products", 
    through: 'order_has_product',
    foreignKey: 'order_id',
    otherKey: 'product_id',
    timestamps: false // il n'y a pas de updated-at dans la table de liaison
});


Category.hasMany(Product, {
    foreignKey: "category_id",
    as: "products"
});

// réciproque : un produit est lié à une seule catégorie
Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
});


module.exports = { Order, Product, Image, Customer, Category, Seller };