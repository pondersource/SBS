import React from "react";
import {
    createOrganisation,
    deleteOrganisation,
    health,
    organisationById,
    organisationNameExists,
    organisationSchacHomeOrganisationExists,
    organisationShortNameExists,
    updateOrganisation
} from "../api";
import I18n from "i18n-js";
import InputField from "../components/InputField";
import "./OrganisationForm.scss";
import Button from "../components/Button";
import {ReactComponent as OrganisationsIcon} from "../icons/organisations.svg";
import {isEmpty, stopEvent} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {setFlash} from "../utils/Flash";
import {sanitizeShortName, validSchacHomeRegExp} from "../validations/regExps";
import {AppStore} from "../stores/AppStore";
import UnitHeader from "../components/redesign/UnitHeader";
import CroppedImageField from "../components/redesign/CroppedImageField";
import SelectField from "../components/SelectField";
import SpinnerField from "../components/redesign/SpinnerField";

import "react-mde/lib/styles/css/react-mde-all.css";
import OrganisationOnBoarding from "../components/OrganisationOnBoarding";
import ErrorIndicator from "../components/redesign/ErrorIndicator";
import CreatableField from "../components/CreatableField";
import EmailField from "../components/EmailField";
import CheckBox from "../components/CheckBox";


class OrganisationForm extends React.Component {

    constructor(props, context) {
        super(props, context);
        const categoryOptions = props.config.organisation_categories.map(c => ({value: c, label: c}));
        const category = categoryOptions[0];
        this.state = {
            name: "",
            description: "",
            short_name: "",
            schac_home_organisations: [],
            schac_home_organisation: "",
            invalid_schac_home_organisation: null,
            collaboration_creation_allowed: false,
            logo: "",
            services_restricted: false,
            on_boarding_msg: "",
            categoryOptions: categoryOptions,
            category: category,
            administrators: [],
            message: "",
            required: ["name", "short_name", "logo"],
            alreadyExists: {},
            initial: true,
            isNew: true,
            organisation: null,
            confirmationDialogOpen: false,
            warning: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.setState({confirmationDialogOpen: false}),
            leavePage: true,
            loading: true
        };
    }

    componentDidMount = () => {
        const params = this.props.match.params;
        if (params.id) {
            organisationById(params.id).then(org => {
                const category = org.category;
                let categoryOption = null;
                if (category) {
                    categoryOption = {value: category, label: category};
                }
                this.setState({
                    ...org,
                    organisation: org,
                    category: categoryOption,
                    isNew: false,
                    loading: false
                });
                AppStore.update(s => {
                    s.breadcrumb.paths = [
                        {path: "/", value: I18n.t("breadcrumb.home")},
                        {path: "/organisations/" + org.id, value: I18n.t("breadcrumb.organisation", {name: org.name})},
                        {value: I18n.t("home.edit")}
                    ];
                });
            });
        } else {
            health().then(() => {
                this.setState({loading: false})
                AppStore.update(s => {
                    s.breadcrumb.paths = [
                        {path: "/", value: I18n.t("breadcrumb.home")},
                        {value: I18n.t("breadcrumb.newOrganisation")}
                    ];
                });
            });
        }
    }

    existingOrganisationAttribute = attr => this.state.isNew ? null : this.state.organisation[attr];

    validateOrganisationName = e =>
        organisationNameExists(e.target.value, this.existingOrganisationAttribute("name")).then(json => {
            this.setState({alreadyExists: {...this.state.alreadyExists, name: json}});
        });

    validateOrganisationShortName = e =>
        organisationShortNameExists(sanitizeShortName(e.target.value), this.existingOrganisationAttribute("short_name")).then(json => {
            this.setState({alreadyExists: {...this.state.alreadyExists, short_name: json}});
        });

