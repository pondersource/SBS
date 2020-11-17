import React from "react";
import {
    agreeAup,
    aupLinks,
    invitationAccept, invitationByHash,
    invitationDecline,
    organisationInvitationAccept,
    organisationInvitationByHash,
    organisationInvitationDecline
} from "../api";
import I18n from "i18n-js";
import "./UserInvitation.scss";
import Button from "../components/Button";
import {setFlash} from "../utils/Flash";
import moment from "moment";
import {login} from "../utils/Login";
import ConfirmationDialog from "../components/ConfirmationDialog";

class UserInvitation extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            invite: {user: {}, collaboration: {collaboration_memberships: []}, organisation: {organisation_memberships: []}},
            acceptedTerms: false,
            personalDataConfirmation: false,
            initial: true,
            isExpired: false,
            errorOccurred: false,
            aup: {},
            confirmationDialogOpen: false,
            confirmationDialogQuestion: "",
            confirmationDialogAction: () => true,
            cancelDialogAction: this.closeConfirmationDialog,
            loading: false
        };
    }

    componentDidMount = () => {
        const {params} = this.props.match;
        const today = moment();
        if (params.hash) {
            const {isOrganisationInvite} = this.props;
            const promise = isOrganisationInvite ? organisationInvitationByHash(params.hash) : invitationByHash(params.hash);
            promise.then(json => {
                const isExpired = today.isAfter(moment(json.expiry_date * 1000));
                this.setState({invite: json, isExpired: isExpired, loading: true});
                const {user} = this.props;
                if (!user.guest && user.needs_to_agree_with_aup) {
                    aupLinks().then(res => this.setState({"aup": res}));

                }
            }).catch(() => {
                this.setState({errorOccurred: true});
                setFlash(I18n.t("organisationInvitation.flash.notFound"), "error");
            });
        } else {
            this.props.history.push("/404");
        }
    };

    agreeWith = () => agreeAup().then(() => this.setState({acceptedTerms: true}));

    accept = () => {
        const {invite} = this.state;
        const {isOrganisationInvite} = this.props;
        const promise = isOrganisationInvite ? organisationInvitationAccept(invite) : invitationAccept(invite);
        promise.then(() => {
            this.props.refreshUser(() => {
                this.props.history.push(`/${isOrganisationInvite ? "organisations" : "collaborations"}/${isOrganisationInvite ? invite.organisation_id : invite.collaboration_id}?first=true`);
            });
        })
            .catch(e => {
                if (e.response && e.response.json) {
                    e.response.json().then(res => {
                        if (res.message && res.message.indexOf("already a member") > -1) {
                            this.setState({errorOccurred: true}, () =>
                                setFlash(I18n.t("invitation.flash.alreadyMember"), "error"));
                        }
                    });
                } else {
                    throw e;
                }
            });
    };

    closeConfirmationDialog = () => this.setState({confirmationDialogOpen: false});

    confirm = (action, question) => {
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: action
        });
    };

    cancel = () => this.confirm(
        () => this.props.history.push("/dead-end"),
        I18n.t("models.invitation.confirmations.cancelInvitation"));

    decline = () => this.confirm(
        this.doDecline,
        I18n.t("models.invitation.confirmations.declineInvitation"));

    doDecline = () => {
        const {invite} = this.state;
        const {isOrganisationInvite} = this.props;
        const promise = isOrganisationInvite ? organisationInvitationDecline(invite) : invitationDecline(invite);
        promise.then(() => {
            this.setState({confirmationDialogOpen: false});
            setFlash(I18n.t("invitation.flash.inviteDeclined", {name: isOrganisationInvite ? invite.organisation.name : invite.collaboration.name}));
            this.props.history.push(`/home`);
        });
    };

    renderAcceptInvitationStep = () => {
        return (
            <section className="step-container">
                <div className="step">
                    <div className="circle three-quarters">
                        <span>{I18n.t("models.invitation.steps.progress", {now: "3", total: "4"})}</span>
                    </div>
                    <div className="step-actions">
                        <h1>{I18n.t("models.invitation.steps.invite")}</h1>
                        <span>{I18n.t("models.invitation.steps.next", {step: I18n.t("models.invitation.steps.collaborate")})}</span>
                    </div>
                </div>
                <Button onClick={this.accept}
                        txt={<span>{I18n.t("models.invitation.acceptInvitation")}</span>}/>
                <Button onClick={this.decline} cancelButton={true}
                        txt={<span>{I18n.t("models.invitation.declineInvitation")}</span>}/>
            </section>
        )
    }

    renderAupStep = () => {
        const {aup} = this.state;

        return (
            <section className="step-container">
                <div className="step">
                    <div className="circle two-quarters">
                        <span>{I18n.t("models.invitation.steps.progress", {now: "2", total: "4"})}</span>
                    </div>
                    <div className="step-actions">
                        <h1>{I18n.t("models.invitation.steps.aup")}</h1>
                        <span>{I18n.t("models.invitation.steps.next", {step: I18n.t("models.invitation.steps.invite")})}</span>
                    </div>
                </div>
                <div className="htmlAup" dangerouslySetInnerHTML={{__html: aup.html}}/>
                <div className="download">
                    <a href={aup.pdf_link} className="pdf" download={aup.pdf} target="_blank" rel="noopener noreferrer">
                        {I18n.t("aup.downloadPdf")}
                    </a>
                </div>
                <Button onClick={this.agreeWith}
                        txt={<span>{I18n.t("models.invitation.accept")}</span>}/>
                <Button onClick={this.cancel} cancelButton={true}
                        txt={<span>{I18n.t("models.invitation.noAccept")}</span>}/>
            </section>
        )
    }


    renderLoginStep = () => {
        return (
            <section className="step-container">
                <div className="step">
                    <div className="circle one-quarters">
                        <span>{I18n.t("models.invitation.steps.progress", {now: "1", total: "4"})}</span>
                    </div>
                    <div className="step-actions">
                        <h1>{I18n.t("models.invitation.steps.login")}</h1>
                        <span>{I18n.t("models.invitation.steps.next", {step: I18n.t("models.invitation.steps.aup")})}</span>
                    </div>
                </div>
                <Button onClick={login} txt={<span>{I18n.t("models.invitation.login")}<sup> *</sup></span>}/>
                <p className="tip"><sup>*</sup>{I18n.t("models.invitation.loginTip")}</p>
            </section>
        )
    }

    render() {
        const {user, isOrganisationInvite} = this.props;

        const {
            invite, acceptedTerms, isExpired, errorOccurred,
            confirmationDialogOpen, cancelDialogAction, confirmationDialogQuestion, confirmationDialogAction,
        } = this.state;
        const expiredMessage = I18n.t("invitation.expired", {expiry_date: moment(invite.expiry_date * 1000).format("LL")});
        return (
            <div className="mod-user-invitation">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                {!errorOccurred &&
                <div className="invitation-container">
                    {!isExpired && <h1>Hi,</h1>}
                    {isExpired &&
                    <p className="error">{expiredMessage}</p>}
                    {!isExpired && <div className="invitation-inner">
                        <p className="info">{I18n.t("models.invitation.welcome")}</p>
                        <section className="invitation">
                            {I18n.t("models.invitation.invited", {
                                type: isOrganisationInvite ? I18n.t("welcomeDialog.organisation") : I18n.t("welcomeDialog.collaboration"),
                                collaboration: isOrganisationInvite ? invite.organisation.name : invite.collaboration.name,
                                inviter: invite.user.name
                            })}
                        </section>
                        <p className="info">{I18n.t("models.invitation.followingSteps")}</p>
                        {(user.guest) && this.renderLoginStep()}
                        {(!user.guest && user.needs_to_agree_with_aup && !acceptedTerms) && this.renderAupStep()}
                        {(!user.guest && (!user.needs_to_agree_with_aup || acceptedTerms)) && this.renderAcceptInvitationStep()}
                    </div>}

                </div>}
            </div>);
    };
}

export default UserInvitation;
