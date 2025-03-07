import React from "react";
import I18n from "i18n-js";
import "./WelcomeDialog.scss";
import "react-mde/lib/styles/css/react-mde-all.css";
import ServiceEn from "./welcome/ServiceEn";
import ServiceNl from "./welcome/ServiceNl";
import {AlertType, Modal} from "@surfnet/sds";

export default function ServiceWelcomeDialog({
                                                 name,
                                                 isOpen = false,
                                                 close
                                             }) {

    const content = () => {
        return (
            <section className={"welcome-dialog-content"}>
                <section className="responsibilities">
                    {I18n.locale === "en" ? <ServiceEn/> : <ServiceNl/>}
                </section>

            </section>)
    }
    if (!isOpen) {
        return null;
    }

    return (
        <Modal
            confirm={close}
            alertType={AlertType.Info}
            subTitle={I18n.t("welcomeDialog.roleServiceAdmin")}
            children={content()}
            title={I18n.t("welcomeDialog.title", {name: name})}
            confirmationButtonLabel={I18n.t("welcomeDialog.ok", {type: I18n.t("welcomeDialog.organisation")})}
            className={"welcome-dialog"}
        />
    );

}

