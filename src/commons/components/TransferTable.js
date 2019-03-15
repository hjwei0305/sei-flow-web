import React, {PureComponent} from 'react';
import {Button, Checkbox, Col, Form, Icon, Input, Row} from 'antd';
import SimpleTable from './SimpleTable';
import PropTypes from 'prop-types'
import TreeSelectWithService from "./TreeSelectWithService";
import SearchTable from "./SearchTable";
import {searchListByKeyWithTag} from "../utils/CommonUtils";
import StandardTree from "./StandardTree";
import DetailCard from "./DetailCard";

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
      rightData: [],
      leftData: [],
      selectedKey: "",
      includeSubNode: false,
      beTree: false
    }
  }

  componentWillMount() {
    const {treeSelectConfig,searchTableConfig} = this.props;
    if (treeSelectConfig && treeSelectConfig.defaultValue) {
      this.setState({selectedKey: treeSelectConfig.defaultValue})
    }else if (searchTableConfig&&searchTableConfig.defaultValue){
        this.setState({selectedKey: searchTableConfig.defaultValue})
    }
    if (this.props.initValue !== false) {
      this.loadLeftData();
      this.loadRightData();
    }

  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  loadLeftData = (params, pageInfo, beTree = this.state.beTree) => {
    this.setState({beTree});
    const {leftService, leftTreeService} = this.props;
    let service = leftService;
    if (beTree && leftTreeService) {
      service = leftTreeService;
    }
    this.setState({leftLoading: true});
    service({...params, pageInfo}).then(res => {
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

  loadRightData = (params, pageInfo, beTree = this.state.beTree) => {
    this.setState({beTree});
    const {rightService, rightTreeService} = this.props;
    let service = rightService;
    if (beTree && rightTreeService) {
      service = rightTreeService;
    }
    this.setState({rightLoading: true});
    service({...params, pageInfo}).then(res => {
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
  resetData = () => {
    this.setState({
      leftData: [],
      leftRowsSelected: [],
      leftSearchValue: "",
      rightData: [],
      rightRowsSelected: [],
      rightSearchValue: ""
    })
  };

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
  onLeftTreeCheck = (selectedKeys, selectedNodes) => {
    if (selectedNodes.length === 0) {
      this.setState({leftDisabled: true})
    } else {
      this.setState({leftDisabled: false})
    }
    this.setState({leftRowsSelected: selectedNodes})
  };
  onRightTreeCheck = (selectedKeys, selectedNodes) => {
    if (selectedNodes.length === 0) {
      this.setState({rightDisabled: true})
    } else {
      this.setState({rightDisabled: false})
    }
    this.setState({rightRowsSelected: selectedNodes})
  };
  leftPageChange = (pageInfo) => {
    if (!(this.state.leftData.length > pageInfo.rows)) {
      this.loadLeftData({quickSearchValue: this.state.leftSearchValue}, pageInfo);
    }
  };

  rightPageChange = (pageInfo) => {
    if (!(this.state.rightData.length > pageInfo.rows)) {
      this.loadRightData({quickSearchValue: this.state.rightSearchValue}, pageInfo);
    }
  };

  handleLeftSearch = (value) => {
    this.setState({leftSearchValue: value});
    if (this.state.leftData.rows) {
      let params = {quickSearchValue: value};
      if (this.props.checkBoxConfig) {
        params.includeSubNode = this.state.includeSubNode
      }
      if (this.state.selectedKey) {
        params.selectedKey = this.state.selectedKey
      }
      this.loadLeftData(params);
    } else {
      if (value !== "") {
        searchListByKeyWithTag(this.state.leftData, {keyword: value}, ["code", "name"]).then(res => {
          this.setState({leftData: res})
        })
      }
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
        if (this.state.leftData.rows) {
          let params = {quickSearchValue: this.state.leftSearchValue};
          if (this.props.checkBoxConfig) {
            params.includeSubNode = this.state.includeSubNode
          }
          if (this.state.selectedKey) {
            params.selectedKey = this.state.selectedKey
          }
          this.loadLeftData(params);
        } else {
          this.loadLeftData();
        }
        this.loadRightData();
      })
    }
  }

  //是否包含子节点，params：selectedId,includeSubNode
  includeSubNode = (e) => {
    this.setState({includeSubNode: e.target.checked});
    let params = {quickSearchValue: this.state.leftSearchValue, includeSubNode: e.target.checked};
    if (this.state.selectedKey) {
      params.selectedKey = this.state.selectedKey
    }
    this.loadLeftData(params);
  };

  selectedWithServiceChange = (selectedKey) => {
    const {JointQueryService} = this.props;
    this.setState({selectedKey});
    if (selectedKey&&JointQueryService){
      JointQueryService(selectedKey).then(res => {
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
    }else {
      let params = {quickSearchValue: this.state.leftSearchValue};
      if (this.props.checkBoxConfig) {
        params.includeSubNode = this.state.includeSubNode
      }
      //params.selectedKey = selectedKey;
      this.loadLeftData(params);
    }

  };

  selectChange = (select) => {
    this.setState({selectedKey: select.id, leftSearchValue: ''});
    console.log("select:",select)
    const {JointQueryService} = this.props;
    if (select.id&&JointQueryService){
      this.setState({leftLoading: true});
      JointQueryService(select.id).then(res => {
        this.setState({
          leftData: res,
          leftLoading: false,
          leftRowsSelected: [],
          rightDisabled: true,
          leftDisabled: true
        })
      }).catch(err => {
        this.setState({leftLoading: false});
      })
    }else {
      let params = {quickSearchValue: this.state.leftSearchValue};
      if (this.props.checkBoxConfig) {
        params.includeSubNode = this.state.includeSubNode
      }
      //params.selectedKey = selectedKey;
      this.loadLeftData(params);
    }

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
        treeSelectConfig && <span style={{marginLeft: 5}} key={"treeSelecteWithService"}>
                        <TreeSelectWithService
                          value={this.state.selectedKey}
                          {...treeSelectConfig.props}
                          config={treeSelectConfig} width={220} onChange={this.selectedWithServiceChange}/></span>,

        checkBoxConfig && <span style={{marginLeft: 5}}
                                key={"checkboxLable"}>{checkBoxConfig.lable ? checkBoxConfig.lable + ":" : ""}</span>,
        checkBoxConfig &&
        <span style={{marginLeft: 5}} key={"checkbox"}><Checkbox onChange={this.includeSubNode}
                                                                 style={{marginLeft: 5}}/></span>,

        searchTableConfig && <span style={{marginLeft: 5}}
                                   key={"searchTableLable"}>{searchTableConfig.lable ? searchTableConfig.lable + ":" : ""}</span>,
        searchTableConfig && <span style={{marginLeft: 5}} key={"searchTable"}>
                       <SearchTable isNotFormItem={true} config={searchTableConfig}
                                    value={this.state.selectedKey}
                                    {...searchTableConfig.props}
                                    selectChange={this.selectChange} style={{width: 220, marginLeft: 5}}/>
                    </span>

      ]
    }

    const leftSearch = () => {
      return this.props.leftSearch === false ? null : <Input.Search
        placeholder="请输入关键字查询"
        onSearch={value => this.handleLeftSearch(value)}
        style={{width: 220}}
        allowClear
      />
    }

    const rightSearch = () => {
      return this.props.rightSearch === false ? null : <Input.Search
        placeholder="请输入关键字查询"
        onSearch={value => this.handleRightSearch(value)}
        style={{width: 220}}
        allowClear
      />
    }
    const {style} = this.props;
    const {rightDisabled,leftDisabled}=this.state
    return (
      <Row style={{height: "100%",background: '#f3f3f3', ...style}}
           type="flex" justify="space-between" align="middle">
        <Col key='left' span={12} style={{height: "100%"}}>
          <DetailCard
            title="未分配"
            style={{height: "100%"}}
            bodyStyle={{height: "calc(100% - 53px)"}}
          >
            {!this.state.beTree && <div className={'tbar-box'}>
              <div className={'tbar-btn-box'}>{leftTitle()}</div>
              <div className={'tbar-search-box'}>{leftSearch()}</div>
            </div>}
            {!this.state.beTree && <SimpleTable
              checkBox
              data={leftData.rows ? leftData : this.state.leftSearchValue ? leftData.filter(item => item.tag) : leftData}
              loading={this.state.leftLoading}
              heightY={this.props.heightY}
              style={{overflow: 'auto'}}
              rowsSelected={this.state.leftRowsSelected}
              columns={leftColumns}
              pageChange={this.leftPageChange}
              onSelectRow={this.leftOnSelectRow}
            />}
            {this.state.beTree && <StandardTree
              checkable
              dadaSource={leftData}
              onCheck={this.onLeftTreeCheck}/>}
          </DetailCard>
        </Col>
        <Col key='middle' span={1} style={{display: 'flex', flexDirection: "column", alignItems: "center"}}>

          <Button
            key="rightButton"
            shape="circle"
            icon="left"
            style={{'marginBottom': '30px',color: rightDisabled?null:'#1890FF'}}
            disabled={rightDisabled}
            onClick={this.handleLeftClick}
          />

          <Button
            key="leftButton"
            shape="circle"
            icon="right"
            disabled={leftDisabled}
            style={{'marginBottom': '30px',color: leftDisabled?null:'#1890FF'}}
            onClick={this.handleRightClick}/>
        </Col>
        <Col key='right' span={11} style={{height: "100%"}}>
          <DetailCard
            title="已分配"
            style={{height: "100%"}}
            bodyStyle={{height: "calc(100% - 53px)"}}
          >
            {!this.state.beTree && <div className={'tbar-box'}>
              <div className={'tbar-btn-box'}>&nbsp;{" "}</div>
              <div className={'tbar-search-box'}>{rightSearch()}</div>
            </div>}
            {!this.state.beTree && <SimpleTable
              checkBox
              heightY={this.props.heightY}
              style={{overflow: 'auto'}}
              loading={this.state.rightLoading}
              data={this.state.rightSearchValue ? rightData.filter(item => item.tag) : rightData}
              columns={rightColumns}
              rowsSelected={this.state.rightRowsSelected}
              onSelectRow={this.rightOnSelectRow}
              pageChange={this.rightPageChange}
            />}
            {this.state.beTree && <StandardTree
              checkable
              dadaSource={rightData}
              onCheck={this.onRightTreeCheck}
            />}
          </DetailCard>
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
