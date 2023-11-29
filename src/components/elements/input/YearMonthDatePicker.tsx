/* eslint-disable eqeqeq */
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import ja from 'date-fns/locale/ja';
import 'react-datepicker/dist/react-datepicker.css';
registerLocale('ja', ja);

type pageProps = {
  width: number;
  value: string;
  onChange: any;
  className: string;
};
const YearMonthDatePicker: React.FC<pageProps> = (props) => {
  const handleChange = (param: Date) => {
    props.onChange(param);
  };
  return (
    <>
      <label className='datepicker_wrapper' style={{ width: props.width }}>
        <DatePicker
          onChange={(selectedDate) => {
            handleChange(selectedDate);
          }}
          locale='ja'
          selected={new Date(props.value)}
          showMonthYearPicker
          dateFormat='yyyy-MM'
        />
      </label>
    </>
  );
};

export default YearMonthDatePicker;
