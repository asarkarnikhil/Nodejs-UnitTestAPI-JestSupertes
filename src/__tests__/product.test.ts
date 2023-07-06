import supertest from "supertest"
import createServer from "../utils/server"
import { createProduct } from "../service/product.service";
import mongoose from "mongoose";
import { signJwt } from "../utils/jwt.utils";
const { setupMongoMemoryServer, tearDownMongoMemoryServer } = require('./test.setup.ts');


const app = createServer()

const userId = new mongoose.Types.ObjectId().toString();
export const productPayload = {
    user: userId,
    title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
    description: "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 NP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
    price: 879.99,
    image: "https://i.imgur.com/QlRphfQ.jpg",
};

export const userPayload = {
    _id: userId,
    email: 'nikhil@gmail.com',
    name: 'Nikhil A'
}

describe('product', () => { //module being tested

    beforeAll(async () => {
        await setupMongoMemoryServer();
    });

    afterAll(async () => {
        await tearDownMongoMemoryServer();
    });

    describe('get product route', () => {// what is being tested
        describe('given the product does not exist', () => { //condition 1
            it('should return a 404', async () => {
                const productId = 'product-123';

                await supertest(app).get(`/api/products/${productId}`)
                    .expect(404)
            })
        })

        describe('given the product does exist', () => { //condition 1
            it('should return a 200 status and a created product', async () => {
                const product = await createProduct(productPayload);

                const { body, statusCode } = await supertest(app).get(`/api/products/${product.productId}`)

                expect(statusCode).toEqual(200);
                expect(body.productId).toEqual(product.productId);
            })
        })
    })

    describe('create product route', () => {
        describe('given the user is not logged in', () => {
            it('should return an 403 error', async () => {
                const { statusCode } = await supertest(app)
                    .post('/api/products');

                expect(statusCode).toBe(403);
            })
        })

        describe('given the user is logged in', () => {
            it('should return 200 status and create the product', async () => {
                const jwt = signJwt(userPayload);

                const {statusCode, body} = await supertest(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${jwt}`)
                .send(productPayload)

                expect(statusCode).toBe(200);
                expect(body).toEqual({
                       "__v": 0,
                       "_id": expect.any(String),
                       "createdAt": expect.any(String),
                       "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 NP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
                       "image": "https://i.imgur.com/QlRphfQ.jpg",
                       "price": 879.99,
                       "productId": expect.any(String),
                       "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
                       "updatedAt": expect.any(String),
                       "user": expect.any(String),
                     });
            })
        })
    })
})