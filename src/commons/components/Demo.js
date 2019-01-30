/**
 * @description demo
 * @author 李艳
 * @date 2018.1.06
 */

import React, {Component} from 'react';
import httpUtils from "../utils/FeatchUtils";
import {baseAuthor, baseUrl} from "../../configs/DefaultConfig";
import {cache} from "../utils/CommonUtils";
import {Button} from "antd";

class Demo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData:[]
        };
    }
    componentWillMount() {
        this.testNetwork();
        this.initTableData()
    }
    testNetwork=()=>{
    };

    initTableData=()=> {
        let tableData = [{name: 'zhangsan', age: '18'},{name:'lisi',age:'20'}]
        this.setState({tableData})
    } ;
    componentWillReceiveProps(nextProp) {
    }

    componentDidMount() {
    }
    render() {
        const col=[
            {name:'姓名',dataIndex:'name',key:'name'},
            {name:'年龄',dataIndex:'age',key:'age'}];
        return  (
            <div style={{marginLeft: "30%", marginRight: "30%"}}>
                <div style={{textAlign:"center",color:"red",marginTop:20}}>Demo</div>
                {/*<SimpleTable*/}
                    {/*rowKey={'name'}*/}
                    {/*columns={col}*/}
                    {/*data={this.state.tableData}/>*/}
                <Button onClick={()=>{
                    httpUtils.get(baseUrl+"/appModule/findAll",{});
                }}>接口测试</Button>
                <Button onClick={()=>{
                    httpUtils.get(baseAuthor+"/appModule/listAll","");
                }}>接口测试2</Button>
            </div>
        );
    }
}



export default Demo
