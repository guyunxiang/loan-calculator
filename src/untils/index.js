/**
 * 截断小数点后几位
 * @param  {Number} number  要截断的数字
 * @param  {Number} tofixed 截断位数，默认 2 位
 * @param  {Boolean}rounded 是否启用四舍五入
 * @return {Number}         截断后的数字
 */
export const toFixed = (number, tofixed = 2, rounded = true) => {
  if (isNaN(number)) { return 0 }
  // 对照建行账单发现是保留小数点后两位，第三位四舍五入
  if (rounded) {
    return number.toFixed(2);
  } else {
    // 舍去小数点后第三位数字
    return Math.floor(number * Math.pow(10, tofixed) ) / Math.pow(10, tofixed);
  }
}

/**
 * 计算多少个月之后的日期
 * @param  {Number} nums 月数
 * @param  {String} date 初始日期，默认 2018/7/18
 * @return {Date}        返回日期对象
 */
export const getMonthPlusDate = (nums, date = '2018/7/18') => {
  const dateTime = new Date(date);
  let year = dateTime.getFullYear(),
    month = dateTime.getMonth() + 1,
    day = dateTime.getDate();
  // 多出的年数
  let years = parseInt(nums / 12, 10);
  // 多出的月数
  const months = nums%12;
  if (month + months <= 12) {
    return new Date(`${year + years}/${month + months}/${day}`);
  } else {
    return new Date(`${year + years + 1}/${month + months - 12}/${day}`);
  }
}

/**
 * 计算两个日期之间的月数差
 * @param  {[type]} startDate 开始日期
 * @param  {[type]} endDate   结束日期
 * @return {[type]}           [description]
 */
export const getMonthDiff = (startDate, endDate) => {
  const startDateInfo = new Date(startDate);
  const endDateInfo = new Date(endDate);
  const startYear = startDateInfo.getFullYear(),
  startMonth = startDateInfo.getMonth() + 1;
  const endYear = endDateInfo.getFullYear(),
  endMonth = endDateInfo.getMonth() + 1;
  let diffYear = endYear - startYear;
  let diffMonth;
  if (endMonth < startMonth) {
    diffYear -= 1;
    diffMonth = endMonth + 12 - startMonth;
  } else {
    diffMonth = endMonth - startMonth;
  }
  return diffMonth + diffYear * 12;
}
