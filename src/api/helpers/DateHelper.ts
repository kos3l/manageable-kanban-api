import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export class DateHelper {
  static getDateDifferenceInDays(firstDate: Date, secondDate: Date) {
    return dayjs(firstDate).diff(secondDate, "day");
  }

  static getDateFromStartOf(date: Date, start: dayjs.OpUnitType) {
    const startTime = dayjs(date).utc(true).startOf(start).toDate();
    return startTime;
  }

  static isDateAftereDate(date1: Date, date2: Date) {
    return dayjs(date1).utc(true).isAfter(date2);
  }
}
