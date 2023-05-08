import dayjs from "dayjs";
export class DateHelper {
  static getDateDifferenceInDays(firstDate: Date, secondDate: Date) {
    return dayjs(firstDate).diff(secondDate, "day");
  }
}
