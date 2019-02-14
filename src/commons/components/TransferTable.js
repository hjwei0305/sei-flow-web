/**
 * Created by liusonglin on 2018/7/13.
 */
import React, {PureComponent} from 'react';
import {Button, Form, Row, Input, Col, Checkbox} from 'antd';
import SimpleTable from './SimpleTable';
import PropTypes from 'prop-types'
import TreeSelectWithService from "./TreeSelectWithService";
import SearchTable from "./SearchTable";
import {searchListByKeyWithTag} from "../utils/CommonUtils";

const FormItem = Form.Item;

class TransferTable extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            rightRowsSelected: [],
            leftRowsSelected: [],
            leftSearchValue: '',
            rightSearchValue: '',
            rightLoading: false,
            leftLoading: false,
            rightDisabled: true,
            leftDisabled: true,
            leftPageInfo: {},
            rightPageInfo: {},
            rightData: [],
            leftData: [],
            selectedKey: "",
            includeSubNode: false
        }
    }

    componentWillMount() {
        this.loadLeftData();
        this.loadRightData();

    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }

    loadLeftData = (value, pageInfo) => {
        const {leftService} = this.props;
        this.setState({leftLoading: true});
        leftService({...value, ...pageInfo}).then(res => {
            this.setState({
                leftData: res instanceof Array ? res : [],
                leftLoading: false,
                leftRowsSelected: [],
                rightDisabled: true,
                leftDisabled: true
            })
        }).catch(err => {
            this.setState({leftLoading: false});
        })
    }

    loadRightData = (value, pageInfo) => {
        const {rightService} = this.props;
        this.setState({rightLoading: true});
        rightService({...value, ...pageInfo}).then(res => {
            this.setState({
                rightData: res instanceof Array ? res : [],
                rightLoading: false,
                rightRowsSelected: [],
                rightDisabled: true,
                leftDisabled: true
            })
        }).catch(err => {
            this.setState({rightLoading: false});
        })
    }

    rightOnSelectRow = (selectedRows) => {
        if (selectedRows.length === 0) {
            this.setState({rightDisabled: true})
        } else {
            this.setState({rightDisabled: false})
        }
        this.setState({rightRowsSelected: selectedRows})
    }

    leftOnSelectRow = (selectedRows) => {
        if (selectedRows.length === 0) {
            this.setState({leftDisabled: true})
        } else {
            this.setState({leftDisabled: false})
        }
        this.setState({leftRowsSelected: selectedRows})
    }

    leftPageChange = (pageInfo) => {
        this.setState({leftPageInfo: pageInfo});
        this.loadLeftData({quickValue: this.state.leftSearchValue}, pageInfo);
    }

    rightPageChange = (pageInfo) => {
        this.setState({rightPageInfo: pageInfo});
        this.loadRightData({quickValue: this.state.rightSearchValue}, pageInfo);
    }

    handleLeftSearch = (value) => {
        this.setState({leftSearchValue: value});
        if (value !== "") {
            searchListByKeyWithTag(this.state.leftData, {keyword: value}, ["code", "name"]).then(res => {
                this.setState({leftData: res})
            })
        }
    }

    handleRightSearch = (value) => {
        this.setState({rightSearchValue: value})
        if (value !== "") {
            searchListByKeyWithTag(this.state.rightData, {keyword: value}, ["code", "name"]).then(res => {
                this.setState({rightData: res})
            })
        }
    }

    handleRightClick = () => {
        this.props.handleRightClick(this.state.leftRowsSelected, this.state.rightData).then(() => {
            this.loadRightData();
            this.loadLeftData();
        })
    }

    handleLeftClick = () => {
        if (this.props.handleLeftClick) {
            this.props.handleLeftClick(this.state.rightRowsSelected, this.state.rightData).then(() => {
                this.loadLeftData();
                this.loadRightData();
            })
        }
    }
    //是否包含子节点，params：selectedId,includeSubNode
    includeSubNode = (e) => {
        this.setState({includeSubNode: e.target.checked});
        const {onIncludeSubNode} = this.props;
        if (onIncludeSubNode) {
            onIncludeSubNode(e.target.checked);
        }
        // let params={};
        // params.includeSubNode=e.target.checked;
        // params.organizationId=this.state.selectedKey?this.state.selectedKey:"";
        // this.loadLeftData(params)
    };

    selectedWithServiceChange = (key) => {
        this.setState({selectedKey: key, leftSearchValue: ''});
        const {treeSelectConfig} = this.props;
        if (treeSelectConfig.onSelect) {
            treeSelectConfig.onSelect(key, this.state.includeSubNode);
        }
    };

    selectChange = (key) => {
        this.setState({selectedKey: key.id, leftSearchValue: ''});
        const {JointQueryService} = this.props;
        this.setState({leftLoading: true});
        JointQueryService(key.id).then(res => {
            this.setState({
                leftData: res instanceof Array ? res : [],
                leftLoading: false,
                leftRowsSelected: [],
                rightDisabled: true,
                leftDisabled: true
            })
        }).catch(err => {
            this.setState({leftLoading: false});
        })
    };

    render() {
        const {
            rightData,
            leftData,
        } = this.state
        const {leftColumns, rightColumns, treeSelectConfig, checkBoxConfig, searchTableConfig} = this.props;

        const leftTitle = () => {
            return [
                treeSelectConfig && <span style={{marginLeft: 5}}
                                          key={"treeSelecteWithServiceLable"}>{treeSelectConfig.lable ? treeSelectConfig.lable + ":" : ""}</span>,
                treeSelectConfig && <span style={{marginLeft: 5}} key={"treeSelecteWithService"}><TreeSelectWithService
                    config={treeSelectConfig} width={220} onChange={this.selectedWithServiceChange}/></span>,

                checkBoxConfig && <span style={{marginLeft: 5}}
                                        key={"checkboxLable"}>{checkBoxConfig.lable ? checkBoxConfig.lable + ":" : ""}</span>,
                checkBoxConfig &&
                <span style={{marginLeft: 5}} key={"checkbox"}><Checkbox onChange={this.includeSubNode}
                                                                         style={{marginLeft: 5}}/></span>,

                searchTableConfig && <span style={{marginLeft: 5}}
                                           key={"searchTableLable"}>{searchTableConfig.lable ? searchTableConfig.lable + ":" : ""}</span>,
                searchTableConfig && <span style={{marginLeft: 5}} key={"searchTable"}>
                       <SearchTable isNotFormItem={true} config={searchTableConfig} initValue={false}
                                    selectChange={this.selectChange} style={{width: 220, marginLeft: 5}}/>
                    </span>

            ]
        }

        const leftSearch = () => {
            return this.props.leftSearch === false ? null : <Input.Search
                placeholder="请输入代码或名称查询"
                onSearch={value => this.handleLeftSearch(value)}
                enterButton
            />
        }

        const rightSearch = () => {
            return this.props.rightSearch === false ? null : <Input.Search
                placeholder="请输入代码或名称查询"
                onSearch={value => this.handleRightSearch(value)}
                enterButton
            />
        }
        return (
            <Row style={{
                margin: '0px 8px', position: 'absolute',
                width: this.props.width ? this.props.width : '100%'
            }}
                 type="flex" justify="space-around" align="middle" gutter={8}>
                <Col key='left' span={11}>
                    <div style={{margin: '10px 14px 10px'}}>
                        <div className={"header-span"}>未分配</div>
                    </div>
                    <Row style={{background: '#F3F8FC', paddingTop: 10, paddingBottom: 5}}>
                        <Col span={18}>{<span>{leftTitle()}</span>}</Col>
                        <Col span={6} style={{textAlign: 'right'}}>{leftSearch()}</Col>
                    </Row>
                    <SimpleTable
                        checkBox
                        data={this.state.leftSearchValue ? leftData.filter(item => item.tag) : leftData}
                        loading={this.state.leftLoading}
                        heightY={this.props.heightY}
                        style={{overflow: 'auto'}}
                        rowsSelected={this.state.leftRowsSelected}
                        columns={leftColumns}
                        pageChange={this.leftPageChange}
                        onSelectRow={this.leftOnSelectRow}
                    />
                </Col>
                <Col key='middle' span={1} style={{textAlign: 'center'}}>
                    <Button key="rightButton" style={{'marginBottom': '30px', 'width': '44px'}} icon="left"
                            disabled={this.state.rightDisabled}
                            onClick={this.handleLeftClick}/>
                    <Button key="leftButton" style={{'marginBottom': '30px', 'width': '44px'}} icon="right"
                            disabled={this.state.leftDisabled}
                            onClick={this.handleRightClick}/>
                </Col>
                <Col key='right' span={11}>
                    <div style={{margin: '10px 14px 10px'}}>
                        <div className={"header-span"}>已分配</div>
                    </div>
                    <Row style={{background: '#F3F8FC', paddingTop: 10, paddingBottom: 5}}>
                        <Col span={16}>{<span>&nbsp;{" "}</span>}</Col>
                        <Col span={8} style={{textAlign: 'right'}}>{rightSearch()}</Col>
                    </Row>
                    <SimpleTable
                        checkBox
                        heightY={this.props.heightY}
                        style={{overflow: 'auto'}}
                        loading={this.state.rightLoading}
                        data={this.state.rightSearchValue ? rightData.filter(item => item.tag) : rightData}
                        columns={rightColumns}
                        rowsSelected={this.state.rightRowsSelected}
                        onSelectRow={this.rightOnSelectRow}
                        pageChange={this.rightPageChange}
                    />
                </Col>
            </Row>
        );
    }
}

TransferTable.propTypes = {
    rightService: PropTypes.any,
    leftService: PropTypes.any,
    handleRightClick: PropTypes.func,
    handleLeftClick: PropTypes.func,
    leftColumns: PropTypes.any,
    rightColumns: PropTypes.any,
    leftTitle: PropTypes.any,
    rightTitle: PropTypes.any
};

export default TransferTable;
