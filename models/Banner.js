const db = require('../config/database');

class Banner {
    static async add(BannerData) {
        const { storeId, title, image } = BannerData;
        const BannerQuery = `
            INSERT INTO banner (
                storeId, title, image
            ) VALUES (?, ?, ?)
        `;
        const BannerValues = [storeId, title, image];
        try {
            console.log('Insert Banner Query:', BannerQuery);
            console.log('Insert Banner Data:', BannerValues);
            const [BannerResult] = await db.query(BannerQuery, BannerValues);
            console.log('Banner Insertion Result:', BannerResult);
            return BannerResult;
        } catch (error) {
            console.error('Banner Insert Error:', error);
            throw error;
        }
    }
}

module.exports = Banner;
