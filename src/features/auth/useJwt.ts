/* eslint-disable eqeqeq */
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import jwt_decode from 'jwt-decode';
import config from '../../consts/config';

interface DecodedJwtToken {
  exp: number;
}

const setAdminToken = (value: string) => {
  setCookie(config.storageAdminTokenKeyName, value);
};

const getAdminToken = () => {
  return getCookie(config.storageAdminTokenKeyName);
};

const setAgencyToken = (value: string) => {
  setCookie(config.storageAgencyTokenKeyName, value);
};

const getAgencyToken = () => {
  return getCookie(config.storageAgencyTokenKeyName);
};

const isAdminLoggedIn = () => {
  if (getCookie(config.storageAdminTokenKeyName)) {
    let token = getAdminToken().toString();
    if (!isValidJwt(token)) {
      return false;
    }
    let decodedToken = jwt_decode<DecodedJwtToken>(token);
    if (!isValidJwtExp) {
      return false;
    }
    return true;
  } else return false;
};

const isAgencyLoggedIn = () => {
  if (getCookie(config.storageAgencyTokenKeyName)) {
    let token = getAgencyToken().toString();
    if (!isValidJwt(token)) {
      return false;
    }
    let decodedToken = jwt_decode<DecodedJwtToken>(token);
    if (!isValidJwtExp(decodedToken)) {
      return false;
    }
    return true;
  } else return false;
};

const AdminLogout = () => {
  if (isAdminLoggedIn) {
    deleteCookie(config.storageAdminTokenKeyName);
  }
};

const AgencyLogout = () => {
  if (isAgencyLoggedIn) {
    deleteCookie(config.storageAgencyTokenKeyName);
  }
};

const isValidJwt = (token: string) => {
  try {
    jwt_decode(token, { header: true });
    jwt_decode(token);
  } catch (e) {
    return false;
  }
  return true;
};

const isValidJwtExp = (decodedToken: DecodedJwtToken) => {
  try {
    const milliSecond = 1000;
    if (decodedToken.exp < Date.now() / milliSecond) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};

export {
  setAdminToken,
  getAdminToken,
  setAgencyToken,
  getAgencyToken,
  isAdminLoggedIn,
  isAgencyLoggedIn,
  AdminLogout,
  AgencyLogout,
};
