require('dotenv').config();

const env = {
	REDIS_URL: process.env.REDIS_URL || 'http://localhost',
	PORT: process.env.PORT || 3003,
	DARKSKY_API_KEY: process.env.DARKSKY_API_KEY || '90216cfa22837a8c803cfa270a49a438' ,
};
module.exports = env;