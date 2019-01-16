import React from "react";
import {myCollaborations, searchCollaborations} from "../api";
import I18n from "i18n-js";
import debounce from "lodash.debounce";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./Collaborations.scss";
import Button from "../components/Button";
import {isEmpty, stopEvent} from "../utils/Utils";
import Autocomplete from "../components/Autocomplete";

class Collaborations extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            collaborations: [],
            sortedCollaborations: [],
            selected: -1,
            suggestions: [],
            query: "",
            loadingAutoComplete: false,
            moreToShow: false,
            sorted: "name",
            reverse: false,
        }
    }

    componentWillMount = () => myCollaborations()
        .then(json => {
            const {user} = this.props;
            json.forEach(coll => {
                const membership = coll.collaboration_memberships.find(m => m.user_id === user.id);
                coll.role = membership ? membership.role : "";
                coll.organisation_name = coll.organisation.name;
            });
            const {sorted, reverse} = this.state;
            const sortedCollaborations = this.sortCollaborations(json, sorted, reverse);
            this.setState({collaborations: sortedCollaborations, sortedCollaborations: sortedCollaborations})
        });

    onSearchKeyDown = e => {
        const {suggestions, selected} = this.state;
        if (e.keyCode === 40 && selected < (suggestions.length - 1)) {//keyDown
            stopEvent(e);
            this.setState({selected: (selected + 1)});
        }
        if (e.keyCode === 38 && selected >= 0) {//keyUp
            stopEvent(e);
            this.setState({selected: (selected - 1)});
        }
        if (e.keyCode === 13 && selected >= 0) {//enter
            stopEvent(e);
            this.setState({selected: -1}, () => this.itemSelected(suggestions[selected]));
        }
        if (e.keyCode === 27) {//escape
            stopEvent(e);
            this.setState({selected: -1, query: "", suggestions: []});
        }

    };

    search = e => {
        const query = e.target.value;
        this.setState({query: query, selected: -1});
        if ((!isEmpty(query) && query.trim().length > 2) || "*" === query.trim()) {
            this.setState({loadingAutoComplete: true});
            this.delayedAutocomplete();
        }
    };

    delayedAutocomplete = debounce(() =>
        searchCollaborations(this.state.query).then(results => this.setState({
            suggestions: results.length > 15 ? results.slice(0, results.length - 1) : results,
            loadingAutoComplete: false,
            moreToShow: results.length > 15 && this.state.query !== "*"
        })), 200);

    itemSelected = collaboration => this.props.history.push(`/collaborations/${collaboration.id}`);

    onBlurSearch = suggestions => () => {
        if (!isEmpty(suggestions)) {
            setTimeout(() => this.setState({suggestions: [], loadingAutoComplete: true}), 250);
        } else {
            this.setState({suggestions: [], loadingAutoComplete: true});
        }
    };

    openJoinRequest = joinRequest => e => {
        stopEvent(e);
        this.props.history.push(`/join-requests/${joinRequest.id}`);
    };

    openInvitation = invitation => e => {
        stopEvent(e);
        this.props.history.push(`/invitations/${invitation.id}`);
    };

    openCollaboration = collaboration => e => {
        stopEvent(e);
        this.props.history.push(`/collaborations/${collaboration.id}`);
    };

    renderRequests = joinRequests => {
        return (
            <section className="info-block ">
                <div className="header join-requests">
                    <span className="type">{I18n.t("collaborations.requests")}</span>
                    <span className="counter">{joinRequests.length}</span>
                </div>
                <div className="content">
                    {joinRequests.map((request, i) =>
                        <div className="join-request" key={i}>
                            <a href={`/join-requests/${request.id}`} onClick={this.openJoinRequest(request)}>
                                <FontAwesomeIcon icon={"arrow-right"}/>
                                <span>{request.user.name}</span>
                            </a>
                        </div>)}
                </div>
            </section>
        );
    };

    renderAuthorisations = collaborations => {
        const authorisationGroups = collaborations.map(collaboration => collaboration.authorisation_groups).flat()
        return (
            <section className="info-block ">
                <div className="header authorisations">
                    <span className="type">{I18n.t("collaborations.authorisations")}</span>
                    <span className="counter">{authorisationGroups.length}</span>
                </div>
                <div className="content">
                    {collaborations.map((collaboration, i) =>
                        <div className="collaboration-authorisations" key={i}>
                            <a href={`/collaborations/${collaboration.id}`}
                               onClick={this.openCollaboration(collaboration)}>
                                <span>{collaboration.name}</span>
                                <span className="count">{`(${collaboration.authorisation_groups.length})`}</span>
                            </a>
                        </div>)}
                </div>
            </section>
        );
    };

    renderInvitations = invitations => {
        return (
            <section className="info-block ">
                <div className="header invitations">
                    <span className="type">{I18n.t("collaborations.invitations")}</span>
                    <span className="counter">{invitations.length}</span>
                </div>
                <div className="content">
                    {invitations.map((invitation, i) =>
                        <div className="invitation" key={i}>
                            <a href={`/invitations/${invitation.id}`} onClick={this.openInvitation(invitation)}>
                                <FontAwesomeIcon icon={"arrow-right"}/>
                                <span>{invitation.invitee_email}</span>
                            </a>
                        </div>)}
                </div>

            </section>
        );
    };

    renderServices = collaborations => {
        const services = collaborations.map(collaboration => collaboration.services).flat();
        return (
            <section className="info-block ">
                <div className="header services">
                    <span className="type">{I18n.t("collaborations.services")}</span>
                    <span className="counter">{services.length}</span>
                </div>
                <div className="content">
                    {collaborations.map((collaboration, i) =>
                        <div className="collaboration-services" key={i}>
                            <a href={`/collaborations/${collaboration.id}`}
                               onClick={this.openCollaboration(collaboration)}>
                                <span>{collaboration.name}</span>
                                <span className="count">{`(${collaboration.services.length})`}</span>
                            </a>
                        </div>)}
                </div>

            </section>
        );
    };

    renderProfile = user => {
        return (
            <section className="info-block ">
                <div className="header profile">
                    <span className="type">{I18n.t("collaborations.profile")}</span>
                </div>
                <div className="content profile">
                    <p>{user.uid}</p>
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                </div>
            </section>
        );
    };

    headerIcon = (name, sorted, reverse) => {
        if (name === sorted) {
            return reverse ? <FontAwesomeIcon icon="arrow-up" className="reverse"/> :
                <FontAwesomeIcon icon="arrow-down" className="current"/>
        }
        return <FontAwesomeIcon icon="arrow-down"/>;
    };

    sortTable = (collaborations, name, sorted, reverse) => () => {
        const reversed = (sorted === name ? !reverse : false);
        const sortedCollaborations = this.sortCollaborations(collaborations, name, reverse);
        this.setState({collaborations: sortedCollaborations, sorted: name, reverse: reversed});
    };

    sortCollaborations = (collaborations, name, reverse) => [...collaborations].sort((a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return aSafe.toString().localeCompare(bSafe.toString()) * (reverse ? -1 : 1);
    });

    getCollaborationValue = (collaboration, user, name) => collaboration[name];

    renderCollaborationRow = (collaboration, user, names) => {
        return (
            <tr key={collaboration.id} onClick={this.openCollaboration(collaboration)}>
                {names.map(name => <td key={name}>{this.getCollaborationValue(collaboration, user, name)}</td>)}
            </tr>
        );
    };

    renderCollaborations = (collaborations, user, sorted, reverse) => {
        const names = ["name", "role", "description", "access_type", "enrollment", "organisation_name", "accepted_user_policy"];
        return (
            <section className="collaboration-list">
                <table>
                    <thead>
                    <tr>
                        {names.map(name =>
                            <th key={name} className={name}
                                onClick={this.sortTable(collaborations, name, sorted, reverse)}>
                                {I18n.t(`collaboration.${name}`)}
                                {this.headerIcon(name, sorted, reverse)}
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {collaborations.map(collaboration => this.renderCollaborationRow(collaboration, user, names))}
                    </tbody>
                </table>
            </section>
        );
    };


    renderSearch = (collaborations, user, query, loadingAutoComplete, suggestions, moreToShow, selected) => {
        const adminClassName = user.admin ? "with-button" : "";
        const showAutoCompletes = (query.length > 1 || "*" === query.trim()) && !loadingAutoComplete;

        return (
            <section className="collaboration-search">
                <div className="search">
                    <input type="text"
                           className={adminClassName}
                           onChange={this.search}
                           value={query}
                           onKeyDown={this.onSearchKeyDown}
                           placeholder={I18n.t("collaborations.searchPlaceHolder")}/>
                    {<FontAwesomeIcon icon="search" className={adminClassName}/>}
                    {user.admin && <Button onClick={() => this}
                                           txt={I18n.t("collaborations.add")}
                                           icon={<FontAwesomeIcon icon="plus"/>}/>
                    }
                </div>
                {showAutoCompletes && <Autocomplete suggestions={suggestions}
                                                    query={query}
                                                    selected={selected}
                                                    itemSelected={this.itemSelected}
                                                    moreToShow={moreToShow}
                                                    entityName="collaborations"/>}

            </section>

        );
    };

    render() {
        const {collaborations, sortedCollaborations, query, loadingAutoComplete, suggestions, moreToShow, selected, sorted, reverse} = this.state;
        const {user} = this.props;
        return (
            <div className="mod-collaborations">
                {this.renderSearch(collaborations, user, query, loadingAutoComplete, suggestions, moreToShow, selected)}
                {/*<div className="title">*/}
                {/*<span>{I18n.t("collaborations.dashboard")}</span>*/}
                {/*</div>*/}
                <section className="info-block-container">
                    {this.renderRequests(collaborations.map(collaboration => collaboration.join_requests).flat())}
                    {this.renderInvitations(collaborations.map(collaboration => collaboration.invitations).flat())}
                    {this.renderServices(collaborations)}
                    {this.renderAuthorisations(collaborations)}
                    {this.renderProfile(user)}
                </section>
                <div className="title">
                    <span>{I18n.t("collaborations.title")}</span>
                </div>
                {this.renderCollaborations(sortedCollaborations, user, sorted, reverse)}
            </div>);
    }
}

export default Collaborations;