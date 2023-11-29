import config from '../../../consts/config';
import * as fetchAdminModule from '../../api/fetchApi';
import { getLoginAdmin } from './getLoginAdmin';

jest.mock('./fetchAdmin');

const mockFetchAdmin = fetchAdminModule.fetchApi as jest.MockedFunction<typeof fetchAdminModule.fetchApi>;

describe('getLoginAdmin', () => {
  const adminAccessToken = 'testToken';
  const adminData = { id: 1, name: 'Admin' };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return admin data when request is successful', async () => {
    mockFetchAdmin.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ admin: adminData }),
    } as Response);

    const result = await getLoginAdmin(adminAccessToken);

    expect(result).toEqual({ admin: adminData });
    expect(mockFetchAdmin).toHaveBeenCalledWith(config.backendUrl + config.getAdminUrl.replace('{id}', ''), {
      method: 'GET',
      headers: {
        Authorization: config.tokenType + adminAccessToken,
        'Content-Type': 'application/json',
      },
    });
  });
});
