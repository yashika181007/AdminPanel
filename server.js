const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const path = require('path');
const flash = require('connect-flash');
require('dotenv').config();

const { sessionMiddleware } = require('./config/session');
const setMessage = require('./config/setMessage');
const pool = require('./config/database'); 

const app = express();
const PORT = process.env.PORT; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(sessionMiddleware); 
app.use(flash());
app.use(setMessage);

const executeQuery = async (sql, values = []) => {
    try {
        const [results] = await pool.query(sql, values);
        return results;
    } catch (error) {
        throw new Error('Database query error');
    }
};

// API routes
app.post('/order', async (req, res) => {
    const sessionUserId = 2; 
    const { products, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status } = req.body;

    try {
        const userCheckQuery = 'SELECT id FROM user_details WHERE (email = ? OR phoneNumber = ?) AND id = ?';
        const userCheckResults = await executeQuery(userCheckQuery, ['test@gmail.com', '6788996543', sessionUserId]);

        if (userCheckResults.length === 0) {
            return res.status(401).send('Unauthorized: Session user does not match provided ID');
        }

        const insertOrderQuery = 'INSERT INTO `order` (uID) VALUES (?)';
        const orderResult = await executeQuery(insertOrderQuery, [sessionUserId]);
        const newOrderId = orderResult.insertId;

        const sqlMeta = 'INSERT INTO order_meta (orderID, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        if (!Array.isArray(products)) {
            throw new TypeError('products is not an array');
        }

        for (const product of products) {
            const { productID, qnt } = product;
            await executeQuery(sqlMeta, [newOrderId, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status]);
        }

        res.status(201).send('Order and order meta created successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
});


app.post('/order', async (req, res) => {
    const sessionUserId = 2; 
    const { products, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status } = req.body;

    try {
        const userCheckQuery = 'SELECT id FROM user_details WHERE (email = ? OR phoneNumber = ?) AND id = ?';
        const userCheckResults = await executeQuery(userCheckQuery, ['test@gmail.com', '6788996543', sessionUserId]);

        if (userCheckResults.length === 0) {
            return res.status(401).send('Unauthorized: Session user does not match provided ID');
        }

        const insertOrderQuery = 'INSERT INTO `order` (uID) VALUES (?)';
        const orderResult = await executeQuery(insertOrderQuery, [sessionUserId]);
        const newOrderId = orderResult.insertId;

        const sqlMeta = 'INSERT INTO order_meta (orderID, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        if (!Array.isArray(products)) {
            throw new TypeError('products is not an array');
        }

        for (const product of products) {
            const { productID, qnt } = product;
            await executeQuery(sqlMeta, [newOrderId, productID, qnt, fullname, mobilenumber, houseno, area, landmark, pincode, towncity, state, country, status]);
        }

        res.status(201).send('Order and order meta created successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/store', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM stores');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/category', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM category');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/subcategory', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM subcategory');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/sub_subcategory', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM sub_subcategory');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/products', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM products');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/blogcategory', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM blogcat');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/blogpost', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM blogpost');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/user', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM user_details');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/product', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM products');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/order', async (req, res) => {
    try {
        const results = await executeQuery('SELECT order_meta.*, `order`.*, products.* FROM order_meta INNER JOIN `order` ON order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/orders/:orderID', async (req, res) => {
    const orderID = req.params.orderID;

    try {
        const results = await executeQuery('SELECT order_meta.*, `order`.*, products.* FROM order_meta INNER JOIN `order` ON order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID WHERE `order_meta`.orderID = ?', [orderID]);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    };

});
app.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    let sql;

    switch (type) {
        case 'store':
            sql = 'SELECT * FROM stores WHERE id = ?';
            break;
        case 'category':
            sql = 'SELECT * FROM category WHERE id = ?';
            break;
        case 'subcategory':
            sql = 'SELECT * FROM subcategory WHERE id = ?';
            break;
        case 'sub_subcategory':
            sql = 'SELECT * FROM sub_subcategory WHERE id = ?';
            break;
        case 'products':
            sql = 'SELECT * FROM products WHERE id = ?';
            break;
        case 'blogcategory':
            sql = 'SELECT * FROM blogcat WHERE id = ?';
            break;
        case 'blogpost':
            sql = 'SELECT * FROM blogpost WHERE id = ?';
            break;
        case 'user':
            sql = 'SELECT * FROM user_details WHERE id = ?';
            break;
        case 'order':
            sql = 'SELECT order_meta.*, `order`.*, products.* FROM order_meta INNER JOIN `order` ON order_meta.orderID = `order`.id INNER JOIN products ON products.id = order_meta.productID WHERE products.id = ? AND order_meta.orderID = ?';
            break;
        default:
            return res.status(400).send('Invalid type parameter');
    }

    try {
        const results = await executeQuery(sql, [id]);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/user', async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await executeQuery('INSERT INTO user_details (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, phoneNumber]);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing request');
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
            await executeQuery(sql, [name, email, hashedPassword, phoneNumber]);
            res.status(201).send('User created successfully');
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).send('Error processing request');
        }
    } else if (type === 'login') {
        const { email, phoneNumber, password } = req.body;

        if (!id || (!email && !phoneNumber) || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sql = 'SELECT * FROM user_details WHERE (email = ? OR phoneNumber = ?) AND id = ?';
        try {
            const results = await executeQuery(sql, [email || null, phoneNumber || null, id]);

            if (results.length === 0) {
                return res.status(401).send('Invalid email/phone or password');
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).send('Invalid email/phone or password');
            }

            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.phoneNumber = user.phoneNumber;

            res.status(200).send('Login successful');
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Server error');
        }
    } else {
        res.status(400).send('Invalid type parameter');
    }
});

app.delete('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    let sql;

    switch (type) {
        case 'store':
            sql = 'DELETE FROM stores WHERE id = ?';
            break;
        case 'category':
            sql = 'DELETE FROM category WHERE id = ?';
            break;
        case 'subcategory':
            sql = 'DELETE FROM subcategory WHERE id = ?';
            break;
        case 'sub_subcategory':
            sql = 'DELETE FROM sub_subcategory WHERE id = ?';
            break;
        case 'products':
            sql = 'DELETE FROM products WHERE id = ?';
            break;
        case 'blogcategory':
            sql = 'DELETE FROM blogcat WHERE id = ?';
            break;
        case 'blogpost':
            sql = 'DELETE FROM blogpost WHERE id = ?';
            break;
        default:
            return res.status(400).send('Invalid type parameter');
    }

    try {
        await executeQuery(sql, [id]);
        res.status(200).send('Entity deleted successfully');
    } catch (error) {
        console.error('Error deleting entity:', error);
        res.status(500).send('Error deleting entity');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send('Could not log out');
        } else {
            res.status(200).send('Logout successful');
        }
    });
});


const homeRoutes = require('./routes/homeroutes');
const Adminrouter = require('./routes/Adminroutes');
const Storeroutes = require('./routes/Storeroutes');
const categoryroutes = require('./routes/categoryroutes');
const subcategoryroutes = require('./routes/subcategoryroutes');
const sub_subcategoryroutes = require('./routes/sub_subcategoryroutes');
const Productroutes = require('./routes/Productroutes');
const blogcategoryroutes = require('./routes/blogcategoryroutes');
const blogpostroutes = require('./routes/blogpostroutes');

app.use('/', homeRoutes);
app.use('/', Adminrouter);
app.use('/', Storeroutes); 
app.use('/', categoryroutes); 
app.use('/', subcategoryroutes); 
app.use('/', sub_subcategoryroutes); 
app.use('/', Productroutes); 
app.use('/', blogcategoryroutes); 
app.use('/', blogpostroutes);

const assetsPath = path.join(__dirname, 'assets');
app.use('/assets', express.static(assetsPath));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