    removeValue = value => e => {
        stopEvent(e);
        const {schac_home_organisations, isNew, organisation, alreadyExists} = this.state;
        const newSchac_home_organisations = schac_home_organisations.filter(val => val.name !== value.name);
        if (!isEmpty(newSchac_home_organisations)) {
            const existingOrganisationId = isNew ? null : organisation.id;
            Promise.all(newSchac_home_organisations.map(org => organisationSchacHomeOrganisationExists(org.name, existingOrganisationId)))
                .then(res => {
                    const anyInvalid = res.filter(b => b);
                    this.setState({
                        schac_home_organisations: newSchac_home_organisations,
                        invalid_schac_home_organisation: null,
                        alreadyExists: {
                            ...alreadyExists,
                            schac_home_organisations: isEmpty(anyInvalid) ? null : anyInvalid
                        }
                    });
                })
        } else {
            this.setState({
                schac_home_organisations: [],
                invalid_schac_home_organisation: null,
                alreadyExists: {...alreadyExists, schac_home_organisations: null}
            });
        }
    };

    addValue = e => {
        stopEvent(e);
        const schac_home_organisation = e.target.value;
        const {schac_home_organisations, isNew, organisation, alreadyExists} = this.state;
        if (!isEmpty(schac_home_organisation)) {
            const invalid = !validSchacHomeRegExp.test(schac_home_organisation.trim());
            const duplicate = schac_home_organisations.find(sho => sho.name === schac_home_organisation.trim());
            if (invalid || duplicate) {
                const invalid_schac_home_organisation = I18n.t(`organisation.${invalid ? "invalidSchacHome": "duplicateSchacHome"}`,
                    {schac: schac_home_organisation.trim()});
                this.setState({invalid_schac_home_organisation: invalid_schac_home_organisation});
            } else {
                const existingOrganisationId = isNew ? null : organisation.id;
                schac_home_organisations.push({name: schac_home_organisation});
                organisationSchacHomeOrganisationExists(schac_home_organisation, existingOrganisationId).then(schacHomeOrganisationExists => {
                    let existingSchacHomes = alreadyExists.schac_home_organisations;
                    if (schacHomeOrganisationExists) {
                        existingSchacHomes = existingSchacHomes || [];
                        existingSchacHomes.push(schac_home_organisation);
                    }
                    this.setState({
                        schac_home_organisation: "",
                        schac_home_organisations: [...schac_home_organisations],
                        alreadyExists: {...alreadyExists, schac_home_organisations: existingSchacHomes}
                    });
                });
            }
        } else {
            this.setState({schac_home_organisation: ""});
        }
        return true;
    };

