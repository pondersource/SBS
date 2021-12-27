import React from "react";
import {withRouter} from "react-router-dom";
import I18n from "i18n-js";
import "./ServiceAup.scss";
import Button from "../components/Button";
import {serviceAupCreate, serviceByUuid4} from "../api";
import SpinnerField from "../components/redesign/SpinnerField";
import CollaborationAupAcceptance from "../components/CollaborationAupAcceptance";


class ServiceAup extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            agreed: false,
            service: {},
            collaborations: [],
            serviceEmails: {},
            loading: true
        };
    }

    componentDidMount = () => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const serviceId = urlSearchParams.get("service_id");
        serviceByUuid4(serviceId).then(res => {
            this.setState({
                loading: false,
                service: res["service"],
                collaborations: res["collaborations"],
                serviceEmails: res["service_emails"]
            });
        })
    }

    agreeWith = () => {
        const {service} = this.state;
        const {config} = this.props;
        serviceAupCreate(service).then(() => {
            window.location.href = config.continue_eduteams_redirect_uri;
        });
    }

    render() {
        const {agreed, loading, service, collaborations, serviceEmails} = this.state;
        if (loading) {
            return <SpinnerField/>;
        }
        const serviceName = {name: service.name}
        return (
            <div className="mod-service-aup">
                <h1>{I18n.t("aup.service.title")}</h1>
                <p dangerouslySetInnerHTML={{__html: I18n.t("aup.service.info", serviceName)}}/>
                {collaborations.length > 1 &&
                <p className="multiple-collaborations">{I18n.t("aup.service.multipleCollaborations")}</p>
                }
                {collaborations.length === 0 &&
                <p className="multiple-collaborations">{I18n.t("aup.service.organisationAccess")}</p>
                }
                <div>
                    {collaborations.map(collaboration => <div className="collaboration-detail">
                        <h2 dangerouslySetInnerHTML={{__html: I18n.t("aup.service.purposeOf", {name: collaboration.name})}}/>
                        <p>{collaboration.description}</p>
                    </div>)}
                    <h2>{I18n.t("aup.service.informationService")}</h2>
                    <CollaborationAupAcceptance services={[service]}
                                                disabled={!agreed}
                                                serviceEmails={serviceEmails}
                                                setDisabled={() => this.setState({agreed: !agreed})}/>
                    <div className="actions">
                        <Button className="proceed" onClick={this.agreeWith} centralize={true}
                                txt={I18n.t("aup.service.proceed", serviceName)} disabled={!agreed}/>
                    </div>

                </div>
            </div>
        )
    }
}

export default withRouter(ServiceAup);