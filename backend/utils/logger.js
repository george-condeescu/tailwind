import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info', // Nivelul minim de logare (info, warn, error)
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack trace-ul dacă e eroare
    format.splat(),
    format.json(), // Format JSON pentru a fi ușor de citit de alte programe
  ),
  defaultMeta: { service: 'user-service' }, // Adaugă metadate la fiecare log
  transports: [
    // 1. Scrie erorile într-un fișier separat cu rotație
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    // 2. Scrie toate logurile (info, warn, error) într-un fișier combinat
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// Dacă nu suntem în producție, logăm și în consolă cu culori
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

export default logger;
