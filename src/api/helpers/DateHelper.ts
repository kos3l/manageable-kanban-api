import dayjs from "dayjs";
export class DateHelper {
  static getDateDifferenceInDays(firstDate: Date, secondDate: Date) {
    return dayjs(firstDate).diff(secondDate, "day");
  }

  static getDateFromStartOf(date: Date, start: dayjs.OpUnitType) {
    return dayjs(date).startOf(start).toDate();
  }

  static isDateAftereDate(date1: Date, date2: string) {
    return dayjs(date2).isBefore(dayjs());
  }
}
