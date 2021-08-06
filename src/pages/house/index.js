import React from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Radio,
  Select,
  Input,
  DatePicker,
  Button,
  List,
  Table,
  Tabs,
  Divider,
  Collapse,
  Empty,
} from 'antd';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  toFixed,
  getMonthPlusDate,
  getMonthDiff,
} from '../../untils';
import {
  loanOptions,
  rate1Options,
  rate2Options,

  DEFAULTRATE1,
  DEFAULTRATE2,
} from '../../untils/const';
import styles from './index.less';

const { Option } = Select;
const { MonthPicker } = DatePicker;
const { TabPane } = Tabs;

class Loan extends React.Component {

  state = {
    // 贷款类型
    type: 1,
    // 商贷金额
    amount1: new BigNumber(0),
    // 公积金贷款金额
    amount2: new BigNumber(0),
    // 贷款期限
    date: new BigNumber(0),
    // 商贷利率
    rate1: new BigNumber(1),
    // 公积金贷款利率
    rate2: new BigNumber(1),
    // 起始日期
    startDate: new Date(),

    // 提前还款类型
    prePayType: 1,
    // 提前还款日期
    prePayStartDate: '',
    // 提前还款金额
    prePayAmount: new BigNumber(0),
  }

  getDefaultValues = () => {
    let defaultValues = {
      type: 1,
      amount1: 0,
      amount2: 0,
      date: 0,    // 30
      rate1: DEFAULTRATE1,   // 5.39
      rate2: DEFAULTRATE2,   // 3.25
      startDate: moment(new Date()).format('YYYY/MM/DD'),
    };
    try {
      const localData = JSON.parse(window.localStorage.getItem('defaultValues'));
      const {
        type,
        amount1,
        amount2,
        date,
        rate1,
        rate2,
        startDate,
      } = localData;
      if (localData) {
        defaultValues = {
          ...localData,
          type,
          amount1: +amount1,
          amount2: +amount2,
          date: +date,
          rate1: +rate1,
          rate2: +rate2,
          startDate,
        };
      }
    } catch (e) {
    }
    return defaultValues;
  }

  componentDidMount() {
    const { type } = this.getDefaultValues();
    this.setState({ type });
  }

