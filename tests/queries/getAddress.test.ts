import { parse } from 'graphql';
import { executor } from '../exectuor';

const clientHeader = { headers: { client: 'test-client' } };

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
      extensions: clientHeader,
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          address: {
            street: '123 Street St.',
            city: 'Sometown',
            zipcode: '43215',
          },
        },
      })
    );
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
      extensions: clientHeader,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'No address found in getAddress resolver',
          }),
        ]),
      })
    );
  });

  test('Response includes requestId in metadata', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
      extensions: clientHeader,
    }) as any;

    expect(result.extensions?.metadata?.requestId).toEqual(expect.any(String));
  });
});
