import React from "react";
import "./InputField.scss";
import Button from "./Button";
import I18n from "i18n-js";

export default function UploadButton({
                                         name,
                                         onFileUpload = null,
                                         acceptFileFormat = "text/csv"
                                     }) {
    let fileInput;

    const onClick = () => {
        fileInput.click();
    };

    return (
        <div className="file-upload-button-container">
            <input type="file"
                   id={`fileUpload_${name}`}
                   ref={ref => fileInput = ref}
                   name={`fileUpload_${name}`}
                   accept={acceptFileFormat}
                   style={{display: "none"}}
                   onChange={onFileUpload}/>
            <Button txt={I18n.t("forms.uploadSSH")} onClick={onClick}/>
        </div>
    );

}