  // 计算贷款
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) { return }
      // console.log(107, DEFAULTVALUES, values);
      window.localStorage.setItem('defaultValues', JSON.stringify(Object.assign({}, this.getDefaultValues(), values)));
      this.setState({
        type: values.type,
        amount1: new BigNumber(values.amount1).multipliedBy(10000),
        amount2: new BigNumber(values.amount2).multipliedBy(10000),
        date: new BigNumber(values.date).multipliedBy(12),
        rate1: new BigNumber(values.rate1).shiftedBy(-2),
        rate2: new BigNumber(values.rate2).shiftedBy(-2),
        startDate: moment(values.startDate).format('YYYY/MM/DD'),
      });
    });
  }

  // 计算提前还款
  handleSubmitPrePay = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) { return }
      window.localStorage.setItem('defaultValues', JSON.stringify(Object.assign({}, this.getDefaultValues(), values)));
      this.setState({
        prePayType: values.prePayType,
        prePayDate: new BigNumber(values.prePayDate).multipliedBy(12),
        prePayStartDate: moment(values.prePayStartDate).format('YYYY/MM'),
        prePayAmount: new BigNumber(values.prePayAmount).multipliedBy(10000),
      });
    });
  }

  // 获取等额本金月供明细
  getLoanDetail = (amount, interest, capital, diff, startDate) => {
    let list = [];
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    // 判断是否金额正确性
    if (!amount.toNumber()) {
      return {
        capitalTotal,
        interestTotal,
        list,
      };
    }
    list.push({
      date: startDate,
      value: 0,
      interest: 0,
      amount: amount.toFixed(2),
    });
    // i: 利息，j: 月数，k: 本金，d:
    for (let i = interest, j = 1, k = amount.minus(capital); k.toNumber() > -1; i = i.minus(diff), j++, k = k.minus(capital)) {
      // 累加总利息
      interestTotal = interestTotal.plus(i);
      // 累加还款总额
      capitalTotal = capitalTotal.plus(capital.plus(i));
      // 添加列表数据
      list.push({
        date: moment(getMonthPlusDate(j, startDate)).format('YYYY/MM/DD'),
        value: capital.plus(i),
        interest: i,
        amount: k,
      });
    }
    return {
      capitalTotal,
      interestTotal,
      list,
    };
  }

  /**
   * 计算还贷信息
   * @param  {Number} amount    贷款总额
   * @param  {Number} date      贷款期数
   * @param  {Number} rate      贷款利率
   * @return {Object}           计算结果
   */
  getLoanData = (amount, date, rate, startDate) => {
    // 等额本息
    const debxData = this.getDEBXData(amount, date, rate);
    const debjData = this.getDEBJData(amount, date, rate, startDate);
    return {
      debxData,
      debjData,
    };
  }

  /**
   * 计算等额本息月供数据
   * @param  {[type]} amount [description]
   * @param  {[type]} date   [description]
   * @param  {[type]} rate   [description]
   * @return {[type]}        [description]
   */
  getDEBXData = (amount, date, rate) => {
    // 总月数
    let monthNums = new BigNumber(0);
    // 每月还款本金
    let capital = new BigNumber(0);
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    if (amount) {
      // 还款期数
      monthNums = date;
      // R*(1+R)^N
      let a = rate.dividedBy(12).multipliedBy(rate.dividedBy(12).plus(1).exponentiatedBy(monthNums));
      // ((1+R)^N)-1
      let b = rate.dividedBy(12).plus(1).exponentiatedBy(monthNums).minus(1);
      // amount*a/b
      capital = amount.multipliedBy(a.dividedBy(b));
      // 月供 * 月数
      capitalTotal = capital.multipliedBy(monthNums);
      // 总还款额 - 本金
      interestTotal = capitalTotal.minus(amount);
    }
    return {
      capital,
      capitalTotal,
      interestTotal,
    };
  }

  /**
   * 计算等额本金月供数据
   * @param  {[type]} amount [description]
   * @param  {[type]} date   [description]
   * @param  {[type]} rate   [description]
   * @return {[type]}        [description]
   */
  getDEBJData = (amount, date, rate, startDate) => {
    // 总月数
    let monthNums = date;
    // 每月还款本金
    let capital = amount.dividedBy(monthNums);
    // 首月利息
    let interest = amount.multipliedBy(rate.dividedBy(12));
    // 每月递减金额
    let diff = capital.multipliedBy(rate.dividedBy(12));
    // 月供明细
    const {
      // 总还款额
      capitalTotal,
      // 总还款利息
      interestTotal,
      list
    } = this.getLoanDetail(amount, interest, capital, diff, startDate);
    return {
      capital,
      interest,
      diff,
      capitalTotal,
      interestTotal,
      list,
    };
  }

  // 获取等额本金利息差
  getDEBJInterestDiff = ({ ...props }, { ...prePayParams }) => {
    const { date, startDate } = props;
    const type = +this.props.form.getFieldValue('prePayType');
    // 计算原贷款，剩余未还的利息
    const getOldLoanData = () => {
      const amount = type === 1 ? props.amount1 : props.amount2;
      const rate = type === 1 ? props.rate1 : props.rate2;
      const {
        list,
        interestTotal,
      } = this.getDEBJData(amount, date, rate, startDate);
      // 已还的利息
      let hadBackInterest = new BigNumber(0);
      // 已还期数
      let hadBackDate = new BigNumber(getMonthDiff(props.startDate, prePayParams.startDate));
      // 计算已还利息总额
      for (let i = 0; i < hadBackDate.toNumber(); i++) {
        hadBackInterest = hadBackInterest.plus(list[i].interest);
      }
      // 剩余未还的利息
      return {
        interestTotal,
        hadBackInterest,
        hadBackDate,
      };
    }
    // 计算提前还款后，需要还的利息总额
    const getNewLoanData = () => {
      const amount = type === 1 ? prePayParams.amount1 : prePayParams.amount2;
      const rate = type === 1 ? prePayParams.rate1 : prePayParams.rate2;
      const {
        interestTotal,
      } = this.getDEBJData(amount, prePayParams.date, rate, prePayParams.startDate);
      return {
        interestTotal
      };
    }
    return {
      hadBackDate: getOldLoanData().hadBackDate,
      hadBackInterest: getOldLoanData().hadBackInterest,
      debjInterestDiff: getOldLoanData().interestTotal.minus(getOldLoanData().hadBackInterest).minus(getNewLoanData().interestTotal),
    }
  }

  // 渲染等额本息计算结果
  renderTabPan1({ ...props }) {
    const {
      type,
      amount1,
      amount2,
      date,
      rate1,
      rate2,
    } = props;

    // 渲染商贷信息
    const renderSDList = (amount, date, rate) => {
      const {
        debxData: {
          capital,
          capitalTotal,
          interestTotal,
        }
      } = this.getLoanData(amount, date, rate);
      return (
        <List
          header={<h3>商业贷款</h3>}
          dataSource={[
            {
              label: '每月月供(元)',
              value: toFixed(capital.toNumber()),
            },
            {
              label: '支付总利息(元)',
              value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
            },
            {
              label: '总还款额(元)',
              value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
            },
          ]}
          style={{ textAlign: 'left' }}
          renderItem={item => (
            <List.Item className={styles.listItem}>
              <span>{item.label}: </span><strong>{item.value}</strong>
            </List.Item>
          )}
        />
      )
    }

    // 渲染公积金贷款信息
    const renderGJJDList = (amount, date, rate) => {
      const {
        debxData: {
          capital,
          capitalTotal,
          interestTotal,
        }
      } = this.getLoanData(amount, date, rate);
      return (
        <List
          header={<h3>公积金贷款</h3>}
          dataSource={[
            {
              label: '每月月供(元)',
              value: toFixed(capital.toNumber()),
            },
            {
              label: '支付总利息(元)',
              value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
            },
            {
              label: '总还款额(元)',
              value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
            },
          ]}
          style={{ textAlign: 'left' }}
          renderItem={item => (
            <List.Item className={styles.listItem}>
              <span>{item.label}: </span><strong>{item.value}</strong>
            </List.Item>
          )}
        />
      )
    }

    // 渲染组合贷款信息
    const renderTotalList = () => {
      const loanData1 = this.getLoanData(amount1, date, rate1);
      const loanData2 = this.getLoanData(amount2, date, rate2);
      let capital, capitalTotal, interestTotal;
      try {
        capital = (loanData1.debxData.capital).plus(loanData2.debxData.capital);
        capitalTotal = (loanData1.debxData.capitalTotal).plus(loanData2.debxData.capitalTotal);
        interestTotal = (loanData1.debxData.interestTotal).plus(loanData2.debxData.interestTotal);
      } catch (e) {
      }
      return (
        <List
          header={<h3>组合贷款</h3>}
          dataSource={[
            {
              label: '月供组成(商业贷)',
              value: toFixed(loanData1.debxData.capital.toNumber()),
            },
            {
              label: '月供组成(公积金)',
              value: toFixed(loanData2.debxData.capital.toNumber()),
            },
            {
              label: <strong>月供总计(元)</strong>,
              value: toFixed(capital.toNumber()),
            },
            {
              label: '利息(商业贷)',
              value: new BigNumber(toFixed(loanData1.debxData.interestTotal.toNumber())).toFormat(),
            },
            {
              label: '利息(公积金)',
              value: new BigNumber(toFixed(loanData2.debxData.interestTotal.toNumber())).toFormat(),
            },
            {
              label: <strong>利息总计(元)</strong>,
              value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
            },
            {
              label: '总还款额(本金+利息)',
              value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
            },
          ]}
          style={{ textAlign: 'left' }}
          renderItem={item => (
            <List.Item className={styles.listItem}>
              <span>{item.label}: </span><strong>{item.value}</strong>
            </List.Item>
          )}
        />
      )
    }

    if (!date.toNumber()) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
    }

    return (
      <div className={styles.tabpan}>
        {type === 1 ? renderSDList(amount1, date, rate1) : null}
        {type === 2 ? renderGJJDList(amount2, date, rate2) : null}
        {type === 3 ? renderTotalList() : null}
      </div>
    )
  }

  /**
   * 渲染等额本金计算结果
   * @param  {Number} amount    贷款总额
   * @param  {Number} date      贷款期数
   * @param  {Number} rate      贷款利率
   * @param  {DateString} startDate 起始日期
   * @return {[type]}           [description]
   */
  renderTabPan2({ ...props }) {
    const {
      type,
      amount1,
      amount2,
      date,
      rate1,
      rate2,
      startDate,

      prePayStartDate,
    } = props;

    const columns = [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        fixed: document.body.clientWidth < 768,
      },
      {
        title: '月供',
        dataIndex: 'value',
        key: 'value',
        align: 'right',
        render: (value) => toFixed(new BigNumber(value).toNumber())
      },
      {
        title: '利息',
        dataIndex: 'interest',
        key: 'interest',
        align: 'right',
        render: (value) => toFixed(new BigNumber(value).toNumber())
      },
      {
        title: '剩余贷款',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (value) => new BigNumber(toFixed(new BigNumber(value).toNumber())).toFormat(),
      }
    ];

    // 渲染商贷信息
    const renderSDList = (amount, date, rate) => {
      const {
        debjData: {
          capital,
          interest,
          diff,
          interestTotal,
          capitalTotal,
          list
        }
      } = this.getLoanData(amount, date, rate, startDate);
      return (
        <div>
          <List
            header={<h3>商业贷款</h3>}
            dataSource={[
              {
                label: '首月月供（元）',
                value: toFixed(capital.toNumber() + interest.toNumber()),
              },
              {
                label: '月供本金(元)',
                value: toFixed(capital.toNumber()),
              },
              {
                label: '首月利息(元)',
                value: toFixed(interest.toNumber()),
              },
              {
                label: '每月递减(元)',
                value: toFixed(diff),
              },
              {
                label: '支付总利息(元)',
                value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
              },
              {
                label: '总还款额(元)',
                value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
              },
            ]}
            style={{ textAlign: 'left' }}
            renderItem={item => (
              <List.Item className={styles.listItem}>
                <span>{item.label}: </span><strong>{item.value}</strong>
              </List.Item>
            )}
          />
          <br/>
          <Table
            size={document.body.clientWidth < 768 ? 'small' : 'default'}
            columns={columns}
            rowKey="date"
            dataSource={list}
            rowClassName={(record) => {
              if (new Date(record.date).getTime() > new Date(prePayStartDate).getTime()) {
                return 'disabled';
              }
            }}
          />
        </div>
      )
    }

    // 渲染公积金贷信息
    const renderGJJDList = (amount, date, rate) => {
      const {
        debjData: {
          capital,
          interest,
          diff,
          interestTotal,
          capitalTotal,
          list
        }
      } = this.getLoanData(amount, date, rate, startDate);
      return (
        <div>
          <List
            header={<h3>公积金贷款</h3>}
            dataSource={[
              {
                label: '首月月供（元）',
                value: toFixed(capital.toNumber() + interest.toNumber()),
              },
              {
                label: '月供本金(元)',
                value: toFixed(capital.toNumber()),
              },
              {
                label: '首月利息(元)',
                value: toFixed(interest.toNumber()),
              },
              {
                label: '每月递减(元)',
                value: toFixed(diff),
              },
              {
                label: '支付总利息(元)',
                value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
              },
              {
                label: '总还款额(元)',
                value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
              },
            ]}
            style={{ textAlign: 'left' }}
            renderItem={item => (
              <List.Item className={styles.listItem}>
                <span>{item.label}: </span><strong>{item.value}</strong>
              </List.Item>
            )}
          />
          <br/>
          <Table
            size={document.body.clientWidth < 768 ? 'small' : 'default'}
            columns={columns}
            rowKey="date"
            dataSource={list}
            rowClassName={(record) => {
              if (new Date(record.date).getTime() > new Date(prePayStartDate).getTime()) {
                return 'disabled';
              }
            }}
          />
        </div>
      )
    }

    // 渲染还贷总和信息
    const renderTotalList = () => {
      const sdData = this.getLoanData(amount1, date, rate1, startDate);
      const gjjdData = this.getLoanData(amount2, date, rate2, startDate);

      const capital = sdData.debjData.capital.plus(gjjdData.debjData.capital);
      const interest = sdData.debjData.interest.plus(gjjdData.debjData.interest);
      const diff = sdData.debjData.diff.plus(gjjdData.debjData.diff);
      const interestTotal = sdData.debjData.interestTotal.plus(gjjdData.debjData.interestTotal);
      const capitalTotal = sdData.debjData.capitalTotal.plus(gjjdData.debjData.capitalTotal);

      const list = [];
      for (let i = 0; i < sdData.debjData.list.length; i++) {
        list.push({
          date: sdData.debjData.list[i].date,
          value: new BigNumber(sdData.debjData.list[i].value).plus(gjjdData.debjData.list[i].value),
          sdValue: sdData.debjData.list[i].value,
          gjjdValue: gjjdData.debjData.list[i].value,
          interest: new BigNumber(sdData.debjData.list[i].interest).plus(gjjdData.debjData.list[i].interest),
          amount: new BigNumber(sdData.debjData.list[i].amount).plus(gjjdData.debjData.list[i].amount),
        });
      }

      return (
        <div>
          <List
            header={<h3>组合贷款</h3>}
            dataSource={[
              {
                label: '首月月供(元)',
                value: toFixed(capital.toNumber() + interest.toNumber()),
              },
              {
                label: '月供本金(元)',
                value: toFixed(capital.toNumber()),
              },
              {
                label: '首月利息(元)',
                value: toFixed(interest.toNumber()),
              },
              {
                label: '每月递减(元)',
                value: toFixed(diff),
              },
              {
                label: '支付总利息(元)',
                value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
              },
              {
                label: '总还款额(元)',
                value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
              },
            ]}
            style={{ textAlign: 'left' }}
            renderItem={item => (
              <List.Item className={styles.listItem}>
                <span>{item.label}: </span><strong>{item.value}</strong>
              </List.Item>
            )}
          />
          <br/>
          <Table
            size={document.body.clientWidth < 768 ? 'small' : 'default'}
            columns={[
              {
                title: '日期',
                dataIndex: 'date',
                key: 'date',
                align: 'center',
              },
              {
                title: '商贷月供',
                dataIndex: 'sdValue',
                key: 'sdValue',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '公积金月供',
                dataIndex: 'gjjdValue',
                key: 'gjjdValue',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '总月供',
                dataIndex: 'value',
                key: 'value',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '利息',
                dataIndex: 'interest',
                key: 'interest',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '剩余贷款',
                dataIndex: 'amount',
                key: 'amount',
                align: 'right',
                render: (value) => new BigNumber(toFixed(new BigNumber(value).toNumber())).toFormat(),
              }
            ]}
            rowKey="date"
            dataSource={list}
          />
        </div>
      )
    }

    if (!date.toNumber()) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
    }

    return (
      <div className={styles.tabpan}>
        {type === 1 ? renderSDList(amount1, date, rate1) : null}
        {type === 2 ? renderGJJDList(amount2, date, rate2) : null}
        {type === 3 ? renderTotalList() : null }
      </div>
    );
  }

  // 渲染计算结果
  renderResult() {
    const { Panel } = Collapse;
    const {
      amount1,
      amount2,
      date,
      rate1,
      rate2,
      startDate,

      prePayType,
      prePayDate,
      prePayStartDate,
      prePayAmount,
    } = this.state;

    // 未设置提前还款
    if (prePayAmount.toNumber() === 0) {
      return (
        <Tabs defaultActiveKey="1">
          <TabPane tab="等额本息" key="1">
            {this.renderTabPan1(this.state)}
          </TabPane>
          <TabPane tab="等额本金" key="2">
            {this.renderTabPan2(this.state)}
          </TabPane>
        </Tabs>
      )
    }

    // 定义提前还款参数
    const prePayParams = {
      rate1,
      rate2,
    };
    // 计算剩余贷款期数
    prePayParams.date = prePayDate;
    // 还贷类型
    prePayParams.type = prePayType;
    // 计算提前还款后的还贷初始日期
    prePayParams.startDate = `${prePayStartDate}/${startDate.split('/')[2]}`;
    // 计算提前还款后剩余的本金，剩余还款金额 = 贷款额 - 每月还款本金 * 已还期数 - 提前还款额
    // 贷款额 amount1
    // 每月还款本金 amount1.dividedBy(date)
    // 已还期数 new BigNumber(getMonthDiff(startDate, prePayStartDate))).minus(new BigNumber(1))
    // console.log(amount1.dividedBy(date).multipliedBy((new BigNumber(getMonthDiff(startDate, prePayStartDate))).minus(new BigNumber(1))).toNumber());
    if (prePayType === 1) {
      prePayParams.amount1 = amount1.minus(amount1.dividedBy(date).multipliedBy((new BigNumber(getMonthDiff(startDate, prePayStartDate))))).minus(prePayAmount);;
      prePayParams.amount2 = amount2;
    } else if (prePayType === 2) {
      prePayParams.amount1 = amount1;
      prePayParams.amount2 = amount2.minus(amount2.dividedBy(date).multipliedBy((new BigNumber(getMonthDiff(startDate, prePayStartDate))))).minus(prePayAmount);;
    }

    // 提前还款等额本金利息差
    const {
      hadBackDate,
      hadBackInterest,
      debjInterestDiff,
    } = this.getDEBJInterestDiff(this.state, prePayParams);

    return (
      <div>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="等额本息" key="1">
            {this.renderTabPan1(this.state)}
          </Panel>
        </Collapse>
        <br/>
        <Collapse defaultActiveKey={['2']}>
          <Panel header="等额本金" key="2">
            {this.renderTabPan2(this.state)}
          </Panel>
        </Collapse>
        <Divider>提前还款 - 分割线</Divider>
        <Card title="提前还款">
          <div className={styles.prePayResultContent}>
            <List
              header={<strong>剩余还款信息</strong>}
              dataSource={[
                {
                  label: '提前还款类型',
                  value: prePayType === 1 ? '商业贷款' : '公积金贷款',
                },
                {
                  label: '已还期数',
                  value: `${parseInt(hadBackDate.dividedBy(12).toNumber(), 10)}年${hadBackDate.modulo(12).toNumber()}月`,
                },
                {
                  label: '已还本金',
                  value: new BigNumber(toFixed(amount1.minus(prePayParams.amount1).minus(prePayAmount).toNumber())).toFormat(),
                },
                {
                  label: '剩余还贷期数',
                  value: `${parseInt(prePayParams.date.dividedBy(12).toNumber(), 10)}年${prePayParams.date.modulo(12).toNumber()}月`,
                },
                {
                  label: '剩余还贷金额',
                  value: new BigNumber(toFixed(prePayType === 1 ? prePayParams.amount1.toNumber() : prePayParams.amount2.toNumber())).toFormat(),
                },
                {
                  label: '等额本金已经还利息',
                  value: new BigNumber(toFixed(hadBackInterest.toNumber())).toFormat(),
                },
                {
                  label: '等额本金利息少还金额',
                  value: new BigNumber(toFixed(debjInterestDiff.toNumber())).toFormat(),
                }
              ]}
              style={{ textAlign: 'left' }}
              renderItem={item => (
                <List.Item className={styles.listItem}>
                  <span>{item.label}: </span><strong>{item.value}</strong>
                </List.Item>
              )}
            />
          </div>
        </Card>
        <br/>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="等额本息" key="1">
            {this.renderTabPan1(prePayParams)}
          </Panel>
        </Collapse>
        <br/>
        <Collapse defaultActiveKey={['2']}>
          <Panel header="等额本金" key="2">
            {this.renderTabPan2(prePayParams)}
          </Panel>
        </Collapse>
      </div>
    )
  }

  // 渲染房贷计算表单
  renderHouseLoanForm() {
    const {
      getFieldValue,
      getFieldDecorator
    } = this.props.form;
    const DEFAULTVALUES = this.getDefaultValues();
    const type = getFieldValue('type') || DEFAULTVALUES.type;

    return (
      <Form
        layout="vertical"
        onSubmit={this.handleSubmit}
      >
        <Form.Item label="贷款类型">
          {
            getFieldDecorator('type', {
              initialValue: DEFAULTVALUES.type,
            })(
              <Radio.Group>
                {
                  loanOptions.map((item) => (
                    <Radio key={item.value} value={item.value}>{item.label}</Radio>
                  ))
                }
              </Radio.Group>
            )
          }
        </Form.Item>
        {
          type !== 2 ? (
            <Form.Item label="商业贷款金额" required>
              {
                getFieldDecorator('amount1', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (+value <= 0) {
                          callback('请输入贷款金额!');
                        } else {
                          callback();
                        }
                      }
                    }
                  ],
                  initialValue: +DEFAULTVALUES.amount1,
                })(
                  <Input
                    type="number"
                    addonAfter="万元"
                  />
                )
              }
            </Form.Item>
          ) : null
        }
        {
          type !== 1 ? (
            <Form.Item label="公积金贷款金额" required>
              {
                getFieldDecorator('amount2', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (+value <= 0) {
                          callback('请输入贷款金额!');
                        } else {
                          callback();
                        }
                      }
                    }
                  ],
                  initialValue: +DEFAULTVALUES.amount2,
                })(
                  <Input
                    type="number"
                    addonAfter="万元"
                  />
                )
              }
            </Form.Item>
          ) : null
        }
        <Form.Item label="贷款年数" required>
          {
            getFieldDecorator('date', {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (+value <= 0) {
                      callback('请输入贷款年限');
                    } else if (`${value}`.indexOf('.') > -1){
                      callback('请输入整数!');
                    } else {
                      callback();
                    }
                  }
                }
              ],
              initialValue: +DEFAULTVALUES.date,
            })(
              <Input
                type="number"
                addonAfter="年数"
              />
            )
          }
        </Form.Item>
        {
          type !== 2 ? (
            <Form.Item label="商业贷款利率" required>
              {
                getFieldDecorator('rate1', {
                  initialValue: +DEFAULTVALUES.rate1,
                })(
                  <Select>
                    {
                      rate1Options.map((item) => (
                        <Option value={item.value} key={item.value}>{item.label}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </Form.Item>
          ) : null
        }
        {
          type !== 1 ? (
            <Form.Item label="公积金贷款利率" required>
              {
                getFieldDecorator('rate2', {
                  initialValue: +DEFAULTVALUES.rate2,
                })(
                  <Select>
                    {
                      rate2Options.map((item) => (
                        <Option value={item.value} key={item.value}>{item.label}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </Form.Item>
          ) : null
        }
        <Form.Item label="贷款通过日期" required>
          {
            getFieldDecorator('startDate', {
              initialValue: moment(DEFAULTVALUES.startDate),
            })(
              <DatePicker
                type="number"
                format="YYYY/MM/DD"
                placeholder="请选择贷款初始日期"
                style={{ width: '100%' }}
              />
            )
          }
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%' }}
          >
            计算月供
          </Button>
        </Form.Item>
      </Form>
    )
  }

  // 渲染房贷提前还款计算
  renderPreHouseLoanForm() {
    const {
      getFieldValue,
      getFieldDecorator,
    } = this.props.form;
    const { date, startDate } = this.state;
    if (!date.toNumber()) { return null }
    const DEFAULTVALUES = this.getDefaultValues();
    let prePayStartDate;
    try {
      let [year, month, day] = startDate.split('/');
      prePayStartDate = `${+year + 3}/${month}/${day}`;
    } catch (e) {
    }
    return (
      <div className={styles.prePayContent}>
        <Divider>提前还款 - 分割线</Divider>
        <h3>提前还款</h3>
        <Form
          layout="vertical"
          onSubmit={this.handleSubmitPrePay}
        >
          <Form.Item label="还贷类型">
            {
              getFieldDecorator('prePayType', {
                initialValue: getFieldValue('type') !== 3 ? getFieldValue('type') : 1,
              })(
                <Radio.Group>
                  {
                    loanOptions.filter((item) => item.value !== 3).map((item) => (
                      <Radio key={item.value} value={item.value}>{item.label}</Radio>
                    ))
                  }
                </Radio.Group>
              )
            }
          </Form.Item>
          <Form.Item label="日期" required>
            {
              getFieldDecorator('prePayStartDate', {
                initialValue: moment(prePayStartDate),
              })(
                <MonthPicker
                  placeholder="请选择提前还款日期"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment(this.state.startDate).endOf('day')}
                />
              )
            }
          </Form.Item>
          <Form.Item label="金额" required>
            {
              getFieldDecorator('prePayAmount', {
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (+value <= 0) {
                        callback('请输入提前还款金额！');
                      } else if (`${value}`.indexOf('.') > -1){
                        callback('请输入整数!');
                      } else {
                        callback();
                      }
                    }
                  }
                ],
                initialValue: +DEFAULTVALUES.prePayAmount || 10,
              })(
                <Input
                  type="number"
                  addonAfter="万元"
                />
              )
            }
          </Form.Item>
          <Form.Item label="贷款年数" required>
            {
              getFieldDecorator('prePayDate', {
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (+value <= 0) {
                        callback('请输入贷款年限!');
                      } else if (`${value}`.indexOf('.') > -1){
                        callback('请输入整数!');
                      } else {
                        callback();
                      }
                    }
                  }
                ],
                initialValue: DEFAULTVALUES.prePayDate || date.toNumber()/12 - 3,
              })(
                <Input
                  type="number"
                  addonAfter="年数"
                />
              )
            }
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              计算提前还款
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }

  render() {
    return (
      <div className={styles.house}>
        <h2>房贷计算器</h2>
        <Divider />
        <Row gutter={16}>
          <Col md={{ span: 8 }}>
            {this.renderHouseLoanForm()}
            {this.renderPreHouseLoanForm()}
          </Col>
          <Col md={{ span: 16 }}>
            {this.renderResult()}
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(Loan);
