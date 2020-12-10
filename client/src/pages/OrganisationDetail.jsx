import React from "react";
import {organisationById} from "../api";
import "./OrganisationDetail.scss";
import I18n from "i18n-js";
import {isEmpty} from "../utils/Utils";
import Tabs from "../components/Tabs";
import {ReactComponent as PlatformAdminIcon} from "../icons/users.svg";
import {ReactComponent as ServicesIcon} from "../icons/services.svg";
import {ReactComponent as ApiKeysIcon} from "../icons/security.svg";
import {ReactComponent as CollaborationsIcon} from "../icons/collaborations.svg";
import {ReactComponent as CollaborationRequestsIcon} from "../icons/faculty.svg";
import UnitHeader from "../components/redesign/UnitHeader";
import OrganisationAdmins from "../components/redesign/OrganisationAdmins";
import {AppStore} from "../stores/AppStore";
import Collaborations from "../components/redesign/Collaborations";
import SpinnerField from "../components/redesign/SpinnerField";
import ApiKeys from "../components/redesign/ApiKeys";
import OrganisationServices from "../components/redesign/OrganisationServices";
import CollaborationRequests from "../components/redesign/CollaborationRequests";
import WelcomeDialog from "../components/WelcomeDialog";
import {ROLES} from "../utils/UserRole";
import {getParameterByName} from "../utils/QueryParameters";

class OrganisationDetail extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            organisation: {},
            loading: true,
            tab: "collaborations",
            tabs: [],
            firstTime: false
        };
    }

    componentDidMount = callBack => {
        const params = this.props.match.params;
        if (params.id) {
            organisationById(params.id)
                .then(json => {
                    const {user, config} = this.props;
                    const member = (user.organisation_memberships || [])
                        .find(membership => membership.organisation_id === json.id);
                    if (isEmpty(member) && !user.admin) {
                        this.props.history.push("/404");
                        return;
                    }
                    const adminOfOrganisation = json.organisation_memberships
                        .some(member => member.role === "admin" && member.user_id === user.id) || user.admin;
                    const managerOfOrganisation = json.organisation_memberships
                        .some(member => member.role === "manager" && member.user_id === user.id);

                    const tab = params.tab || this.state.tab;
                    const tabs = this.getTabs(json, config);
                    AppStore.update(s => {
                        s.breadcrumb.paths = [
                            {path: "/", value: I18n.t("breadcrumb.home")},
                            {value: I18n.t("breadcrumb.organisation", {name: json.name})}
                        ];
                    });
                    const firstTime = getParameterByName("first", window.location.search) === "true";
                    this.tabChanged(tab, json.id);
                    this.setState({
                        organisation: json,
                        adminOfOrganisation: adminOfOrganisation,
                        managerOfOrganisation: managerOfOrganisation,
                        tab: tab,
                        tabs: tabs,
                        firstTime: firstTime,
                        loading: false
                    }, callBack);

                })
                .catch(() => this.props.history.push("/404"));
        } else {
            this.props.history.push("/404");
        }
    };

    onBoarding = () => {
        this.setState({firstTime: true});
    }

    getTabs = (organisation, config) => {
        const tabs = [
            this.getCollaborationsTab(organisation),
            this.getCollaborationRequestsTab(organisation),
            this.getOrganisationAdminsTab(organisation),
            this.getServicesTab(organisation),
            config.api_keys_enabled ? this.getAPIKeysTab(organisation) : null
        ];
        return tabs.filter(tab => tab !== null);
    }

    getOrganisationAdminsTab = organisation => {
        return (<div key="admins" name="admins" label={I18n.t("home.tabs.orgAdmins")}
                     icon={<PlatformAdminIcon/>}>
            <OrganisationAdmins {...this.props} organisation={organisation}
                                refresh={callback => this.componentDidMount(callback)}/>
        </div>)
    }

    getServicesTab = organisation => {
        return (<div key="services" name="services" label={I18n.t("home.tabs.orgServices")} icon={<ServicesIcon/>}>
            <OrganisationServices {...this.props} organisation={organisation}
                                  refresh={callback => this.componentDidMount(callback)}/>
        </div>);
    }

    getAPIKeysTab = organisation => {
        return (<div key="apikeys" name="apikeys" label={I18n.t("home.tabs.apikeys")} icon={<ApiKeysIcon/>}>
            <ApiKeys {...this.props} organisation={organisation}
                     refresh={callback => this.componentDidMount(callback)}/>
        </div>);
    }

    getCollaborationsTab = organisation => {
        return (<div key="collaborations" name="collaborations" label={I18n.t("home.tabs.orgCollaborations")}
                     icon={<CollaborationsIcon/>}>
            <Collaborations {...this.props} collaborations={organisation.collaborations} organisation={organisation}/>
        </div>)
    }

    getCollaborationRequestsTab = organisation => {
        return (<div key="collaboration_requests" name="collaboration_requests"
                     label={I18n.t("home.tabs.collaborationRequests")}
                     icon={<CollaborationRequestsIcon/>}>
            <CollaborationRequests {...this.props} organisation={organisation}/>
        </div>)

    }

    tabChanged = (name, id) => {
        const orgId = id || this.state.organisation.id;
        this.setState({tab: name}, () =>
            this.props.history.replace(`/organisations/${orgId}/${name}`));
    }

    render() {
        const {tabs, organisation, loading, tab, firstTime, adminOfOrganisation} = this.state;
        const {user} = this.props;
        if (loading) {
            return <SpinnerField/>;
        }
        return (
            <div className="mod-organisation-container">
                {<WelcomeDialog name={organisation.name} isOpen={firstTime}
                                role={adminOfOrganisation ? ROLES.ORG_ADMIN : ROLES.ORG_MANAGER}
                                isOrganisation={true}
                                isAdmin={user.admin}
                                close={() => this.setState({firstTime: false})}/>}

                <UnitHeader obj={organisation} mayEdit={adminOfOrganisation}
                            history={user.admin && this.props.history}
                            auditLogPath={`organisations/${organisation.id}`}
                            breadcrumbName={I18n.t("breadcrumb.organisation", {name: organisation.name})}
                            firstTime={user.admin ? this.onBoarding : undefined}
                            name={organisation.name}
                            onEdit={() => this.props.history.push("/edit-organisation/" + organisation.id)}>
                    <p>{organisation.description}</p>
                    <div className="org-attributes-container">
                        <div className="org-attributes">
                            <span>{I18n.t("organisation.schacHomeOrganisation")}</span>
                            <span>{organisation.schac_home_organisation}</span>
                        </div>
                        <div className="org-attributes">
                            <span>{I18n.t("organisation.collaborationCreationAllowed")}</span>
                            <span>{I18n.t(`forms.${organisation.collaboration_creation_allowed ? "yes" : "no"}`)}</span>
                        </div>
                    </div>
                </UnitHeader>
                <Tabs activeTab={tab} tabChanged={this.tabChanged}>
                    {tabs}
                </Tabs>
            </div>);
    };
}

export default OrganisationDetail;