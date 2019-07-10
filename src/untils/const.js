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

// 商业贷款利率
export const rate1Options = [
  {
    label: '基准利率（4.9000%）',
    value: 4.9,
  },
  {
    label: '1.1倍（5.3900%）',
    value: 5.39,
  },
];

// 公积金贷款利率
export const rate2Options = [
  {
    label: '基准利率（3.2500%）',
    value: 3.25,
  },
  {
    label: '1.1倍（3.5750%）',
    value: 3.575,
  },
];
