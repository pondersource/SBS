import React from "react";
import "./UnitHeader.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Logo from "./Logo";
import {isEmpty, stopEvent} from "../../utils/Utils";
import PropTypes from "prop-types";
import Button from "../Button";
import {ButtonType, MenuButton} from "@surfnet/sds";
import {Link} from "react-router-dom";
import I18n from "i18n-js";

class UnitHeader extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            showDropDown: false
        };
    }

    performAction = action => e => {
        stopEvent(e);
        !action.disabled && action.perform();
    }

    otherOptions = (chevronActions, firstTime, auditLogPath, history, queryParam) => {
        return (
            <ul className={"other-options"}>
                {chevronActions.map((action, index) => <li key={index} onClick={this.performAction(action)}>
                    <a href={`/${action.name}`}>{action.name}</a>
                </li>)}
                {(history && auditLogPath) &&
                <li onClick={() => this.props.history.push(`/audit-logs/${auditLogPath}?${queryParam}`)}>
                    <Link to={`/audit-logs/${auditLogPath}?${queryParam}`}>
                        {I18n.t("home.history")}
                    </Link>
                </li>}
                {firstTime &&
                <li onClick={this.performAction({perform: firstTime})}>
                    <a href={"/" + I18n.t("home.firstTime")}>
                        {I18n.t("home.firstTime")}
                    </a>
                </li>}
            </ul>
        )
    }

    render() {
        const {
            obj, history, auditLogPath, name, breadcrumbName, svgClick, firstTime, actions, children, customAction,
            displayDescription
        } = this.props;
        const {showDropDown} = this.state;
        const queryParam = `name=${encodeURIComponent(breadcrumbName || name)}&back=${encodeURIComponent(window.location.pathname)}`;
        const nonChevronActions = (actions || []).filter(action => action.buttonType !== ButtonType.Chevron);
        const chevronActions = (actions || []).filter(action => action.buttonType === ButtonType.Chevron);
        const showChevronAction = (history && auditLogPath) || firstTime || chevronActions.length > 0;
        return (
            <div className="unit-header-container">
                <div className="unit-header">
                    <div className="image">
                        {obj.logo && <Logo src={obj.logo}/>}
                        {obj.svg && <obj.svg onClick={() => svgClick && svgClick()}/>}
                        {obj.icon && <FontAwesomeIcon icon={obj.icon}/>}
                    </div>
                    <div className="obj-name">
                        {obj.name && <h1>{obj.name}</h1>}
                        {obj.organisation && <span className="name">{obj.organisation.name}</span>}
                        {(obj.description && displayDescription) && <span className={"description"}>{obj.description}</span>}
                        {children}
                    </div>
                    {!isEmpty(actions) &&
                    <div className="action-menu-container">
                        {nonChevronActions.map((action, index) =>
                            <Button key={index}
                                    onClick={() => !action.disabled && action.perform()}
                                    txt={action.name}
                                    cancelButton={action.buttonType === ButtonType.Secondary}/>)
                        }
                        {showChevronAction &&
                        <div tabIndex={1}
                             onBlur={() => setTimeout(() => this.setState({showDropDown: false}), 250)}>
                            <MenuButton txt={I18n.t("home.otherOptions")}
                                        isOpen={showDropDown}
                                        toggle={() => this.setState({showDropDown: !showDropDown})}
                                        buttonType={ButtonType.Secondary}
                                        children={this.otherOptions(chevronActions, firstTime, auditLogPath, history, queryParam)}/>
                        </div>}
                    </div>}
                    {customAction && customAction}
                </div>
            </div>
        )
    }

}

UnitHeader.propTypes = {
    obj: PropTypes.object,
    history: PropTypes.any,
    auditLogPath: PropTypes.string,
    name: PropTypes.string,
    breadcrumbName: PropTypes.string,
    svgClick: PropTypes.func,
    firstTime: PropTypes.func,
    actions: PropTypes.array,
};

export default UnitHeader;
