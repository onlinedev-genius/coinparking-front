import moment from 'moment';

// 値の変換を行うクラス
class FieldValueTransformer {
  // ブール値を整数値(String)に変換する "0" => false, "1" => true
  static booleanToIntegerString(value: boolean): string {
    return value ? '1' : '0';
  }

  // 整数値(String)をブール値に変換する false => "0", true => "1"
  static integerStringToBoolean(value: string): boolean {
    return value === '1' ? true : false;
  }

  // 日時(String)を日付(String)に変換する 2023-10-23T00:00:00Z => 2023-10-23
  static datetimeStringToDateString(value: string): string | null {
    let fmtedValue = null;
    if (value !== 'null') {
      fmtedValue = moment(value).format('YYYY-MM-DD');
    }
    return fmtedValue;
  }

  // 日付(String)を日時(String)に変換する 2023-10-23 => 2023-10-23T00:00:00
  static dateStringToDatetimeString(value: string): string | null {
    let fmtedValue = null;
    if (value !== 'null') {
      fmtedValue = moment.utc(value).format('YYYY-MM-DDTHH:mm:ss') + 'Z'; //※最後のZはタイムゾーンを表すため計算後に付与する
    }
    return fmtedValue;
  }
}

export { FieldValueTransformer };
