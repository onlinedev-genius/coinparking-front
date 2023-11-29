import React from 'react';
import { NextPage, NextPageContext } from 'next';
import { HTTP_STATUS_CODE } from '../consts/constants';

interface Props {
  statusCode: number;
}
const Error: NextPage<Props> = ({ statusCode }) => {
  return <div>{statusCode}</div>;
};

Error.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res
    ? res.statusCode
    : err
    ? err.statusCode ?? HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
    : HTTP_STATUS_CODE.NOT_FOUND;
  return { statusCode };
};

export default Error;
