import humps from 'humps';
import { AdminInterface } from '../../../interfaces/admin';

/**
 * ログイン中の管理者の情報を取得するAPIを呼び出す関数
 * @param {getLoginAdminInterface} params - API呼び出しに必要なパラメータ
 * @returns {Promise<{ admin: AdminInterface; redirect?: never } | { admin?: never; redirect: { destination: string; permanent: boolean } }>} - 管理者情報またはリダイレクト情報
 * @throws {Error} - 401 Unauthorizedエラーまたはデータ取得失敗時にエラーをスロー
 */
export async function getLoginAdmin({adminAccessToken, getAdminUrl, tokenType, redirectUrl, fetchApi, checkAdminAccessTokenAndRedirect, redirectPage}:getLoginAdminInterface): Promise<
  { admin: AdminInterface; redirect?: never } | { admin?: never; redirect: { destination: string; permanent: boolean } }
> {
  // Admin Access Tokenが無い場合は強制Logoutを実行しLogin画面へリダイレクト
  const redirect = checkAdminAccessTokenAndRedirect({ adminAccessToken: adminAccessToken, redirectUrl: redirectUrl, redirectPage: redirectPage } as checkAdminAccessTokenAndRedirectInterface);
  if (redirect) {
    return redirect;
  }

  try {
    const res = await fetchApi({
      url: getAdminUrl,
      options: {
        method: 'GET',
        headers: {
          Authorization: tokenType + adminAccessToken,
          'Content-Type': 'application/json',
        },
      },
    });    
    const admin = humps.camelizeKeys((await res.json()).admin) as AdminInterface;
    return { admin };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      //401 Unauthorized
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch data: ' + error.message);
  }
}

interface getLoginAdminInterface {
  adminAccessToken: string;
  getAdminUrl: string;
  tokenType: string;
  redirectUrl: string;
  fetchApi: (params: FetchApiInterface) => Promise<Response>;
  checkAdminAccessTokenAndRedirect: (options: checkAdminAccessTokenAndRedirectInterface) => { redirect: { destination: string; permanent: boolean } } | void;
  redirectPage: (params: redirectAdminLoginPageInterface) => { redirect: { destination: string; permanent: boolean } };
}

interface FetchApiInterface {
  url: string;
  options: RequestInit;
}

interface checkAdminAccessTokenAndRedirectInterface {
  adminAccessToken: string;
  redirectUrl: string;
}

interface redirectAdminLoginPageInterface {
  redirectUrl: string;
}

class UnauthorizedError extends Error {}
