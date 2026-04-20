import { parse } from 'graphql';
import fs from 'fs';
import path from 'path';
import { executor } from '../exectuor';

const filePath = path.join(__dirname, '../../data/addresses.json');
const clientHeader = { headers: { client: 'test-client' } };

let originalData: string;

beforeAll(() => {
  originalData = fs.readFileSync(filePath, 'utf-8');
});

afterAll(() => {
  fs.writeFileSync(filePath, originalData);
});

describe('saveAddress', () => {
  test('Success', async () => {
    const mutation = `
      mutation SaveAddress($username: String!, $address: AddressInput!) {
        saveAddress(username: $username, address: $address) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const variables = {
      username: 'bob',
      address: {
        street: '789 New St.',
        city: 'Newtown',
        zipcode: '12345',
        state: 'TX',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: clientHeader,
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          saveAddress: {
            street: '789 New St.',
            city: 'Newtown',
            zipcode: '12345',
            state: 'TX',
          },
        },
      })
    );
  });

  test('Error on duplicate username', async () => {
    const mutation = `
      mutation SaveAddress($username: String!, $address: AddressInput!) {
        saveAddress(username: $username, address: $address) {
          street
        }
      }
    `;

    const variables = {
      username: 'jack',
      address: {
        street: '999 Dupe St.',
        city: 'Dupetown',
        zipcode: '00000',
        state: 'CA',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: clientHeader,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Address already exists for this username',
          }),
        ]),
      })
    );
  });
});
