import { HTTP_STATUS_CODE } from '../../consts/constants';

/**
 * APIエンドポイントに対してフェッチを行う関数
 * @param {fetchApiInterface} params - 関数のパラメータ
 * @returns {Promise<Response>} - レスポンスデータ
 * @throws {UnauthorizedError} - 認証エラーの場合
 */
export async function fetchApi({
  url,
  options,
}:fetchApiInterface): Promise<Response> {
  const res = await fetch(url, options);

  if (!res.ok) {
    if (res.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
      throw new UnauthorizedError('Unauthorized access');
    }
    throw new Error('Failed to fetch: ' + res.statusText);
  }

  return res;
}

interface fetchApiInterface {
  url: string;
  options: RequestInit;
}

export class UnauthorizedError extends Error {}
