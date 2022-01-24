import * as winston from 'winston'
const { combine, timestamp, splat, colorize, printf, } = winston.format

export const logger = winston.createLogger({
    level: 'info',
    format: combine(
        colorize(),
        timestamp(),
        splat(),
        printf(
            info => `${info.timestamp} [${info.level}]: ${info.message}`
        )
    ),
    transports: [
        new winston.transports.Console()
    ]
})