    cancel = () => {
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            warning: false,
            cancelDialogAction: () => this.props.history.goBack(),
            leavePage: true
        });
    };

    delete = () => {
        this.setState({
            confirmationDialogOpen: true,
            confirmationQuestion: I18n.t("organisation.deleteConfirmation"),
            confirmationDialogAction: this.doDelete,
            warning: true,
            leavePage: false
        });
    };

    doDelete = () => {
        this.setState({confirmationDialogOpen: false});
        deleteOrganisation(this.state.organisation.id)
            .then(() => {
                this.props.history.push("/home/organisations");
                setFlash(I18n.t("organisationDetail.flash.deleted", {name: this.state.organisation.name}));
            });
    };

    isValid = () => {
        const {required, alreadyExists, administrators, isNew} = this.state;
        const inValid = Object.values(alreadyExists).some(val => val) || required.some(attr => isEmpty(this.state[attr]));
        return !inValid && (!isNew || !isEmpty(administrators));//&& !inValidOnBoarding;
    };

    doSubmit = () => {
        if (this.isValid()) {
            const {
                name, short_name, administrators, message, schac_home_organisations, description, logo,
                on_boarding_msg, category, services_restricted
            } = this.state;
            this.setState({loading: true});
            createOrganisation({
                name,
                short_name,
                category: category !== null ? category.label : null,
                schac_home_organisations,
                administrators,
                message,
                description,
                services_restricted,
                logo,
                on_boarding_msg
            }).then(res => {
                this.props.history.goBack();
                setFlash(I18n.t("organisation.flash.created", {name: res.name}))
            });
        } else {
            window.scrollTo(0, 0);
        }
    };

    submit = () => {
        const {initial, isNew} = this.state;
        const action = isNew ? this.doSubmit : this.doUpdate;
        if (initial) {
            this.setState({initial: false}, action)
        } else {
            action()
        }
    };

    doUpdate = () => {
        if (this.isValid()) {
            const {
                name, description, organisation, schac_home_organisations, collaboration_creation_allowed,
                short_name, identifier, logo, on_boarding_msg, category, services_restricted
            } = this.state;
            this.setState({loading: true});
            updateOrganisation({
                id: organisation.id,
                name,
                description,
                schac_home_organisations,
                collaboration_creation_allowed,
                services_restricted,
                short_name,
                identifier,
                logo,
                on_boarding_msg,
                category: category !== null ? category.value : null
            }).then(() => {
                this.props.history.goBack();
                setFlash(I18n.t("organisationDetail.flash.updated", {name: name}));
            });
        } else {
            window.scrollTo(0, 0);
        }
    };

    removeMail = email => e => {
        stopEvent(e);
        const {administrators} = this.state;
        const newAdministrators = administrators.filter(currentMail => currentMail !== email);
        this.setState({administrators: newAdministrators});
    };

    addEmails = emails => {
        const {administrators} = this.state;
        const uniqueEmails = [...new Set(administrators.concat(emails))];
        this.setState({administrators: uniqueEmails});
    };

    render() {
        const {
            name, description, initial, alreadyExists, administrators, message,
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, leavePage, short_name,
            schac_home_organisations, collaboration_creation_allowed, services_restricted, logo, on_boarding_msg,
            category, categoryOptions, schac_home_organisation, isNew, organisation, warning, loading, invalid_schac_home_organisation
        } = this.state;
        if (loading) {
            return <SpinnerField/>
        }
        const disabledSubmit = !initial && !this.isValid();
        const {user} = this.props;
        return (
            <div className="mod-new-organisation-container">
                {isNew && <UnitHeader obj={({name: I18n.t("models.organisations.new"), svg: OrganisationsIcon})}/>}
                {!isNew && <UnitHeader obj={organisation}
                                       name={organisation.name}
                                       history={user.admin && this.props.history}
                                       mayEdit={false}/>}
                <div className="mod-new-organisation">
                    <ConfirmationDialog isOpen={confirmationDialogOpen}
                                        cancel={cancelDialogAction}
                                        confirm={confirmationDialogAction}
                                        isWarning={warning}
                                        question={leavePage ? undefined : I18n.t("organisation.deleteConfirmation")}
                                        leavePage={leavePage}/>


                    <div className="new-organisation">

                        <h2 className="section-separator">{I18n.t("organisation.about")}</h2>

                        <InputField value={name} onChange={e => {
                            this.setState({
                                name: e.target.value,
                                alreadyExists: {...this.state.alreadyExists, name: false}
                            })
                        }}
                                    placeholder={I18n.t("organisation.namePlaceHolder")}
                                    onBlur={this.validateOrganisationName}
                                    error={alreadyExists.name || (!initial && isEmpty(name))}
                                    name={I18n.t("organisation.name")}/>
                        {alreadyExists.name && <ErrorIndicator msg={I18n.t("organisation.alreadyExists", {
                            attribute: I18n.t("organisation.name").toLowerCase(),
                            value: name
                        })}/>}
                        {(!initial && isEmpty(name)) && <ErrorIndicator msg={I18n.t("organisation.required", {
                            attribute: I18n.t("organisation.name").toLowerCase()
                        })}/>}
                        <InputField value={short_name}
                                    name={I18n.t("organisation.shortName")}
                                    placeholder={I18n.t("organisation.shortNamePlaceHolder")}
                                    onBlur={this.validateOrganisationShortName}
                                    disabled={!user.admin}
                                    onChange={e => this.setState({
                                        short_name: sanitizeShortName(e.target.value),
                                        alreadyExists: {...this.state.alreadyExists, short_name: false}
                                    })}
                                    error={alreadyExists.short_name || (!initial && isEmpty(short_name))}
                                    toolTip={I18n.t("organisation.shortNameTooltip")}/>
                        {alreadyExists.short_name && <ErrorIndicator msg={I18n.t("organisation.alreadyExists", {
                            attribute: I18n.t("organisation.shortName").toLowerCase(),
                            value: short_name
                        })}/>}
                        {(!initial && isEmpty(short_name)) && <ErrorIndicator msg={I18n.t("organisation.required", {
                            attribute: I18n.t("organisation.shortName").toLowerCase()
                        })}/>}

                        <CroppedImageField name="logo" onChange={s => this.setState({logo: s})}
                                           isNew={isNew} title={I18n.t("organisation.logo")} value={logo}
                                           initial={initial} secondRow={true}/>

                        {user.admin && <SelectField value={category}
                                                    small={true}
                                                    options={categoryOptions}
                                                    name={I18n.t("organisation.category")}
                                                    toolTip={I18n.t("organisation.categoryTooltip")}
                                                    onChange={e => this.setState({category: e})}/>}

                        <InputField value={description} onChange={e => this.setState({description: e.target.value})}
                                    placeholder={I18n.t("organisation.descriptionPlaceholder")} multiline={true}
                                    name={I18n.t("organisation.description")}/>

                        <OrganisationOnBoarding
                            on_boarding_msg={(isEmpty(on_boarding_msg) && isNew) ? I18n.t("organisation.onBoarding.template") : on_boarding_msg}
                            saveOnBoarding={val => this.setState({on_boarding_msg: val})}/>

                        <CreatableField onChange={e => this.setState({
                            schac_home_organisation: e.target.value,
                            invalid_schac_home_organisation: null
                        })}
                                        name={I18n.t("organisation.schacHomeOrganisation")}
                                        value={schac_home_organisation}
                                        values={schac_home_organisations}
                                        addValue={this.addValue}
                                        removeValue={this.removeValue}
                                        disabled={!user.admin}
                                        toolTip={I18n.t("organisation.schacHomeOrganisationTooltip")}
                                        placeholder={I18n.t("organisation.schacHomeOrganisationPlaceholder")}
                                        error={alreadyExists.schac_home_organisations}/>

                        {alreadyExists.schac_home_organisations &&
                        alreadyExists.schac_home_organisations.map(sho =>
                            <ErrorIndicator key={sho} msg={I18n.t("organisation.alreadyExists", {
                                attribute: I18n.t("organisation.schacHomeOrganisation").toLowerCase(),
                                value: sho
                            })}/>
                        )}
                        {invalid_schac_home_organisation && <ErrorIndicator msg={invalid_schac_home_organisation}/>}

                        <CheckBox name={"collaboration_creation_allowed"}
                                  value={collaboration_creation_allowed}
                                  tooltip={I18n.t("organisation.collaborationCreationAllowedTooltip")}
                                  onChange={() => this.setState({collaboration_creation_allowed: !collaboration_creation_allowed})}
                                  info={I18n.t("organisation.collaborationCreationAllowed")}
                                  readOnly={isEmpty(schac_home_organisations)}
                        />

                        <CheckBox name={"services_restricted"}
                                  value={services_restricted}
                                  tooltip={I18n.t("organisation.servicesRestrictedTooltip")}
                                  onChange={() => this.setState({services_restricted: !services_restricted})}
                                  info={I18n.t("organisation.servicesRestricted")}
                                  readOnly={!user.admin}
                        />

                        {isNew &&
                        <div>
                            <h2 className="section-separator">{I18n.t("organisation.invitations")}</h2>

                            <EmailField addEmails={this.addEmails}
                                        removeMail={this.removeMail}
                                        name={I18n.t("invitation.invitees")}
                                        isAdmin={true}
                                        error={!initial && isEmpty(administrators)}
                                        emails={administrators}/>
                        </div>}
                        {(!initial && isEmpty(administrators) && isNew) &&
                        <ErrorIndicator msg={I18n.t("organisation.required", {
                            attribute: I18n.t("organisation.administrators").toLowerCase()
                        })}/>}
                        {isNew && <InputField value={message} onChange={e => this.setState({message: e.target.value})}
                                              placeholder={I18n.t("collaboration.messagePlaceholder")}
                                              name={I18n.t("collaboration.message")}
                                              toolTip={I18n.t("collaboration.messageTooltip")}
                                              multiline={true}/>}

                        <section className="actions">
                            {(user.admin && !isNew) &&
                            <Button warningButton={true} onClick={this.delete}/>}
                            <Button cancelButton={true} txt={I18n.t("forms.cancel")} onClick={this.cancel}/>
                            <Button disabled={disabledSubmit} txt={I18n.t("forms.save")} onClick={this.submit}/>
                        </section>
                    </div>
                </div>
            </div>);
    }
}

export default OrganisationForm;