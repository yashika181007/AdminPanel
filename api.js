const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const util = require('util');
require('dotenv').config();


const app = express();
const PORTAPI = process.env.PORTAPI; 

app.use(session({
    secret: 'megastore',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const pool = mysql.createPool({
    host: 'srv871.hstgr.io',
    user: 'u510451310_megastore',
    password: 'U510451310_megastore',
    database: 'u510451310_megastore',
    waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});

pool.query = util.promisify(pool.query); // Promisify for async/await

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const executeQuery = (sql, values = [], res) => {
    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error executing query:', error.stack);
            return res.status(500).json({ error: 'Server error' });
        }
        res.status(200).json(results);
    });
};
app.post('/order', async (req, res) => {
    const sessionUserId = 2; 
    const { products, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status } = req.body;

    console.log('Request Body:', req.body);

    try {
        const userCheckQuery = 'SELECT id FROM user_details WHERE (email = ? OR phoneNumber = ?) AND id = ?';
        const userCheckResults = await pool.query(userCheckQuery, ['test@gmail.com', '6788996543', sessionUserId]);

        if (userCheckResults.length === 0) {
            console.log('Unauthorized: Session user does not match provided ID');
            return res.status(401).send('Unauthorized: Session user does not match provided ID');
        }

        const insertOrderQuery = 'INSERT INTO `order` (uID) VALUES (?)';
        console.log("insertOrderQuery:", insertOrderQuery);
        const orderResult = await pool.query(insertOrderQuery, [sessionUserId]);
        console.log("orderResult:", orderResult);
        const newOrderId = orderResult.insertId;
        console.log("New Order ID:", newOrderId);

        const sqlMeta = 'INSERT INTO order_meta (orderID, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        // Log products for debugging
        console.log('Products:', products);

        if (!Array.isArray(products)) {
            throw new TypeError('products is not an array');
        }

        for (const product of products) {
            const { productID, qnt } = product;
            await pool.query(sqlMeta, [newOrderId, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status]);
        }

        res.status(201).send('Order and order meta created successfully');
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).send('Server error');
    }
});


app.get('/store', (req, res) => executeQuery('SELECT * FROM stores', [], res));
app.get('/category', (req, res) => executeQuery('SELECT * FROM category', [], res));
app.get('/subcategory', (req, res) => executeQuery('SELECT * FROM subcategory', [], res));
app.get('/sub_subcategory', (req, res) => executeQuery('SELECT * FROM sub_subcategory', [], res));
app.get('/products', (req, res) => executeQuery('SELECT * FROM products', [], res));
app.get('/blogcategory', (req, res) => executeQuery('SELECT * FROM blogcat', [], res));
app.get('/blogpost', (req, res) => executeQuery('SELECT * FROM blogpost', [], res));
app.get('/user', (req, res) => executeQuery('SELECT * FROM user_details', [], res));
app.get('/product', (req, res) => executeQuery('SELECT * FROM products', [], res));
app.get('/order', (req, res) => executeQuery('SELECT order_meta.*,`order`.* , products.*FROM  order_meta INNER JOIN `order`ON  order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID', [], res));
app.get('/orders/:orderID', (req, res) => {
    const orderID = req.params.orderID;

    // Execute the database query
    pool.query('SELECT order_meta.*, `order`.*, products.* FROM order_meta INNER JOIN `order` ON order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID WHERE `order_meta`.orderID = ?', [orderID], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Error executing query');
        } else {
            console.log('Query results:', results);
            res.json(results); // Return JSON response with query results
        }
    });
});

app.get('/:type/:id', (req, res) => {
    const { type, id } = req.params;
    let sql;

    if (type === 'store') {
        sql = 'SELECT * FROM stores WHERE id = ?';
    } else if (type === 'category') {
        sql = 'SELECT * FROM category WHERE id = ?';
    } else if (type === 'subcategory') {
        sql = 'SELECT * FROM subcategory WHERE id = ?';
    } else if (type === 'sub_subcategory') {
        sql = 'SELECT * FROM sub_subcategory WHERE id = ?';
    } else if (type === 'products') {
        sql = 'SELECT * FROM products WHERE id = ?';
    } else if (type === 'blogcategory') {
        sql = 'SELECT * FROM blogcat WHERE id = ?';
    } else if (type === 'blogpost') {
        sql = 'SELECT * FROM blogpost WHERE id = ?';
    } else if (type === 'user') {
        sql = 'SELECT * FROM user_details WHERE id = ?';
    } else if (type === 'order') {
        sql = 'SELECT order_meta.*, `order`.*, products.* FROM order_meta INNER JOIN `order` ON order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID WHERE products.id = ? And order_meta.orderID  = ?'
    } else {
        return res.status(400).send('Invalid type parameter');
    }

    executeQuery(sql, [id], res);
});

app.post('/user', async (req, res) => {

    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        executeQuery('INSERT INTO user_details (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, phoneNumber], res);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error processing request');

    }
});

app.post('/:type/:id?', async (req, res) => {
    const { type, id } = req.params;

    if (type === 'user') {
        const { name, email, password, phoneNumber } = req.body;

        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).send('Missing required fields');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = 'INSERT INTO user_details (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)';

            pool.query(sql, [name, email, hashedPassword, phoneNumber], (err, result) => {
                if (err) {
                    return res.status(500).send('Database query error');
                }
                res.status(201).send('User created successfully');
            });
        } catch (error) {
            res.status(500).send('Error hashing password');
        }
    } else if (type === 'login') {
        const { email, phoneNumber, password } = req.body;

        if (!id || (!email && !phoneNumber) || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sql = 'SELECT * FROM user_details WHERE (email = ? OR phoneNumber = ?) AND id = ?';
        pool.query(sql, [email || null, phoneNumber || null, id], async (error, results) => {
            if (error) {
                console.error('Error executing query:', error.stack);
                return res.status(500).json({ error: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid email/phone or password');
            }

            const user = results[0];
            try {
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).send('Invalid email/phone or password');
                }

                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.phoneNumber = user.phoneNumber;

                res.status(200).send('Login successful');

            } catch (compareError) {
                console.error('Error comparing passwords:', compareError);
                return res.status(500).json({ error: 'Server error' });
            }
        });
    } else {
        return res.status(400).send('Invalid type parameter');
    }
});


app.delete('/:type/:id', (req, res) => {
    const { type, id } = req.params;
    let sql;
    if (type === 'store') {
        sql = 'DELETE FROM stores WHERE id = ?';
    } else if (type === 'category') {
        sql = 'DELETE FROM category WHERE id = ?';
    } else if (type === 'subcategory') {
        sql = 'DELETE FROM subcategory WHERE id = ?';
    } else if (type === 'products') {
        sql = 'DELETE FROM products WHERE id = ?';
    } else if (type === 'products') {
        sql = 'DELETE FROM blogcat WHERE id = ?';
    } else if (type === 'products') {
        sql = 'DELETE FROM blogpost WHERE id = ?';
    } else {
        return res.status(400).send('Invalid type parameter');
    }
    executeQuery(sql, [id], res);
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        } else {
            res.status(200).send('Logout successful');
        }
    });
});

app.listen(PORTAPI, () => console.log(`Server running on http://localhost:${PORTAPI}`));
