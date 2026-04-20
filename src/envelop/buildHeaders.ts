import type { Plugin } from '@envelop/core';
import { v4 as uuid } from 'uuid';
import { GraphQLError, getOperationAST } from 'graphql';
import { ContextType } from '../types';

export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onContextBuilding({ context, extendContext }) {
      const requestId = uuid();
      const client = (context as any).request?.headers.get('client') ?? '';
      if (!client) {
        throw new GraphQLError('Missing required header: client');
      }
      extendContext({ requestId, client });
    },
    onExecute({ args }) {
      const context = args.contextValue as ContextType;
      if (context.client === 'strata') {
        const operation = getOperationAST(args.document, args.operationName);
        if (operation?.operation === 'mutation') {
          throw new GraphQLError('Mutations are not allowed for strata clients');
        }
      }
      return {
        onExecuteDone({ result, setResult }) {
          const requestId = (args.contextValue as ContextType).requestId;
          setResult({ ...result, extensions: { ...((result as any).extensions ?? {}), metadata: { requestId } } });
        },
      };
    },
  };
};
