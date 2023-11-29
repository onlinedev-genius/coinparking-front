/**
 * ページリダイレクトを行う関数
 * @param {RedirectAdminLoginPageInterface} params - 関数のパラメータ
 * @returns {object} リダイレクト情報
 */
export function redirectPage({ redirectUrl }: RedirectAdminLoginPageInterface): {
  redirect: { destination: string; permanent: boolean };
} {
  return {
    redirect: {
      destination: redirectUrl,
      permanent: false,
    },
  };
}

interface RedirectAdminLoginPageInterface {
  redirectUrl: string;
}
