export type Address = {
  street: string;
  city: string;
  zipcode: string;
  state: string;
};

export type Addresses = {
  [key: string]: Address;
};

export type Args = {
  username: string;
};

export type SaveAddressArgs = {
  username: string;
  address: Address;
};
