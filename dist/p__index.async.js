(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{EDuE:function(e,t,a){e.exports={normal:"normal___HWRKS"}},RXBc:function(e,t,a){"use strict";a.r(t);var n=a("jehZ"),l=a.n(n),r=(a("+L6B"),a("2/Rp")),s=(a("y8nQ"),a("Vl3Y")),m=(a("giR+"),a("fyUT")),o=(a("OaEy"),a("2fM7")),u=(a("5NDa"),a("5rEg")),i=a("q1tI"),c=a.n(i),d=a("MuoO"),p=a("EDuE"),h=a.n(p),E=u["a"].Group,y=o["a"].Option;class g extends c.a.Component{constructor(){super(...arguments),this.state={annualizedRate:"",tenThousandIncome:"",totalInterest:""},this.handleSubmit=(e=>{e.preventDefault(),this.props.form.validateFields((e,t)=>{e||(this.computeAnnualizedRate(t),this.computeTenThousandIncome(t))})}),this.computeAnnualizedRate=(e=>{var t=e.amount,a=e.date,n=e.dateType,l=e.dateAmount,r=t/a,s=l-r,m=s*a,o=0;"year"===n?o=365*a:"month"===n?o=a/12*365:"day"===n&&(o=a);var u=m/t/o*365*100;this.setState({annualizedRate:u.toFixed(2),totalInterest:m})}),this.computeTenThousandIncome=(e=>{var t=e.amount,a=e.date,n=e.dateType,l=e.dateAmount,r=t/a,s=l-r;console.log(s);var m=0;"year"===n?m=1*s:"month"===n?m=12*s:"day"===n&&(m=365*s);var o=m/365/(t/1e4);console.log(m,o),this.setState({tenThousandIncome:o.toFixed(2)})})}render(){var e=this.state,t=e.annualizedRate,a=e.tenThousandIncome,n=e.totalInterest,u={labelCol:{xs:{span:24},sm:{span:8}},wrapperCol:{xs:{span:24},sm:{span:8}}},i=this.props.form.getFieldDecorator;return c.a.createElement("div",{className:h.a.normal},c.a.createElement("h3",null,"\u8d37\u6b3e\u5e74\u5316\u6536\u76ca\u7387\uff0c\u4e07\u5206\u6536\u76ca\u8ba1\u7b97\u5668"),c.a.createElement("br",null),c.a.createElement(s["a"],l()({},u,{onSubmit:this.handleSubmit}),c.a.createElement(s["a"].Item,{label:"\u8d37\u6b3e\u91d1\u989d"},i("amount",{reules:[{required:!0,message:"\u8bf7\u8f93\u5165\u8d37\u6b3e\u91d1\u989d"}]})(c.a.createElement(m["a"],{size:"large",style:{width:"100%"},formatter:e=>`${e}`.replace(/\B(?=(\d{3})+(?!\d))/g,","),min:0}))),c.a.createElement(s["a"].Item,{label:"\u8fd8\u6b3e\u671f\u6570"},c.a.createElement(E,{compact:!0},i("date",{reules:[{required:!0,message:"\u8bf7\u8f93\u5165\u8fd8\u6b3e\u671f\u6570"}]})(c.a.createElement(m["a"],{size:"large",style:{width:"80%"},min:0})),i("dateType",{reules:[{required:!0,message:"\u8bf7\u8f93\u5165\u8fd8\u6b3e\u671f\u6570"}],initialValue:"month"})(c.a.createElement(o["a"],{size:"large",style:{width:"20%"}},c.a.createElement(y,{value:"year"},"\u5e74"),c.a.createElement(y,{value:"month"},"\u6708"),c.a.createElement(y,{value:"day"},"\u65e5"))))),c.a.createElement(s["a"].Item,{label:"\u6bcf\u671f\u8fd8\u6b3e\u91d1\u989d"},i("dateAmount",{reules:[{required:!0,message:"\u8bf7\u8f93\u5165\u6bcf\u671f\u8fd8\u6b3e\u91d1\u989d"}]})(c.a.createElement(m["a"],{size:"large",style:{width:"100%"},min:0,precision:2}))),c.a.createElement(s["a"].Item,null,c.a.createElement(r["a"],{size:"large",type:"primary",htmlType:"submit",style:{width:"100%"}},"\u8ba1\u7b97"))),c.a.createElement("div",{style:{textAlign:"left"}},n?c.a.createElement("h4",null,"\u603b\u5229\u606f\uff1a",c.a.createElement("span",null,n.toFixed(2))):null,t?c.a.createElement("h4",null,"\u5e74\u5316\u6536\u76ca\u7387\uff1a",c.a.createElement("span",null,t,"%")):null,a?c.a.createElement("div",null,c.a.createElement("h4",null,"\u4e07\u5206\u6536\u76ca\uff1a",c.a.createElement("span",null,a," \u5143")),c.a.createElement("p",null,"(\u5373\u501f\u8d37 1 \u4e07\u5143\u6bcf\u5929\u8fd8\u6b3e ",a," \u5143)")):null))}}t["default"]=Object(d["connect"])()(s["a"].create()(g))}}]);