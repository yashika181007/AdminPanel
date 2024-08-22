const db = require('../config/database');
const Banner = require('../models/Banner');
const { upload } = require('../config/multer');

const addbanner = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const [stores] = await db.query('SELECT id, store_name FROM stores');

            res.render('addbanner', { stores });
        } catch (error) {
            console.error('Error fetching stores:', error);
            res.status(500).json({ error: 'An internal server error occurred while fetching stores' });
        }
    } else if (req.method === 'POST') {
        upload(req, res, async function (err) {
            if (err) {
                console.error('Error uploading image:', err);
                return res.status(500).json({ error: 'An error occurred while uploading the image' });
            }
            try {
                console.log('Request body:', req.body);
                console.log('Uploaded File:', req.file);

                const { storeId, title } = req.body;
                const image = req.files.map(file => file.filename);

                if (!storeId || !title || !image) {
                    return res.status(400).json({ error: 'Fields cannot be empty!' });
                }

                const BannerData = {
                    storeId: storeId.join(','),
                    title,
                    image: image.join(',')
                };

                const BannerResult = await Banner.add(BannerData);

                res.status(201).json({ message: 'Banner added successfully', Banner: BannerResult });
            } catch (error) {
                console.error('Error adding Banner:', error);
                res.status(500).json({ error: 'An internal server error occurred while adding the Banner' });
            }
        });
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};

module.exports = {
    addbanner
};
