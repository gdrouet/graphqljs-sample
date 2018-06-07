let express = require('express');
let graphqlHTTP = require('express-graphql');
let { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
    type Query {
       """Find a product by ID"""
       findProductById(id: ID!): Product!
       """Find all products"""
       findAllProducts(
            """Exclude products without enough stock"""
            minQuantity: Int = 0
       ): [Product]
    }
    
    type Mutation {
       """Save a product"""
       saveProduct(price: String!, quantity: Int!, imageUrl: String): ID!
    }
    
    type Product {
       price(currencyFormat: Currency) : String
       quantity: Int!
       imageUrl: String
    }
    
    enum Currency {
       EUR USD
    }
`);

class ProductService {
    findProductById({id}) {
        console.log(`Resolving product with id ${id}`)
        return new ProductResolver(id);
    }

    findAllProducts({minQuantity}) {
        console.log(minQuantity)
        return [
            new ProductResolver("1"),
            new ProductResolver("2"),
            new ProductResolver("3"),
            new ProductResolver("4"),
            new ProductResolver("5"),
            new ProductResolver("6"),
        ].filter(product => minQuantity <= product.quantity())
    }

    saveProduct({price, quantity, imageUrl}) {
        console.log(`Saving product with quantity ${quantity}, price ${price}, URL ${imageUrl}`);
        return "newId";
    }
}

class ProductResolver {
    constructor(id) {
        this.id = id;
        this.stock = Math.floor(Math.random() * 10 + 1);
    }

    danger(origin) {
        console.log(Math.random());
        if (Math.random() < .25) {
            throw new Error(origin);
        };
    }

    quantity() {
        this.danger("without promise");
        console.log(`Resolving quantity of product with ID ${this.id}`);
        return this.stock;
    }

    imageUrl() {
        return new Promise(resolve => {
            this.danger("within promise");
            console.log(`Resolving imageUrl of product with ID ${this.id}`);
            resolve("http://goo.gl/img.png");
        });
    }

    price({currencyFormat}) {
        console.log(`Resolving price of product with ID ${this.id}`);

        let price = "10";
        if (currencyFormat === 'EUR') {
            price += ' €';
        } else if (currencyFormat === 'USD') {
            price = '$' + price;
        }

        return price;
    }
}

let app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    // The root provides a resolver function for each API endpoint
    rootValue: new ProductService(),
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');