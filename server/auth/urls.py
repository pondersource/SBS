# -*- coding: future_fstrings -*-
white_listing = [
    "/api/images/",
    "/api/invitations/find_by_hash",
    "/api/mfa/jwks",
    "/api/mfa/sfo",
    "/api/mfa/verify2fa_proxy_authz",
    "/api/mock",
    "/api/organisation_invitations/find_by_hash",
    "/api/users/error",
    "/api/aup/info",
    "/api/service_connection_requests/approve",
    "/api/service_connection_requests/deny",
    "/api/service_connection_requests/find_by_hash",
    "/api/service_invitations/find_by_hash",
    "/api/users/authorization",
    "/api/users/me",
    "/api/users/resume-session",
    "/config",
    "/health",
    "/info",
    "/introspect"
]

mfa_listing = [
    "/api/mfa/get2fa",
    "/api/mfa/reset2fa",
    "/api/mfa/token_reset_request",
    "/api/mfa/verify2fa"
]

external_api_listing = [
    "/api/collaborations/v1",
    "/api/collaborations_services/v1",
    "/api/invitations/v1",
    "/api/organisations/v1"
]
