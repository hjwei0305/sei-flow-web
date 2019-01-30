/**
 * @Description:高级查询表单
 * @Author: CHEHSHUANG
 * @Date: 2018/11/9
 */
import React, {Component} from "react"
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Modal, Radio, Row, Select, Switch} from "antd"
import SelectWithService from "../SelectWithService";
import SearchTable from "../SearchTable";
import UploadFile from '../UploadFile'
import TreeSelectWithService from '../TreeSelectWithService'
import moment from 'moment';

const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16}
}

class AdvanceSearchModal extends Component {
    handleSearch = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.props.setVisible(false);
                this.props.handleSearch(values)
            }
        })
    }
    handleCancel = () => {
        this.props.setVisible(false)
    }
    getFormItems = () => {
        //获取表单项配置formConfig、每行显示的列个数rowColNum
        const {formConfig,rowColNum=2} = this.props;
        if (formConfig) {
            let colSpan = Math.ceil(24/rowColNum),rowNum = Math.ceil(formConfig.length / rowColNum);
            let rowList = [];
            for (let i = 0; i < rowNum; i++) {
                let colList = [];
                if(i===(rowNum-1)){
                    for (let j = i*rowColNum; j < formConfig.length; j++) {
                        const item = formConfig[j];
                        let col = this.getColItem(item,colSpan);
                        colList.push(col);
                    }
                }else{
                    for (let j = 0; j < rowColNum; j++) {
                        const item = formConfig[i*rowColNum+j];
                        let col = this.getColItem(item,colSpan);
                        colList.push(col);
                    }
                }
                let row = (<Row key={i} gutter={6}> {colList} </Row>);
                rowList.push(row)
            }
            return rowList;
        } else {
            return null;
        }
    }
    getColItem = (item,colSpan) => {
        const {getFieldDecorator} = this.props.form;
        return (
            <Col key={item.name} span={item.colSpan||colSpan}>
                <Form.Item
                    {...(item.formItemLayout||formItemLayout)}
                    label={item.label}
                >
                    { getFieldDecorator(item.name,{...this.getDecoratorProps(item)})(this.getComponent(item))}
                </Form.Item>
            </Col>
        );
    }
    getDecoratorProps= (item)=>{
        let decoratorProps = {};
        let initValue = item.initialValue||"";
        if(item.type === 'datePicker'&&initValue){
            initValue = moment(initValue,item.props.format||"YYYY-MM-DD")
        }
        if(item.rules&&item.validator){
            item.rules.push({
                validator: (rules,value,callback)=>{item.validator(rules,value,callback,this.props.form)}
            });
        }
        if(item.type==="switch"||item.type==="checkbox"){
            decoratorProps.valuePropName =  'checked';
        }
        decoratorProps.initialValue = initValue;
        decoratorProps.rules = item.rules?item.rules:'';
        return decoratorProps;
    }
    getComponent = (item) => {
        if(!item.props.style){
            item.props.style = {width:"100%"};
        }else if(!item.props.style.width){
            item.props.style = {...item.props.style, width:"100%"};
        }
        switch (item.type) {
            case 'selectWithService':
                if (item.props.params) {
                    let params = {}
                    let key = Object.keys(item.props.params)[0];
                    params['' + key] = this.props.form.getFieldValue(item.props.params[key]);
                    return <SelectWithService  {...{...item.props, params}}/>;
                } else {
                    return <SelectWithService  {...item.props}/>;
                }
            case 'searchTable':
                return <SearchTable {...item.props} />;
            case 'treeSelect':
                return <TreeSelectWithService {...item.props}/>;
            case 'select':
                return (
                    <Select {...item.props} >
                        {item.data ? item.data.map(value =>
                            <Select.Option key={value.value} value={value.value}>{value.text}</Select.Option>
                        ) : null}
                    </Select>);
            case 'radioGroup':
                return (
                    <Radio.Group {...item.props}>
                        {item.children ? item.children.map((value, index, array) => (
                            <Radio key={value.value} value={value.value}>{value.text}</Radio>
                        )) : null}
                    </Radio.Group>);
            case 'datePicker':
                return <DatePicker {...item.props}/>;
            case 'switch':
                return <Switch {...item.props}/>;
            case 'inputNumber':
                return <InputNumber {...item.props}/>;
            case 'checkbox':
                return <Checkbox {...item.props}> {item.children || null}</Checkbox>;
            case "textArea":
                return <Input.TextArea {...item.props}/>;
            case 'upload':
                return <UploadFile {...item.props}/>;
            default:
                return <Input {...item.props}/>;
        }
    }

    render() {
        const {afterClose, visible,rowColNum,modalWidth,modalTitle} = this.props;
        return (
            <Modal
                className={"advanceSearchModal"}
                title={modalTitle||"高级查询"}
                width={modalWidth||600}
                maskClosable={false}
                visible={visible}
              //  afterClose={afterClose}
                onOk={this.handleSearch}
                onCancel={this.handleCancel}
            >
                <Form>
                    {this.getFormItems(rowColNum)}
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(AdvanceSearchModal);
