# -*- coding: future_fstrings -*-
import atexit
import logging
import threading

from apscheduler.schedulers.background import BackgroundScheduler

from server.cron.cleanup_non_open_requests import cleanup_non_open_requests
from server.cron.collaboration_expiration import expire_collaborations
from server.cron.collaboration_inactivity_suspension import suspend_collaborations
from server.cron.idp_metadata_parser import parse_idp_metadata
from server.cron.membership_expiration import expire_memberships
from server.cron.outstanding_requests import outstanding_requests
from server.cron.user_suspending import suspend_users


def start_scheduling(app):
    scheduler = BackgroundScheduler()
    retention = app.app_config.retention
    scheduler.add_job(func=suspend_users, trigger="cron", kwargs={"app": app}, day="*", hour=retention.cron_hour_of_day)
    scheduler.add_job(func=parse_idp_metadata, trigger="cron", kwargs={"app": app}, day="*",
                      hour=retention.cron_hour_of_day)
    if app.app_config.platform_admin_notifications.enabled:
        scheduler.add_job(func=outstanding_requests, trigger="cron", kwargs={"app": app}, day="*",
                          hour=app.app_config.platform_admin_notifications.cron_hour_of_day)
    if app.app_config.collaboration_expiration.enabled:
        scheduler.add_job(func=expire_collaborations, trigger="cron", kwargs={"app": app}, day="*",
                          hour=app.app_config.collaboration_expiration.cron_hour_of_day)
    if app.app_config.collaboration_suspension.enabled:
        scheduler.add_job(func=suspend_collaborations, trigger="cron", kwargs={"app": app}, day="*",
                          hour=app.app_config.collaboration_suspension.cron_hour_of_day)
    if app.app_config.membership_expiration.enabled:
        scheduler.add_job(func=expire_memberships, trigger="cron", kwargs={"app": app}, day="*",
                          hour=app.app_config.membership_expiration.cron_hour_of_day)
    if app.app_config.user_requests_retention.enabled:
        scheduler.add_job(func=cleanup_non_open_requests, trigger="cron", kwargs={"app": app}, day="*",
                          hour=app.app_config.user_requests_retention.cron_hour_of_day)
    scheduler.start()

    logger = logging.getLogger("scheduler")
    jobs = scheduler.get_jobs()

    logger.info(f"Running next suspend_users job at {jobs[0].next_run_time}")
    logger.info(f"Running next parse_idp_metadata job at {jobs[1].next_run_time}")
    if app.app_config.platform_admin_notifications.enabled:
        logger.info(f"Running next outstanding_requests job at {jobs[2].next_run_time}")

    if app.app_config.metadata.get("parse_at_startup", False):
        threading.Thread(target=parse_idp_metadata, args=(app,)).start()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
    return scheduler
