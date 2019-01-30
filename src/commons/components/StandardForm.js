/**
 * @description 通过配置生成表单
 * @author 刘松林
 * @date 2018.12.19
 */
import React from 'react';
import SearchTable from './SearchTable'
import { Form, Radio,InputNumber, Row, Col, Input, DatePicker} from 'antd';
import SelectWithService from './SelectWithService';
import TreeSelectWithService from './TreeSelectWithService'
import UploadFile from './UploadFile'
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';

class StandardForm extends React.Component {

    getItem = (item,form) => {
        switch (item.type){
            case 'select':
                if(item.children.params){
                    let params={}
                    let key = Object.keys(item.children.params)[0];
                    params[''+key] = form.getFieldValue(item.children.params[key])
                    return <SelectWithService  config={item.children} params={params}/>;
                }else{
                    return <SelectWithService  config={item.children} />;
                }
                
            case 'searchTable':
                return <SearchTable config={item.children} multiple={item.multiple} />;
            case 'treeSelect':
                return <TreeSelectWithService config={item.children}  treeCheckable={item.treeCheckable}/>
            case 'datePicker':
                return <DatePicker style={{width:'100%'}}/>
            case 'radio':
                let options=[...item.children];
                let newOpetions=options.map(function(value, index, array) {
                    return <Radio key={value.value} value={value.value}>{value.text}</Radio>
                })
                return  <RadioGroup >
                            {newOpetions}
                        </RadioGroup>
            case 'inputNumber':
                return <InputNumber  style={{width:'100%'}} formatter={item.formatter} min={item.min} max={item.max} precision={item.precision}/>
            case 'textArea':
                return <Input.TextArea rows={4} maxLength={500}/>
            case 'upload':
                return <UploadFile entityId={item.entityId?form.getFieldValue(item.entityId):null}/>
            default: return <Input autoComplete="off" maxLength={128}/>
        }
    }
    
    render(){
        const {form, editData,doubleLine,trebleLine, fieldsConfig,formType} = this.props;
        const editDataTemp = (formType==='edit'?editData:null)
        const { getFieldDecorator } = form;
        const span = doubleLine?12:trebleLine?8:24
        return (
            <Row gutter={12}>
                {fieldsConfig.map(item=>{
                    if(item instanceof Array){
                        return (<Col key={item.code+'_col'} span={span} style={{display: item.hidden?'none':'block'}}>
                                    <FormItem key={item} labelCol={{span:6}} wrapperCol={{ span: 16}} label={item[0].name}>
                                        {item.map((subItem ,i)=>{
                                            return (<Col key={subItem.code} style={{paddingRight:(i===item.length-1)?0:8}} span={24/item.length}>
                                                <FormItem>
                                                    {getFieldDecorator(subItem.code,{
                                                        initialValue:editDataTemp?(subItem.type === 'datePicker'?editDataTemp[subItem.code]?moment(editDataTemp[subItem.code],dateFormat):null:editDataTemp[subItem.code]):subItem.defaultValue,
                                                        rules: subItem.rules?subItem.rules:'',
                                                    })(this.getItem(subItem,form))}
                                                </FormItem>
                                            </Col>)
                                        })}
                                    </FormItem>
                                </Col>)
                    }else{
                        return (<Col key={item.code+'_col'} span={span} style={{display: item.hidden?'none':'block'}}>
                                <FormItem key={item.code} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label={item.name}>
                                    {getFieldDecorator(item.code,{
                                        initialValue:editDataTemp?(item.type === 'datePicker'?editDataTemp[item.code]?moment(editDataTemp[item.code],dateFormat):null:editDataTemp[item.code]):item.defaultValue,
                                        rules: item.rules?item.rules:'',
                                    })(this.getItem(item,form))}
                                </FormItem>
                            </Col>
                        )
                    }
                })}
             </Row>
        )
    }
}

StandardForm = Form.create()(StandardForm)


export default StandardForm;
