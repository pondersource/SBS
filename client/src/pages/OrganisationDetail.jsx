import React from "react";
import {organisationById} from "../api";
import "./OrganisationDetail.scss";
import I18n from "i18n-js";
import {isEmpty} from "../utils/Utils";
import Tabs from "../components/Tabs";
import {ReactComponent as PlatformAdminIcon} from "../icons/users.svg";
import {ReactComponent as ServicesIcon} from "../icons/services.svg";
import {ReactComponent as CollaborationsIcon} from "../icons/collaborations.svg";
import Services from "../components/redesign/Services";
import UnitHeader from "../components/redesign/UnitHeader";
import OrganisationAdmins from "../components/redesign/OrganisationAdmins";
import {AppStore} from "../stores/AppStore";
import Collaborations from "../components/redesign/Collaborations";

class OrganisationDetail extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            organisation: {},
            loaded: false,
            tab: "admins",
            tabs: []
        };
    }

    componentDidMount = () => {
        const params = this.props.match.params;
        const {user} = this.props;
        if (params.id) {
            organisationById(params.id)
                .then(json => {
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
                    json.collaborations.forEach(collaboration => {
                        collaboration.invitations_count = collaboration.invitations.length;
                        collaboration.member_count = collaboration.collaboration_memberships.length;
                    });

                    const tab = params.tab || this.state.tab;
                    const tabs = [
                        this.getOrganisationAdminsTab(json),
                        this.getServicesTab(json),
                        this.getCollaborationsTab(json)
                    ];
                    AppStore.update(s => {
                        s.breadcrumb.paths = [
                            {path: "/", value: I18n.t("breadcrumb.home")},
                            {path: `/organisations/${json.id}`, value: json.name}
                        ];
                    });

                    this.setState({
                        organisation: json,
                        adminOfOrganisation: adminOfOrganisation,
                        managerOfOrganisation: managerOfOrganisation,
                        tab: tab,
                        tabs: tabs,
                        loaded: true
                    });

                })
                .catch(() => this.props.history.push("/404"));
        } else {
            this.props.history.push("/404");
        }
    };

    getOrganisationAdminsTab = organisation => {
        return (<div key="admins" name="admins" label={I18n.t("home.tabs.orgAdmins")}
                     icon={<PlatformAdminIcon/>}>
            <OrganisationAdmins {...this.props} organisation={organisation}/>
        </div>)
    }

    getServicesTab = organisation => {
        return (<div key="services" name="services" label={I18n.t("home.tabs.orgServices")} icon={<ServicesIcon/>}>
            <Services {...this.props} organisation={organisation}/>
        </div>)
    }

    getCollaborationsTab = organisation => {
        return (<div key="collaborations" name="collaborations" label={I18n.t("home.tabs.orgCollaborations")}
                     icon={<CollaborationsIcon/>}>
            <Collaborations {...this.props} organisation={organisation}/>
        </div>)
    }

    render() {
        const {tabs, organisation, loaded, tab} = this.state;
        if (!loaded) {
            return null;
        }
        const {user} = this.props;
        return (
            <div className="mod-organisation-container">
                <UnitHeader obj={organisation} mayEdit={true} history={this.props.history}
                            auditLogPath={`organisations/${organisation.id}`}
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
                <Tabs tab={tab}>
                    {tabs}
                </Tabs>
            </div>);
    };
}

export default OrganisationDetail;