import React from "react";
import I18n from "i18n-js";
import Cookies from "js-cookie";
import {replaceQueryParameter} from "../utils/QueryParameters";
import {stopEvent} from "../utils/Utils";
import moment from "moment-timezone";
import "./LanguageSelector.scss"
import {languageSwitched} from "../utils/Date";

export default class LanguageSelector extends React.PureComponent {

    handleChooseLocale = locale => e => {
        stopEvent(e);
        Cookies.set("lang", locale, {expires: 356, secure: document.location.protocol.endsWith("https")});
        I18n.locale = locale;
        moment.locale(locale);
        languageSwitched();
        window.location.search = replaceQueryParameter(window.location.search, "lang", locale);
    };

    renderLocaleChooser(locale) {
        return (
            <a href={"locale"} className={`${I18n.currentLocale() === locale ? "is-active" : ""}`}
               title={I18n.t("select_locale", {locale: locale})}
               onClick={this.handleChooseLocale(locale)}>
                {I18n.t("code", {locale: locale})}
            </a>
        );
    }

    render() {
        return (
            <nav className="sds--language-switcher sds--text--body--small" aria-label="Language">
                <ul>
                    <li>{this.renderLocaleChooser("nl")}
                        <span className="sds--language-sds--divider">|</span>
                    </li>
                    <li>
                        {this.renderLocaleChooser("en")}
                    </li>
                </ul>
            </nav>
        );
    }
}
