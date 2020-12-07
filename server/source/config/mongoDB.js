const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        db: 'mongodb://mongodb:27017/email-server'
    },
    production: {
        db: 'mongodb://mongodb:27017/email-server'
    }
}; 

module.exports = config[env];
