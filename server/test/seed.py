import datetime
import uuid
from secrets import token_urlsafe

from server.db.db import User, Organisation, OrganisationMembership, Service, Collaboration, CollaborationMembership, \
    JoinRequest, Invitation, metadata, UserServiceProfile, AuthorisationGroup, OrganisationInvitation
from server.db.defaults import default_expiry_date

organisation_invitation_hash = token_urlsafe()
invitation_hash_curious = token_urlsafe()
invitation_hash_no_way = token_urlsafe()
collaboration_ai_computing_uuid = str(uuid.uuid4())
ai_computing_name = "AI computing"
uuc_name = "UUC"
collaboration_uva_researcher_uuid = str(uuid.uuid4())

service_mail_name = "Mail Services"
service_mail_entity_id = "https://mail"

service_network_name = "Network Services"
service_network_entity_id = "https://network"


def _persist(db, *objs):
    required_attrs = ["created_by", "updated_by"]
    for obj in objs:
        for attr in required_attrs:
            if hasattr(obj, attr):
                setattr(obj, attr, "urn:admin")
        db.session.add(obj)


def seed(db):
    for table in reversed(metadata.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()

    john = User(uid="urn:john", name="John Doe", email="john@example.org")
    peter = User(uid="urn:peter", name="Peter Doe", email="peter@example.org")
    mary = User(uid="urn:mary", name="Mary Doe", email="mary@example.org")
    admin = User(uid="urn:admin", name="The Boss", email="boss@example.org")
    roger = User(uid="urn:roger", name="Roger Doe", email="roger@example.org")
    harry = User(uid="urn:harry", name="Harry Doe", email="harry@example.org")

    _persist(db, john, mary, peter, admin, roger, harry)

    uuc = Organisation(name=uuc_name, tenant_identifier="https://uuc", description="Unincorporated Urban Community",
                       created_by="urn:admin",
                       updated_by="urnadmin")
    uva = Organisation(name="Amsterdam UVA", tenant_identifier="https://uva", description="University of Amsterdam",
                       created_by="urn:admin",
                       updated_by="urnadmin")
    _persist(db, uuc, uva)

    organisation_invitation_roger = OrganisationInvitation(message="Please join", hash=organisation_invitation_hash,
                                                           expiry_date=datetime.date.today() + datetime.timedelta(
                                                               days=14),
                                                           invitee_email="roger@example.org", organisation=uuc,
                                                           user=john)
    organisation_invitation_pass = OrganisationInvitation(message="Let me please join as I "
                                                                  "really, really, really \n really, "
                                                                  "really, really \n want to...",
                                                          hash=token_urlsafe(),
                                                          expiry_date=datetime.date.today() + datetime.timedelta(
                                                              days=21),
                                                          invitee_email="pass@example.org", organisation=uuc, user=john)
    _persist(db, organisation_invitation_roger, organisation_invitation_pass)

    organisation_membership_john = OrganisationMembership(role="admin", user=john, organisation=uuc)
    organisation_membership_mary = OrganisationMembership(role="admin", user=mary, organisation=uuc)
    organisation_membership_harry = OrganisationMembership(role="admin", user=harry, organisation=uuc)
    _persist(db, organisation_membership_john, organisation_membership_mary, organisation_membership_harry)

    mail = Service(entity_id=service_mail_entity_id, name=service_mail_name, contact_email=john.email)
    network = Service(entity_id=service_network_entity_id, name=service_network_name,
                      description="Network enabling service SSH access",
                      status="pending")
    _persist(db, mail, network)

    ai_computing = Collaboration(name=ai_computing_name,
                                 identifier=collaboration_ai_computing_uuid,
                                 description="Artifical Intelligence computing for the Unincorporated Urban Community",
                                 organisation=uuc, services=[mail, network],
                                 join_requests=[], invitations=[])
    uva_research = Collaboration(name="UVA UCC research",
                                 identifier=collaboration_uva_researcher_uuid,
                                 description="University of Amsterdam Research - Urban Crowd Control",
                                 organisation=uva, services=[],
                                 join_requests=[], invitations=[])
    _persist(db, ai_computing, uva_research)

    john_ai_computing = CollaborationMembership(role="researcher", user=john, collaboration=ai_computing)
    admin_ai_computing = CollaborationMembership(role="admin", user=admin, collaboration=ai_computing)
    _persist(db, john_ai_computing, admin_ai_computing)

    user_service_profile = UserServiceProfile(service=network, collaboration_membership=john_ai_computing,
                                              name="John Doe", telephone_number="0612345678",
                                              ssh_key="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC/nvjea1zJJNCnyUfT6HLcHD"
                                                      "hwCMp7uqr4BzxhDAjBnjWcgW4hZJvtLTqCLspS6mogCq2d0/31DU4DnGb2MO28"
                                                      "gk74MiVBtAQWI5+TsO5QHupO3V6aLrKhmn8xn1PKc9JycgjOa4BMQ1meomn3Z"
                                                      "mph6oo87MCtF2w75cxYEBJ9dJgHzZsn9mw+w8Z3H1vYnkcBT/i2MIK+qfsue/t"
                                                      "vEe8ybi+26bGQIZIPDcd+OmDUBxDLWyBwCbVOyRL5M6ywnWJINLdpIwfqCUk24"
                                                      "J1q1qiJ5eZu0m0uDcG5KRzgZ+grnSSYBwCx1xCunoGjMg7iwxEMgScD02nKtii"
                                                      "jxEpu8soL okke@Mikes-MBP-2.fritz.box")
    _persist(db, user_service_profile)

    authorisation_group = AuthorisationGroup(name="auth_group", collaboration=ai_computing, services=[network],
                                             collaboration_memberships=[john_ai_computing])
    _persist(db, authorisation_group)

    join_request_john = JoinRequest(message="Please...", reference="Dr. Johnson", user=mary, collaboration=ai_computing)
    join_request_peter = JoinRequest(message="Please...", user=peter, collaboration=ai_computing)
    _persist(db, join_request_john, join_request_peter)

    invitation = Invitation(hash=invitation_hash_curious, invitee_email="curious@ex.org", collaboration=ai_computing,
                            expiry_date=default_expiry_date(), user=admin, message="Please join...")
    invitation_noway = Invitation(hash=invitation_hash_no_way, invitee_email="noway@ex.org", collaboration=ai_computing,
                                  expiry_date=datetime.date.today() + datetime.timedelta(days=21), user=admin,
                                  message="Let me please join as I really, really, really \n really, "
                                          "really, really \n want to...")
    _persist(db, invitation, invitation_noway)

    db.session.commit()
