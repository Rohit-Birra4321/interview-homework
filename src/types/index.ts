import { Logger } from '../logger';

export type ContextType = {
  requestId: string;
  client: string;
  logger: Logger;
};
