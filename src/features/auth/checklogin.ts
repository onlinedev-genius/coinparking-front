/**
 * Admin Access Tokenが無い場合は強制Logoutを実行しLogin画面へリダイレクトする関数
 * @param {checkAdminAccessTokenAndRedirectInterface} params - 関数のパラメータ
 * @returns {object | void} リダイレクト情報またはvoid
 */
export function checkAdminAccessTokenAndRedirect({
  adminAccessToken,
  redirectUrl,
  redirectPage,
}: checkAdminAccessTokenAndRedirectInterface): { redirect: { destination: string; permanent: boolean } } | void {
  if (!adminAccessToken) {
    return redirectPage({ redirectUrl: redirectUrl });
  }
}

interface checkAdminAccessTokenAndRedirectInterface {
  adminAccessToken: string;
  redirectUrl: string;
  redirectPage: (params: redirectAdminLoginPageInterface) => { redirect: { destination: string; permanent: boolean } };
}

interface redirectAdminLoginPageInterface {
  redirectUrl: string;
}
