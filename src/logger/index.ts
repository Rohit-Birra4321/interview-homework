import winston from 'winston';

export class Logger {
  private winston: any;
  requestId: string = '';
  client: string = '';
  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console()],
    });
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  setClient(client: string) {
    this.client = client;
  }

  info(message: string, meta?: object) {
    this.winston.info(message, { requestId: this.requestId, client: this.client, ...meta });
  }

  error(message: string, meta?: object) {
    this.winston.error(message, { requestId: this.requestId, client: this.client, ...meta });
  }

  warn(message: string, meta?: object) {
    this.winston.warn(message, { requestId: this.requestId, client: this.client, ...meta });
  }
}
