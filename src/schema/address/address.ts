import fs from 'fs';
import path from 'path';
import { Addresses, Address, Args, SaveAddressArgs } from './types';
import { GraphQLError } from 'graphql';

const filePath = path.join(__dirname, '../../../data/addresses.json');

const readAddresses = (): Addresses => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Addresses;
};

export const getAddress = (_: any, args: Args, context: any): Address => {
  context.logger.info('getAddress', { message: 'Enter resolver' });
  const addresses = readAddresses();
  const address = addresses[args.username];
  if (address) {
    context.logger.info('getAddress', { message: 'Returning address' });
    return address;
  }
  context.logger.error('getAddress', { message: 'No address found' });
  throw new GraphQLError('No address found in getAddress resolver');
};

export const saveAddress = (_: any, args: SaveAddressArgs, context: any): Address => {
  context.logger.info('saveAddress', { message: 'Enter resolver' });
  const addresses = readAddresses();
  if (addresses[args.username]) {
    context.logger.error('saveAddress', { message: 'Address already exists' });
    throw new GraphQLError('Address already exists for this username');
  }
  addresses[args.username] = args.address;
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  context.logger.info('saveAddress', { message: 'Address saved' });
  return args.address;
};
