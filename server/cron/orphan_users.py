import datetime
import logging
import time

from flask import jsonify

from server.cron.shared import obtain_lock
from server.db.audit_mixin import AuditLog
from server.db.db import db
from server.db.domain import User
from server.mail import mail_membership_orphan_users_deleted

orphan_users_lock_name = "orphan_users_lock_name"


def _result_container():
    return {"orphan_users": []}


def _do_orphan_users(app):
    with app.app_context():
        cfq = app.app_config.orphan_users

        now = datetime.datetime.utcnow()

        start = int(time.time() * 1000.0)
        logger = logging.getLogger("scheduler")
        logger.info("Start running orphan_users job")

        delete_date_threshold = now - datetime.timedelta(days=cfq.delete_days_threshold)

        audit_log_subquery = ~AuditLog.query \
            .filter(AuditLog.user_id == User.id) \
            .filter(AuditLog.target_type.not_in(["aups", "users"])) \
            .exists()
        query_filter = User.query.filter(audit_log_subquery).filter(User.created_at < delete_date_threshold)
        users = query_filter.all()

        if users:
            mail_membership_orphan_users_deleted(users)
            query_filter.delete(synchronize_session="fetch")

        db.session.commit()

        end = int(time.time() * 1000.0)
        logger.info(f"Finished running orphan_users job in {end - start} ms")

        return {"orphan_users": jsonify([user.email for user in users]).json}


def delete_orphan_users(app):
    return obtain_lock(app, orphan_users_lock_name, _do_orphan_users, _result_container)
