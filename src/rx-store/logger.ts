import { injectable } from 'inversify';
import moment from 'moment';
import * as Winston from 'winston';

import { IAction } from './interfaces';

const winston = require('winston');

@injectable()
export class Logger {
  readonly logger: Winston.Logger;
  length: number = null;

  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.align(),
      transports: [
        new winston.transports.Console({
          timestamp: () => {
            return moment().format('LTS');
          },
          json: false,
          level: 'info'
        })
      ]
    });
    if (process.env.LOG_LENGTH) {
      try {
        this.length = parseInt(process.env.LOG_LENGTH, 10);
      } catch (error) {
        console.error('cannot parse log length');
      }
    }
  }

  error(msg) {
    this.logger.error(msg);
  }

  dispatch(action: IAction) {
    const { type, payload } = action;
    const message =
      type + ' --> ' + JSON.stringify(payload).substr(0, this.length || 500);
    if (process.env.ENVIRONMENT !== 'production') {
      if (type.includes('Success')) console.info('🏆 ' + message);
      else if (type.includes('Error')) console.info('☠️ ' + message);
      else console.info(`🚀 Dispatch: ${message}`);
    }
  }

  waiting({ type, payload }: IAction) {
    if (process.env.ENVIRONMENT !== 'production') {
      const message =
        type + ' --> ' + JSON.stringify(payload).substr(0, this.length || 500);
      console.info(`⏳ Effect: ${message}`);
    }
  }

  getLogger() {
    return this.logger;
  }
}
