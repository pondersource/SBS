import React from "react";
import "./Home.scss";
import I18n from "i18n-js";
import {health, platformAdmins} from "../api";
import {ReactComponent as Logo} from "../images/logo.svg";
import {ReactComponent as OrganisationsIcon} from "../icons/official-building-3.svg";
import {ReactComponent as PlatformAdminIcon} from "../icons/single-neutral-actions-key.svg";
import {AppStore} from "../stores/AppStore";
import {rawGlobalUserRole, ROLES} from "../utils/UserRole";
import Tabs from "../components/Tabs";
import Organisations from "../components/redesign/Organisations";
import UnitHeader from "../components/redesign/UnitHeader";
import Members from "../components/redesign/Members";
import Collaborations from "../components/redesign/Collaborations";
import Entities from "../components/redesign/Entities";
import PropTypes from "prop-types";
import PlatformAdmins from "../components/redesign/PlatformAdmins";

class Home extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            organisations: [],
            collaborations: [],
            platformAdmins: [],
            tabs: [],
            role: ROLES.USER,
            loaded: false
        };
    }

    componentDidMount = () => {
        const {user} = this.props;
        const tabs = [];
        const promises = [];
        const role = rawGlobalUserRole(user);
        switch (role) {
            case ROLES.PLATFORM_ADMIN:
                tabs.push(this.getOrganisationsTab());
                tabs.push(this.getPlatformAdminsTab());
                promises.push(platformAdmins())
                break;
        }
        Promise.all([promises]).then(res => {
            // tabs.push(this.getPlatformAdminsTab());
            tabs.push(this.getCollaborationsAdminsTab());
            AppStore.update(s => {
                s.breadcrumb.paths = [{path: "/", value: I18n.t("breadcrumb.home")}];
            });
            this.setState({role: ROLES.PLATFORM_ADMIN, loaded: true, tabs});
        });
    };

    getOrganisationsTab = () =>
        <div key="organisations" label={I18n.t("home.tabs.organisations")} icon={<OrganisationsIcon/>}>
            <Organisations {...this.props}/>
        </div>

    getPlatformAdminsTab = () => {
       return ( <div key="platformAdmins" label={I18n.t("home.tabs.platformAdmins")} icon={<PlatformAdminIcon/>}>
            <PlatformAdmins {...this.props}/>
        </div>)
    }
    getCollaborationsAdminsTab = () =>
        <div key="collaborations" label={I18n.t("home.tabs.collaborations")} icon={<PlatformAdminIcon/>}>
            <Collaborations {...this.props}/>
        </div>

    getUnitHeaderProps = user => {
        return {obj: {name: I18n.t("home.sram"), svg: Logo}}
    }

    render() {
        const {tabs, role, loaded} = this.state;
        if (!loaded) {
            return null;
        }
        const {user} = this.props;
        const unitHeaderProps = this.getUnitHeaderProps()
        return (
            <div className="mod-home-container">
                <UnitHeader props={unitHeaderProps}/>
                <Tabs>
                    {tabs}
                </Tabs>
            </div>);
    };
}

export default Home;