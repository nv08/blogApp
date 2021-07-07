const winston = require('winston')

const logConfiguration = {
    transports:
        new winston.transports.File({
        filename: 'debug/blogApp.log',
        format:winston.format.combine(
            winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
            winston.format.align(),
            winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
        )}),
    };

module.exports =  logger = winston.createLogger(logConfiguration)