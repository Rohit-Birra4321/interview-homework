import { getAddress, saveAddress } from "./address/address";
import { Address, Args, SaveAddressArgs } from "./address/types";
import { getNearEarthObjects } from "./nasa/nasa";
import { NearEarthObjectFeed, NearEarthObjectsArgs } from "./nasa/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any, _info: any): Address => {
      return getAddress(parent, args, context);
    },
    nearEarthObjects: (parent: any, args: NearEarthObjectsArgs, context: any, _info: any): Promise<NearEarthObjectFeed> => {
      return getNearEarthObjects(parent, args, context);
    },
  },
  Mutation: {
    saveAddress: (parent: any, args: SaveAddressArgs, context: any, _info: any): Address => {
      return saveAddress(parent, args, context);
    },
  },
};
