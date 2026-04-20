import { getAddress, saveAddress } from "./address/address";
import { Address, Args, SaveAddressArgs } from "./address/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any, _info: any): Address => {
      return getAddress(parent, args, context);
    },
  },
  Mutation: {
    saveAddress: (parent: any, args: SaveAddressArgs, context: any, _info: any): Address => {
      return saveAddress(parent, args, context);
    },
  },
};
