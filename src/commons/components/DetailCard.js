/**
 * @description 继承 antd 的 card 实现展示面板共同，统一样式
 * @author 刘松林
 * @date 2018.12.1
 */

import React from 'react';
import { Card,Icon } from 'antd';
import PropTypes from 'prop-types';
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;

class DetailCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
           showContent:true
        };
    }

    showOrHidden = (type) => {
        if(type==='show'){
            this.setState({showContent:true})
        }else {
            this.setState({showContent:false})
        }
    }


    render() {
        const {showContent} = this.state;
        const {bodyStyle,title,headStyle,style} = this.props;
        return (
            <Card
                className={this.props.className}
                style={{ width: '100%',border:'none',boxSizing: "border-box",...style}}
                title={<div className={"card-title"}>{title}</div>}
                headStyle={{border:'none',boxSizing: "border-box",...headStyle}}
                bodyStyle={{padding:"0px 10px 10px",boxSizing: "border-box",...bodyStyle}}
                bordered={false}
                extra={this.props.collapse===false ? null :
                    showContent?[this.props.extra,<Icon type="down" key='downIcon' onClick={() => this.showOrHidden('hidden')}/>]
                :<Icon type="right" key='downIcon' onClick={() => this.showOrHidden('show')}/>}
            >
                <div hidden={!showContent} style={{height: "100%"}}>
                    {this.props.content?this.props.content:
                    React.Children.map(this.props.children, (child, i) => {
                        return child;
                    })}
                </div>
            </Card>
        )
    }
}

DetailCard.defaultProps={
    //默认不收起
    collapse:false
}

DetailCard.propTypes={
    //详细清单标题
    title:PropTypes.string,
    //是否显示收缩按钮
    collapse:PropTypes.bool,
    //reactNode,显示内容
    content:PropTypes.any
}


export default DetailCard
