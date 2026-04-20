import { parse } from 'graphql';
import { executor } from '../exectuor';

const query = `
  query GetAddress($username: String!) {
    address(username: $username) {
      street
    }
  }
`;

const mutation = `
  mutation SaveAddress($username: String!, $address: AddressInput!) {
    saveAddress(username: $username, address: $address) {
      street
    }
  }
`;

const mutationVariables = {
  username: 'testuser',
  address: { street: '1 Test St.', city: 'Testville', zipcode: '11111', state: 'NY' },
};

describe('client header validation', () => {
  test('Rejects request when client header is missing', async () => {
    const result = await executor({
      document: parse(query),
      variables: { username: 'jack' },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Missing required header: client',
          }),
        ]),
      })
    );
  });

  test('Allows query when client is strata', async () => {
    const result = await executor({
      document: parse(query),
      variables: { username: 'jack' },
      extensions: { headers: { client: 'strata' } },
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          address: expect.objectContaining({ street: '123 Street St.' }),
        }),
      })
    );
  });

  test('Blocks mutation when client is strata', async () => {
    const result = await executor({
      document: parse(mutation),
      variables: mutationVariables,
      extensions: { headers: { client: 'strata' } },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Mutations are not allowed for strata clients',
          }),
        ]),
      })
    );
  });
});
