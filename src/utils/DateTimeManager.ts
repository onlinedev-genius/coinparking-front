// 日付、日時、時刻の生成を行うクラス
const MONTH_LENGTH = 2;
const DATE_LENGTH = 2;

class DateTimeManager {
  // YYYY-MM-DD形式の現在日付を返す
  static nowKebabYYYYMMDD(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(MONTH_LENGTH, '0');
    const day = String(date.getDate()).padStart(DATE_LENGTH, '0');
    return `${year}-${month}-${day}`;
  }

  // YYYY-MM形式の現在日付を返す
  static nowKebabYYYYMM(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(MONTH_LENGTH, '0');
    return `${year}-${month}`;
  }
}

export { DateTimeManager };
