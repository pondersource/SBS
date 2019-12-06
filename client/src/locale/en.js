import I18n from "i18n-js";

I18n.translations.en = {
    code: "EN",
    name: "English",
    select_locale: "Select English",

    header: {
        title: "Research Access Management",
        links: {
            login: "Login",
            help: "Help",
            logout: "Logout",
            helpUrl: "https://github.com/SURFscz/SBS/wiki"
        },
        impersonator: "You are really <em>{{impersonator}}</em>,<br/>but you are impersonating <em>{{currentUser}}</em>.<br/><br/>On the <strong>Impersonate</strong> page<br/> you can change identity<br/>or become you again."

    },
    navigation: {
        home: "Home",
        registration: "Registration",
        collaborations: "Collaborations",
        organisations: "Organisations",
        services: "Services",
        profile: "Profile",
        impersonate: "Impersonate",
        aup: "AUP"
    },
    login: {
        title: "Research Access Management",
        subTitle: "Please login..."
    },
    home: {
        title: "My memberships",
        groups: "Groups",
        collaborations: "Collaborations",
        organisations: "Organisations",
        services: "Services",
        backToHome: "Back to home",
        collaborationRequest: "Request for new Collaboration",
        noOrganisations: "To request a new collaboration it is required that there is an organization linked to the institution where you logged in. This is not the case. Please contact <a href='mailto:scz-support@surfnet.nl'>scz-support@surfnet.nl</a> for more information"
    },
    forms: {
        submit: "Add",
        request: "Request",
        cancel: "Cancel",
        showMore: "More",
        hideSome: "Less",
        today: "Today",
        manage: "Overview",
        invalidInput: "Invalid input for {{name}}",
        back: "Back"
    },
    explain: {
        title: "Explanation {{subject}}",
        impersonate: "Impersonate"
    },
    user: {
        titleUpdate: "Update your user profile keys",
        ssh_key: "SSH public key",
        ssh_keyPlaceholder: "Your public SSH key to login on the service",
        ssh_keyTooltip: "Your public SSH key<br/>will be provisioned<br/>to the LDAP for this service.<br/><br/>You can also upload your public SSH key.<br/>To display hidden files on a mac<br/>enter <code>CMD-SHIFT-PERIOD</code>",
        sshKeyError: "Invalid SSH key",
        sshConvertInfo: "Convert this RFC 4716 SSH format to the OpenSSH key file format when saving the profile?",
        totp_key: "TOTP key",
        totp_keyPlaceholder: "Your Google authenticator key",
        totp_keyTooltip: "Google Authenticator key",
        tiqr_key: "Tiqr key",
        tiqr_keyPlaceholder: "Your tiqr key",
        tiqr_keyTooltip: "Tiqr key",
        ubi_key: "Your YUBI key",
        ubi_keyPlaceholder: "Generic U2F/CTAP support",
        ubi_keyTooltip: "Generic U2F/CTAP support",
        update: "Update",
        flash: {
            updated: "Your profile has been updated"
        }
    },
    impersonate: {
        title: "Who do you want to be?",
        organisation: "Organisation",
        organisationPlaceholder: "Search and select an organisation to narrow the search result for users...",
        organisationAdminsOnly: "Only show the administrators of organisations",
        collaboration: "Collaboration",
        collaborationPlaceholder: "Search and select a collaboration to narrow the search result for users...",
        collaborationAdminsOnly: "Only show the administrators of collaborations",
        user: "User",
        userSearchPlaceHolder: "Search and select a user to impersonate...",
        userRequired: "You must first select a user before pretending to be that person",
        currentImpersonation: "Impersonation",
        noImpersonation: "You are who you are - no impersonation",
        currentImpersonationValue: "You are impersonating {{currentUser}}, but you are really {{impersonator}}",
        startImpersonation: "Impersonate",
        clearImpersonation: "Stop impersonating"
    },
    registration: {
        title: "Request access to the resources of {{collaboration}}",
        start: "Start",
        formTitle: "Request access to the resources of {{collaboration}}",
        formEndedTitle: "Your request to join {{collaboration}} is sent for review",
        request: "Request",
        continue: "Continue",
        requiredCollaboration: "Invalid request: collaboration needs to be specified.",
        noJoinRequestCollaboration: "Collaboration {{name}} has disabled join requests. You can not request memberships",
        unknownCollaboration: "The collaboration with the name {{collaboration}} does not exists",
        step1: {
            title: "Link your account",
            sub: "Select organisation",
            icon: "link",
            tooltip: "You will be redirected to select<br/>your organisation and after you<br/>have logged in you will be<br/>redirected to proceed with step 2.",
        },
        step2: {
            title: "Request access",
            sub: "Motivation & Terms",
            icon: "book",
            tooltip: "When you have chosen your organisation<br/> then you'll need to optionally <br/>motivate your request <br/>and review and accept our terms",
            registrationInfo: "We will register the following information:",
            motivationInfo: "Why would you like to join the collaboration {{collaboration}}?",
            motivationPlaceholder: "Describe your work or need to access the resources of the collaboration in order for an admin to grant you the proper user rights.",
            reference: "Do you have a reference within {{collaboration}}?",
            referencePlaceholder: "Write down the names of people you know within {{collaboration}} like co-researchers.",
            policy: "Our Policy",
            personalDataConfirmation: "I agree that the personal data as displayed above might be transmitted to services that are connected to collaboration {{name}}.",
            policyConfirmation: "I have read the <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"{{aup}}\"'>Acceptable Use Policy</a> of {{collaboration}} and accept it",
            noAup: "Collaboration {{name}} has not provided a link to an Acceptable Use Policy."
        },
        step3: {
            title: "Wait for approval",
            sub: "Approved or denied",
            icon: "gavel",
            tooltip: "As a last step we will sent a mail <br/>to the administrator of the service<br/>who will either approve or deny your request.",
            info: "Your request has been sent to the collaboration manager who will review your application.<br/>His / her decision will be communicated to you by e-mail",
            contact: "Still haven't received a message from us? Please contact us via <a href=\"mailto:{{mail}}\">{{mail}}</a>"
        },
        flash: {
            info: "Step {{step}} successfully finished.",
            success: "Your request to join {{name}} is sent for review",
            alreadyMember: "Invalid join request: you are already a member of collaboration {{name}}",
        }
    },
    profile: {
        name: "Name",
        email: "E-mail",
        uid: "UID",
        affiliation: "Affiliation",
        nick_name: "Nick name",
        schac_home_organisation: "Institute abbreviation",
        edu_members: "EDU memberships",
        superUser: "Super User",
        role: "Role",
        member: "Member",
        admin: "Admin",
        organisation: "Organisation",
        organisations: "Organisations",
        sbs: "Application",
        collaborations: "Collaborations",
    },
    collaborations: {
        dashboard: "Dashboard",
        dashboardAdmin: "Admin dashboard for my Collaborations",
        dashboardAdminTooltip: "This is an aggregated view<br/>of all collaborations where<br/>you are one of the administrators.",
        title: "My Collaborations",
        requests: "Join Requests",
        groups: "Groups",
        invitations: "Invitations",
        services: "Services",
        add: "Create new Collaboration",
        searchPlaceHolder: "SEARCH FOR ALL COLLABORATIONS..."
    },
    accessTypes: {
        open: "Open",
        closed: "Closed",
        on_acceptance: "On acceptance"
    },
    collaboration: {
        title: "Add new collaboration",
        requestTitle: "Request a new collaboration",
        actions: "",
        name: "Name",
        namePlaceHolder: "The unique name of a collaboration",
        shortName: "Short name",
        shortNamePlaceHolder: "Unique short name of the collaboration",
        shortNameTooltip: "Assign short names to collaborations<br/>so that these short names can be used<br/>in the ldap services (like Linux group names)",
        globalUrn: "Global urn",
        globalUrnTooltip: "Global unique and read-only urn<br/>based on the short names of the organisation,<br/>and this collaboration.",
        identifier: "Identifier",
        identifierTooltip: "Generated, unique and immutable<br/>identifier of a collaboration<br/>which used as identifier<br/>for external systems",
        joinRequestUrl: "Join Request URL",
        joinRequestUrlTooltip: "URL for non-members to<br/> join this collaboration.<br/><br/>The URL can be communicated<br/>to service providers that offer<br/>their service within this collaboration",
        disableJoinRequests: "Disable Join request for this collaboration",
        disableJoinRequestsTooltip: "When checked non-members of this<br/>collaboration can not issue a Join request.",
        description: "Description",
        descriptionPlaceholder: "The description of the collaboration is visible to anyone",
        access_type: "Access Type",
        accessTypePlaceholder: "Select an access type...",
        enrollment: "Enrollment",
        enrollmentPlaceholder: "The enrollment of a collaboration",
        enrollmentTooltip: "Determines the process<br/>through which members enroll at<br/>this collaboration",
        message: "Message",
        messagePlaceholder: "Personal message to the administrators",
        motivation: "Motivation",
        motivationPlaceholder: "Motivation for the new collaboration",
        messageTooltip: "The message will be included in the<br/>e-mail invitation to the administrators.",
        organisation_name: "Organisation",
        organisationPlaceholder: "Select the organisation for this collaboration...",
        organisationTooltip: "Every collaboration belongs to<br/>precisely one and only one organisation",
        accepted_user_policy: "AUP",
        acceptedUserPolicyPlaceholder: "The URL of the Acceptable Use Policy",
        role: "Role",
        newTitle: "Add new collaboration",
        subTitle: "Enter / edit the collaboration details. You will become an administrator of the new collaboration.",
        alreadyExists: "An collaboration with {{attribute}} {{value}} already exists in organisation {{organisation}}.",
        required: "The {{attribute}} is required for a collaboration",
        administrators: "Administrators",
        administratorsPlaceholder: "Invite administrators by e-mail",
        administratorsTooltip: "Administrators of a collaboration <br/>can edit their collaborations and<br/>invite members.<br/><br/>Add e-mail addresses separated by comma, space <br/>or semi-colon or one-by-one using <br/>the enter key.",
        members: "Regular users",
        selectRole: "Select a role...",
        manager: "Manager",
        admin: "CO Manager",
        member: "Regular user",
        flash: {
            created: "Collaboration {{name}} was successfully created",
            requested: "Collaboration {{name}} was successfully requested"
        }
    },
    collaborationDetail: {
        title: "Details collaboration {{name}}",
        backToCollaborations: "Back to my collaborations",
        backToHome: "Back to home",
        backToCollaborationDetail: "Back to my collaboration {{name}}",
        update: "Update",
        delete: "Delete",
        deleteConfirmation: "Are you sure you want to delete this collaboration?",
        deleteMemberConfirmation: "Are you sure you want to delete the collaboration membership for {{name}}?",
        flash: {
            updated: "Collaboration {{name}} was successfully updated",
            deleted: "Collaboration {{name}} was successfully deleted",
            memberDeleted: "Membership of {{name}} was successfully deleted",
            memberUpdated: "The role of membership of {{name}} was successfully updated to {{role}}",
        },
        infoBlocks: "Dashboard {{name}}",
        searchPlaceHolder: "Search for members",
        members: "Members of {{name}}",
        member: {
            user__name: "Name",
            user__email: "E-mail",
            user__uid: "UID",
            role: "Role",
            created_at: "Since",
            actions: ""
        },
        invite: "Invite new members",

    },
    organisations: {
        dashboard: "Dashboard",
        title: "My Organisations",
        members: "Members",
        collaborations: "Collaborations",
        invitations: "Invitations",
        collaborationRequests: "Collaboration requests",
        add: "Create new Organisation",
        searchPlaceHolder: "SEARCH FOR ALL ORGANISATIONS...",
        deleteConfirmation: "Are you sure you want to delete Service {{name}}?"
    },
    services: {
        title: "Services",
        add: "Create new Service",
        searchPlaceHolder: "SEARCH FOR ALL SERVICES..."
    },
    service: {
        titleNew: "Create new service",
        titleUpdate: "Update service {{name}}",
        titleReadOnly: "Service {{name}}",
        backToServices: "Back to services",
        name: "Name",
        namePlaceHolder: "The unique name of the service",
        entity_id: "Entity ID",
        entity_idPlaceHolder: "The unique entity ID of the service",
        entity_idTooltip: "The unique entity ID of the <br/>Service links the Service<br/>to the external Service Provider",
        description: "Description",
        descriptionPlaceholder: "The description of the service",
        address: "Address",
        addressPlaceholder: "The address of the service",
        identity_type: "Identity type",
        identity_typePlaceholder: "The identity type of the service",
        identity_typeTooltip: "The primary way of<br/>identification for this service",
        uri: "URI",
        uriPlaceholder: "The URI of the service",
        uriTooltip: "URI containing information <br/>about this service",
        accepted_user_policy: "AUP",
        accepted_user_policyPlaceholder: "The Acceptable Use Policy (AUP) of the service",
        accepted_user_policyTooltip: "An acceptable use policy (AUP)<br/>is a document stipulating constraints<br/>and practices that a user<br/>must agree to for access<br/>to a corporate network or<br/>the Internet.",
        contact_email: "E-mail contact",
        contact_emailPlaceholder: "The e-mail address of the contact person of this service",
        contact_emailTooltip: "This e-mail address will be<br/>used as primary contact.",
        status: {
            name: "Status",
            active: "Active",
            in_active: "In-active"
        },
        statusPlaceholder: "The status of the service",
        alreadyExists: "A service with {{attribute}} {{value}} already exists.",
        required: "The {{attribute}} is required for a service",
        deleteConfirmation: "Are you sure you want to delete service {{name}}?",
        add: "Create",
        update: "Update",
        delete: "Delete",
        cancel: "Cancel",
        flash: {
            created: "Service {{name}} was successfully created",
            updated: "Service {{name}} was successfully updated",
            deleted: "Service {{name}} was successfully deleted"
        }
    },
    organisation: {
        title: "Add new organisation",
        subTitle: "Enter / edit the organisation details.",
        actions: "",
        name: "Name",
        namePlaceHolder: "The unique name of an organisation",
        tenantPlaceHolder: "The unique tenant / organisation identifier linking the organisation to an institute",
        shortName: "Short name",
        shortNamePlaceHolder: "Short name of the organisation",
        shortNameTooltip: "Assign short names to organisations<br/>so that these short names can be used<br/>in the ldap services (like Linux directory names)",
        description: "Description",
        descriptionPlaceholder: "The description of the organisation is visible to anyone",
        schacHomeOrganisation: "Schac Home",
        schacHomeOrganisationPlaceholder: "The Schac Home Organisation of the organisation",
        schacHomeOrganisationTooltip: "A person's home organization based<br/>on the domain name of the institution.",
        created: "Created at",
        message: "Message",
        messagePlaceholder: "Personal message to the administrators",
        messageTooltip: "The message will be included in the<br/>e-mail invitation to the administrators.",
        alreadyExists: "An organisation with {{attribute}} {{value}} already exists.",
        required: "The {{attribute}} is required for an organisation",
        administrators: "Administrators",
        administratorsPlaceholder: "Invite administrators by e-mail",
        filePlaceholder: "Select csv or txt file...",
        fileImportResult: "Imported {{nbr}} e-mail addresses from {{fileName}}",
        fileExtensionError: "Only .csv extension files are allowed",
        administratorsTooltip: "Administrators of an organisation <br/>can create collaborations in their organisations.<br/><br/>Add e-mail addresses separated by comma, space <br/>or semi-colon or one-by-one using <br/>the enter key.",
        role: "Role",
        new: "Create new Organisation",
        admin: "CO Manager",
        manager: "Manager",
        member: "Member",
        yourself: "{{name}} (it's You)",
        anotherAdmin: "It is highly recommended to invite administrators.",
        deleteConfirmation: "Are you sure you want to delete this organisation?",
        flash: {
            created: "Organisation {{name}} was successfully created"
        }
    },
    organisationDetail: {
        backToOrganisations: "Back to my organisations",
        backToOrganisationDetail: "Back to my organisation {{name}}",
        title: "Details organisation {{name}}",
        back: "Back to my organisations",
        members: "Members of {{name}}",
        invitations: "Invitations for {{name}}",
        searchPlaceHolder: "Search for members",
        invite: "Invite new members",
        newApiKey: "Add new API key",
        noInvitations: "No pending invitations",
        member: {
            user__name: "Name",
            user__email: "E-mail",
            user__uid: "UID",
            role: "Role",
            created_at: "Since",
            actions: ""
        },
        invitation: {
            actions: "",
            invitee_email: "Invitee e-mail",
            user__name: "Invited by",
            expiry_date: "Expires",
            noExpires: "N/A",
            message: "Message",
        },
        collaboration: {
            name: "Name",
            description: "Description",
            short_name: "Short name",
            global_urn: "Global urn",
            accepted_user_policy: "AUP",
            created_at: "Since",
            actions: "",
            link: ""
        },
        apiKeys: "API Keys of {{name}}",
        collaborations: "Collaborations of {{name}}",
        newCollaboration: "Create new collaboration",
        searchPlaceHolderCollaborations: "Search for collaborations",
        update: "Update",
        delete: "Delete",
        deleteMemberConfirmation: "Are you sure you want to delete the organisation membership for {{name}}?",
        deleteApiKeyConfirmation: "Are you sure you want to delete this API key?",
        deleteCollaborationConfirmation: "Are you sure you want to delete collaboration {{name}}?",
        flash: {
            updated: "Organisation {{name}} was successfully updated",
            deleted: "Organisation {{name}} was successfully deleted",
            memberDeleted: "Membership of {{name}} was successfully deleted",
            apiKeyDeleted: "API key was successfully deleted",
            collaborationDeleted: "Collaboration {{name}} was successfully deleted",
        },
        tabs: {
            form: "Invitation details",
            preview: "Invitation preview",
        }
    },
    joinRequest: {
        title: "Join request from {{requester}} for collaboration {{collaboration}}",
        message: " Motivation",
        messageTooltip: "The motivation from {{name}} for this join request",
        reference: "Reference",
        referenceTooltip: "The references {{name}} has within collaboration {{collaboration}}",
        collaborationName: "Collaboration",
        userName: "User",
        decline: "Decline",
        accept: "Accept",
        declineConfirmation: "Are you sure you want to decline this join request?",
        flash: {
            declined: "Join request for collaboration {{name}} was declined",
            accepted: "Join request for collaboration {{name}} was accepted",
            notFound: "This join request has already been accepted / declined.",
            alreadyMember: "You are already a member of collaboration {{name}} and can therefore not accept this invitation"
        }
    },
    organisationInvitation: {
        title: "Invitation to join organisation {{organisation}}",
        backToOrganisationDetail: "Back to my organisation {{name}}",
        createTitle: "Send invitations to join organisation {{organisation}}",
        organisationName: "Name",
        organisationDescription: "Description",
        organisationAdministrators: "Administrators",
        requiredAdministrator: "At least one administrator e-mail address is required for an invitation for an organisation",
        expiryDate: "Expiry date",
        expiryDateTooltip: "The expiry date of the invitation<br/>After this date the invitation can<br/>not be accepted anymore",
        message: "Message",
        messageTooltip: "The user {{name}} has invited you with this message",
        fileImportResult: "Imported {{nbr}} e-mail addresses from {{fileName}}",
        fileExtensionError: "Only .csv extension files are allowed",
        inviter: "Inviter",
        decline: "Decline",
        accept: "Accept",
        invite: "Invite",
        delete: "Delete",
        resend: "Resend",
        declineInvitation: "Are you sure you want to decline this invitation?",
        deleteInvitation: "Are you sure you want to delete this invitation?",
        resendInvitation: "Are you sure you want to resend this invitation?",
        expired: "This invitation expired on {{expiry_date}} and can not be accepted anymore",
        expiredAdmin: "This invitation expired on {{expiry_date}}. Resend the invitation to reset the expiry date to 14 days",
        flash: {
            inviteDeclined: "Invitation for organisation {{name}} was declined",
            inviteDeleted: "Invitation for organisation {{name}} was deleted",
            inviteResend: "Invitation for organisation {{name}} was resend",
            inviteAccepted: "Invitation for organisation {{name}} was accepted",
            created: "Invitions for organisation {{name}} are created",
            alreadyMember: "The invitation could not be accepted because you are already a member of this organization",
            notFound: "This invitation has already been accepted / declined."
        },
    },
    apiKeys: {
        title: "Create API key for {{organisation}}",
        info: "With API keys the Application Programmer Interface (API) of the Research Access Management can be used. For more details see <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://github.com/SURFscz/SBS/wiki/External-API\"'>the wiki</a>.",
        backToOrganisationDetail: "Back to my organisation {{name}}",
        secretDisclaimer: "Copy the secret and store it somewhere safe. You can view this code only once. After pressing 'Add' you won't be able to see it again, except by deleting it and recreating a new key",
        secret: "Secret",
        secretValue: "One-way hashed Secret",
        secretTooltip: "The secret to use in the Authorization header",
        description: "Description",
        descriptionPlaceHolder: "Description for this API key",
        descriptionTooltip: "An optional description explaining the use of this API key",
        flash: {
            created: "API key for organisation {{name}} is created",
        },
        submit: "Submit"
    },
    invitation: {
        title: "Invitation to join collaboration {{collaboration}}",
        createTitle: "Send invitations to join collaboration {{collaboration}}",
        collaborationName: "Name",
        collaborationDescription: "Description",
        collaborationAdministrators: "Administrators",
        invitees: "Invitees",
        inviteesPlaceholder: "Invite users by e-mail",
        inviteesTooltip: "This personal message is<br/>included in the e-mail sent <br/>to the persons you invite",
        intendedRole: "CO Permissions",
        intendedRoleTooltip: "The permissions granted to all invitees.<br/><br/>CO Managers of a collaboration<br/>can edit their collaborations and<br/>invite members.<br/>Regular users can only use the services of <br/>their groups",
        invitee_email: "Invitee e-mail",
        groupsPlaceHolder: "Select Groups",
        groupsTooltip: "Select the Groups where<br/>the invitees become a member<br/>after accepting this invite",
        groups: "Groups",
        requiredEmail: "At least one e-mail address is required for an invitation for a collaboration",
        requiredRole: "You must choose the intended role for the collaboration membership",
        message: "Message",
        messagePlaceholder: "Personal message to the administrators",
        messageTooltip: "The message will be included in the<br/>e-mail invitation to the administrators.",
        inviteesMessagesTooltip: "Add e-mail addresses separated by comma, space <br/>or semi-colon or one-by-one using <br/>the enter key.<br/>You can also upload a csv file<br/>with comma-separated e-mail addresses.",
        inviteesMessagePlaceholder: "Personal message to the invitees",
        inviter: "Inviter",
        decline: "Decline",
        accept: "Accept",
        delete: "Delete",
        resend: "Resend",
        invite: "Invite",
        declineInvitation: "Are you sure you want to decline this invitation?",
        deleteInvitation: "Are you sure you want to delete this invitation?",
        resendInvitation: "Are you sure you want to resend this invitation?",
        expired: "This invitation expired on {{expiry_date}} and can not be accepted anymore",
        expiredAdmin: "This invitation expired on {{expiry_date}}. Resend the invitation to reset the expiry date to 14 days",
        filePlaceholder: "Select csv or txt file...",
        fileImportResult: "Imported {{nbr}} e-mail addresses from {{fileName}}",
        fileExtensionError: "Only .csv extension files are allowed",
        expiryDate: "Expiry date",
        expiryDateTooltip: "The expiry date of the invitation<br/>After this date the invitation can<br/>not be accepted anymore",
        flash: {
            inviteDeclined: "Invitation for collaboration {{name}} was declined",
            inviteAccepted: "Invitation for collaboration {{name}} was accepted",
            inviteDeleted: "Invitation for organisation {{name}} was deleted",
            inviteResend: "Invitation for organisation {{name}} was resend",
            created: "Invitations for collaboration {{name}} were successfully created"
        },
    },
    collaborationServices: {
        title: "Services for collaboration {{name}}",
        connectedServices: "Connected services to {{name}}",
        searchServices: "Search, select and add services to the available services within collaboration {{name}}",
        deleteServiceTooltip: "Make this service unavailable in<br/> the collaboration {{name}}.<br/><br/><strong>NOTE</strong>: the service itself is NOT deleted.<br/>  It is only not available anymore<br/>  for groups within<br/>  this collaboration",
        flash: {
            "added": "Successfully added service {{service}} to collaboration {{name}}",
            "deleted": "Successfully deleted service {{service}} from collaboration {{name}}",
            "addedAll": "Successfully added all services to collaboration {{name}}",
            "deletedAll": "Successfully deleted all services from collaboration {{name}}",
        },
        service: {
            open: "",
            actions: "",
            name: "Name",
            entity_id: "Entity ID",
            description: "Description"
        }
    },
    groups: {
        title: "Groups within collaboration {{name}}",
        servicesTitle: "Services for group {{name}}",
        membersTitle: "Members of group {{name}}",
        invitationsTitle: "Pending invitations to become members of group {{name}}",
        pendingInvite: "Pending invite",
        titleNew: "Create new group",
        titleUpdate: "Update group {{name}}",
        titleReadOnly: "Group {{name}}",
        backToCollaborationGroups: "Back to the groups of my collaboration {{name}}",
        new: "Create new Group",
        searchPlaceHolder: "Search for groups",
        name: "Name",
        namePlaceholder: "Name of the group",
        short_name: "Short name",
        shortNamePlaceHolder: "Short name of the group",
        shortNameTooltip: "Assign short names to groups<br/>so that these short names can be used<br/>in the ldap services (like Linux group names)",
        autoProvisionMembers: "Auto-provision new collaboration members?",
        autoProvisionMembersTooltip: "Check to automatically add all existing and<br/>future new collaboration members to this group",
        global_urn: "Global urn",
        globalUrnTooltip: "Global unique and read-only urn<br/>based on the short names of the organisation,<br/> collaboration and this group.",
        alreadyExists: "An group with {{attribute}} {{value}} already exists.",
        required: "The {{attribute}} is required for an group ",
        uri: "URI",
        uriPlaceholder: "URI of the group",
        description: "Description",
        descriptionPlaceholder: "Description of the group",
        status: "Status",
        statusPlaceholder: "The status of the group",
        actions: "",
        open: "",
        deleteConfirmation: "Are you sure you want to delete group {{name}}?",
        removeServiceConfirmation: "Are you sure you want to remove service {{name}} from this group?",
        removeServiceConfirmationDetails: "The following service specific information for this user will be deleted:",
        removeMemberConfirmation: "Are you sure you want to remove member {{name}} from this group?",
        removeMemberConfirmationDetails: "The following service specific information for this user will be deleted:",
        user: "User {{name}}",
        attributes: "Attributes",
        statusValues: {
            active: "Active",
            in_active: "In-active"
        },
        add: "Create",
        update: "Update",
        delete: "Delete",
        cancel: "Cancel",
        flash: {
            created: "Group {{name}} was successfully created",
            updated: "Group {{name}} was successfully updated",
            deleted: "Successfully deleted group {{name}}",
            addedService: "Successfully added service {{service}} to group {{name}}",
            deletedService: "Successfully deleted service {{service}} from group {{name}}",
            addedServices: "Successfully added all services to group {{name}}",
            addedMember: "Successfully added user {{member}} as a member of group {{name}}",
            addedMembers: "Successfully added all users and invitations as (future ) members of group {{name}}",
            deletedMember: "Successfully deleted user {{member}} from group {{name}}",
            addedInvitation: "Successfully added user {{member}} as a member of group {{name}}",
            deletedInvitation: "Successfully deleted invitee {{invitation}} from group {{name}}",
        },
        addAllMembers: "Add all Collaboration members and outstanding invitees to this group",
        addAllServices: "Add all Collaboration services to this group",
        searchServices: "Search, select and add services to the available services for the group {{name}}",
        connectedServices: "Connected services to {{name}}",
        deleteServiceWarning: "Warning: Unlinking services from the group deletes all user information specific for that service and all linked memberships",
        deleteServiceTooltip: "Make this service unavailable in<br/> the group {{name}}.<br/><br/><strong>NOTE</strong>: the service itself is NOT deleted.<br/>It is only no longer available<br/> for this group",
        searchMembers: "Search, select and add members to the group {{name}}",
        connectedMembers: "Members of {{name}}",
        deleteMemberWarning: "Warning: Unlinking memberships from the group deletes all user information specific for that membership and all linked services",
        deleteMemberTooltip: "Remove this member from<br/> the group {{name}}.<br/><br/><strong>NOTE</strong>: the user itself is NOT deleted.<br/>He / she is only no longer a <br/> member of this groups",
        deleteInvitationTooltip: "Remove this invitation from<br/> the group {{name}}.<br/><br/><strong>NOTE</strong>: the invitation itself is NOT deleted.<br/>He / she will not be added<br/>as a member of this group<br/>when the invitation is accepted",
        service: {
            actions: "",
            name: "Name",
            entity_id: "Entity ID",
            description: "Description"
        },
        member: {
            user__name: "Name",
            user__email: "E-mail",
            user__uid: "UID",
            role: "Role",
            created_at: "Since",
            actions: ""
        },
        invitation: {
            invitee_email: "E-mail",
            intended_role: "Role",
            expiry_date: "Expiry date",
            actions: ""
        },
    },
    aup: {
        title1: "In o rder to use the CMS services, you need to agree to a number of rules and regulations.<br>These are explained in the document below.",
        title2: "For more information and explanations, you can contact <a href='mailto:info@surconxt.org'>info@surconxt.org</a>.",
        title3: "Please read the document and if agreed check the box and proceed to the validation of your personal information",
        downloadPdf: "Download Acceptable Usage Policy (pdf)",
        agreeWithTerms: "I agree with the Acceptable Usage Policy",
        continueToValidation: "Store decision",
        agreed: "Your agreement with {{name}} has been saved."
    },
    collaborationRequest: {
        title: "{{requester}} has requested to create a new Collaboration '{{name}}'.",
        denyConfirmation: "Are you sure you want to deny this Collaboration request?",
        approve: "Approve",
        deny: "Deny",
        flash: {
            approved: "Collaboration {{name}} has been created and the Collaboration Request has been deleted",
            denied: "Collaboration Request for {{name}} has been deleted",
        }
    },
    autocomplete: {
        name: "Name",
        description: "Description",
        email: "E-mail",
        admin: "Super user",
        organisations: "Organisations",
        collaborations: "Collaborations",
        link: "Link",
        noResults: "No results",
        resultsLimited: "More entries matched than can be shown, please narrow your search ..."

    },
    inputField: {
        fileImport: "File import",
    },
    confirmationDialog: {
        title: "Please confirm",
        confirm: "Confirm",
        cancel: "Cancel",
        leavePage: "Do you really want to leave this page?",
        leavePageSub: "Changes that you made will not be saved.",
        stay: "Stay",
        leave: "Leave"
    },
    error_dialog: {
        title: "Unexpected error",
        body: "This is embarrassing; an unexpected error has occurred. It has been logged and reported. Please try again...",
        ok: "Close"
    },
    not_found: {
        title: "404",
        description_html: "The requested page could not be found",
        loginLink: "LOGIN"
    },
    footer: {
        product: "Powered by SCZ",
        productLink: "https://wiki.surfnet.nl/display/SCZ/Science+Collaboration+Zone+Home",
        privacy: "Terms & Privacy",
        privacyLink: "https://wiki.surfnet.nl/display/SCZ/SCZ+Privacy+Policy"
    }
};

export default I18n.translations.en;
