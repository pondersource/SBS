import React, {Component} from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./Tab.scss";

class Tab extends Component {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        className: PropTypes.string,
        onClick: PropTypes.func.isRequired,
    };

    onClick = () => {
        const {label, onClick} = this.props;
        onClick(label);
    };

    render() {
        let {activeTab, className = "", label, icon} = this.props;

        className += " tab";

        if (activeTab === label) {
            className += " active";
        }

        return (
            <div className={className} onClick={this.onClick}>
                {icon && icon}<h2>{label}</h2>
            </div>
        );
    }
}

export default Tab;