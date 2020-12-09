import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {ReactComponent as NotFoundIcon} from "../../icons/image-not-found.svg";
import "./CroppedImageField.scss";
import {isEmpty} from "../../utils/Utils";
import "react-image-crop/lib/ReactCrop.scss";
import Logo from "./Logo";
import Button from "../Button";
import CroppedImageDialog from "./CroppedImageDialog";
import ConfirmationDialog from "../ConfirmationDialog";

export default class CroppedImageField extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            error: "",
            dialogOpen: false,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => true
        }
    }

    onInternalChange = (val) => {
        this.setState({dialogOpen: false});
        const {onChange} = this.props;
        setTimeout(() => onChange(val), 425);
    }

    closeDialog = () => this.setState({dialogOpen: false});

    confirmDelete = () => this.setState({
        confirmationDialogOpen: true,
        confirmationDialogAction: () => {
            this.props.onChange(null);
            this.setState({confirmationDialogOpen: false});
        }
    });

    render() {
        const {error, dialogOpen, confirmationDialogOpen, confirmationDialogAction} = this.state;
        const {title, name, value, secondRow = false, initial = false} = this.props;
        return (
            <div className={`cropped-image-field ${secondRow ? "second-row" : ""}`}>
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={() => this.setState({confirmationDialogOpen: false})}
                                    confirm={confirmationDialogAction}
                                    isWarning={true}
                                    question={I18n.t("forms.imageDeleteConfirmation")}/>
                <CroppedImageDialog onSave={this.onInternalChange} onCancel={this.closeDialog} isOpen={dialogOpen}
                                    name={name} value={value} title={title}/>
                <label className="info" htmlFor="">{title}</label>
                <section className="file-upload">
                    {!value && <div className="no-image">
                        {<NotFoundIcon/>}
                    </div>}
                    {value &&
                    <div className="preview">
                        {value && <Logo className="cropped-img" src={value}/>}
                    </div>}
                    <div className="file-upload-actions">
                        <Button txt={I18n.t("forms.add")} onClick={() => this.setState({dialogOpen: true})}/>
                        {value && <Button warningButton={true} onClick={this.confirmDelete}/>}
                    </div>
                </section>
                {!isEmpty(error) && <span className="error">{error}</span>}
                {(!initial && isEmpty(value)) && <span className="error">{I18n.t("forms.imageRequired")}</span>}
            </div>
        );
    }

}

CroppedImageField.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isNew: PropTypes.bool.isRequired,
    title: PropTypes.string,
    value: PropTypes.string,
    secondRow: PropTypes.bool,
    disabled: PropTypes.bool,
    initial: PropTypes.bool,
};
