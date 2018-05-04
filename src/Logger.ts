import * as winston from 'winston';

// todo loglevel from env

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      formatter: (options) => {
        return `[${new Date().toString().slice(16, 24)}] ${winston.config.colorize(options.level, options.level.toUpperCase())} ${options.message || ''}`;
      }
    })
  ]
})