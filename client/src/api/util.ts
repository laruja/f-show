
export const getLast1Month = (day: Date) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  let y = 0, m = 0;
  switch (month) {
    case 0:
      m = month + 11;
      y = year - 1;
      break;
    default:
      m = month - 1;
      y = year;
      break;
  }
  return new Date(y, m, date);
};
/**
 * 获取本周末周五的日期
 * @param day 
 * @returns 
 */
export const getWeekDayBefore = (day: Date) => {
  const week = day.getDay();
  if (week === 0) {
    // 星期日
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - 2);
  } else if (week === 6) {
    // 星期六 
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
  } else {
    return day;
  }
}
/**
 * 近3月日期
 */
export const getLast3Month = (day: Date) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  let y = 0, m = 0;
  switch (month) {
    case 0:
    case 1:
    case 2:
      // case 3:
      m = month + 9;
      y = year - 1;
      break;
    default:
      m = month - 3;
      y = year;
      break;
  }
  return new Date(y, m, date);
};
export const getLast6Month = (day: Date) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  let y = 0, m = 0;
  switch (month) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      // case 6:
      m = month + 6;
      y = year - 1;
      break;
    default:
      m = month - 6;
      y = year;
      break;
  }
  return new Date(y, m, date);
};

export const getLastNYear = (day: Date, n: number) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  if (n === 1 || n === 3 || n === 5) {
    return new Date(year - n, month, date);
  } else {
    throw new Error('超出预定期限[1,3,5]');
  }
};


