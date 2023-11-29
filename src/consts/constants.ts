export const HTTP_STATUS_CODE: {
  OK: number;
  FOUND: number;
  BAD_REQUEST: number;
  UNAUTHORIZED: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  INTERNAL_SERVER_ERROR: number;
} = {
  OK: 200,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ADMIN: {
  ADMIN_ID_NAME__MIN_LENGTH: number;
  ADMIN_ID_NAME__MAX_LENGTH: number;
  ADMIN_ID_NAME__REGEX: RegExp;
  PASSWORD__MIN_LENGTH: number;
  PASSWORD__MAX_LENGTH: number;
  PASSWORD__REGEX: RegExp;
  ROLE__LIST: string[];
  VALIDITY__LIST: string[];
} = {
  ADMIN_ID_NAME__MIN_LENGTH: 3,
  ADMIN_ID_NAME__MAX_LENGTH: 30,
  ADMIN_ID_NAME__REGEX: /^[a-zA-Z0-9]+$/u,
  PASSWORD__MIN_LENGTH: 8,
  PASSWORD__MAX_LENGTH: 30,
  PASSWORD__REGEX: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@?%&±=&]).+$/u,
  ROLE__LIST: ['ADMIN', 'EDITOR', 'OPERATOR'],
  VALIDITY__LIST: ['0', '1'],
};

export const AGENCY: {
  AGENCY_ID_NAME__MIN_LENGTH: number;
  AGENCY_ID_NAME__MAX_LENGTH: number;
  AGENCY_ID_NAME__REGEX: RegExp;
  PASSWORD__MIN_LENGTH: number;
  PASSWORD__MAX_LENGTH: number;
  PASSWORD__REGEX: RegExp;
  VALIDITY_DATE__REGEX: RegExp;
  SHOP_NAME__MAX_LENGTH: number;
  AGENCY_URL_KEY__MAX_LENGTH: number;
  AGENCY_URL_KEY__REGEX: RegExp;
  POSTAL_CODE__MAX_LENGTH: number;
  POSTAL_CODE__REGEX: RegExp;
  ADDRESS__MAX_LENGTH: number;
  ADDRESS__REGEX: RegExp;
  PHONE_NUM__MAX_LENGTH: number;
  PHONE_NUM__REGEX: RegExp;
  EMAIL__MAX_LENGTH: number;
  EMAIL__REGEX: RegExp;
  AGENCY_NAME__MAX_LENGTH: number;
  AGENCY_NAME__REGEX: RegExp;
  ACCOUNT_NUM__MAX_LENGTH: number;
  ACCOUNT_NUM__REGEX: RegExp;
  ACCOUNT_NAME__MAX_LENGTH: number;
  ACCOUNT_NAME__REGEX: RegExp;
  DEPOSIT_TYPE__LIST: string[];
} = {
  AGENCY_ID_NAME__MIN_LENGTH: 3,
  AGENCY_ID_NAME__MAX_LENGTH: 30,
  AGENCY_ID_NAME__REGEX: /^[a-zA-Z0-9]+$/, //半角英数のみ
  PASSWORD__MIN_LENGTH: 8,
  PASSWORD__MAX_LENGTH: 30,
  PASSWORD__REGEX: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@?%&±=&]).+$/, //半角英字、半角数字、記号「!@?%&±=&」のみ
  VALIDITY_DATE__REGEX: /^\d{4}-\d{2}-\d{2}$/, //日付「0000-00-00」のみ
  SHOP_NAME__MAX_LENGTH: 100,
  AGENCY_URL_KEY__MAX_LENGTH: 8,
  AGENCY_URL_KEY__REGEX: /^[a-zA-Z0-9]+$/, // 半角英数のみ
  POSTAL_CODE__MAX_LENGTH: 8,
  POSTAL_CODE__REGEX: /^$|^\d{3}-\d{4}$/, // 空文字か「000-0000」のみ
  ADDRESS__MAX_LENGTH: 250,
  ADDRESS__REGEX: /^[^\u{10000}-\u{10FFFF}]*$/u, // 空文字かサロゲートペア以外の文字列
  PHONE_NUM__MAX_LENGTH: 15,
  PHONE_NUM__REGEX: /^$|(^0\d\d?-?\d{4}-?\d{4}$)|^$/, // 空文字か電話番号(ハイフンあり、なし両方可)
  EMAIL__MAX_LENGTH: 200,
  EMAIL__REGEX: /^$|^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/, //空文字かメールアドレス(ユーザー名部分に _ と + を許可し、ドメイン部分に - を許可)
  AGENCY_NAME__MAX_LENGTH: 50,
  AGENCY_NAME__REGEX: /^[^\u{10000}-\u{10FFFF}]*$/u, // 空文字かサロゲートペア以外の文字列
  ACCOUNT_NUM__MAX_LENGTH: 7,
  ACCOUNT_NUM__REGEX: /^([0-9]{7})?$/, // 空文字か7桁の数字
  ACCOUNT_NAME__MAX_LENGTH: 200,
  ACCOUNT_NAME__REGEX: /^[\u30A1-\u30FE\uFF08\uFF09]*$/, // 空文字か全角カナと括弧のみの文字列
  DEPOSIT_TYPE__LIST: ['0', '1'], // 0:普通 1:当座
};

export const CONTACT: {
  NAME__MAX_LENGTH: number;
  EMAIL__MAX_LENGTH: number;
  EMAIL__REGEX: RegExp;
  EMAIL2__MAX_LENGTH: number;
  EMAIL2__REGEX: RegExp;
  PHONE_NUM__MAX_LENGTH: number;
  PHONE_NUM__REGEX: RegExp;
  TITLE__MAX_LENGTH: number;
  PLACE_NAME__MAX_LENGTH: number;
  CONTENT__MAX_LENGTH: number;
} = {
  NAME__MAX_LENGTH: 20,
  EMAIL__MAX_LENGTH: 200,
  EMAIL__REGEX: /^$|^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/, //空文字かメールアドレス(ユーザー名部分に _ と + を許可し、ドメイン部分に - を許可)
  EMAIL2__MAX_LENGTH: 200,
  EMAIL2__REGEX: /^$|^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/, //空文字かメールアドレス(ユーザー名部分に _ と + を許可し、ドメイン部分に - を許可)
  PHONE_NUM__MAX_LENGTH: 15,
  PHONE_NUM__REGEX: /^$|(^0\d\d?-?\d{4}-?\d{4}$)|^$/,
  TITLE__MAX_LENGTH: 100,
  PLACE_NAME__MAX_LENGTH: 20,
  CONTENT__MAX_LENGTH: 5000,
};
