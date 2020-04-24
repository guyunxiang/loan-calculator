// 定义贷款类型
export const loanOptions = [
  {
    value: 1,
    label: '商业贷款',
  },
  {
    value: 2,
    label: '公积金贷款',
  },
  {
    value: 3,
    label: '商业+公积金组合贷款'
  },
];

export const DEFAULTRATE1 = 4.9;
export const DEFAULTRATE2 = 3.25;

// 计算利率选项
const getRateOptions = (defaultValue = DEFAULTRATE1) => [0.7, 0.8, 0.83, .85, .88, .9, .95, 1, 1.05, 1.1, 1.2, 1.3, 1.4, 1.5].map((item) => {
  let label, value = (defaultValue * item).toFixed(4);
  if (item < 1) {
    label = `${`${item}`.split('.')[1]}折（${value}%）`;
  } else if (item === 1){
    label = `基准利率（${defaultValue.toFixed(4)}%）`;
  } else {
    label = `${item}倍（${value}%）`;
  }
  return {
    label,
    value: +value,
  }
});

// 商业贷款利率
export const rate1Options = getRateOptions(DEFAULTRATE1);

// 公积金贷款利率
export const rate2Options = getRateOptions(DEFAULTRATE2);
