import React from "react";
import {collaborationById} from "../api";
import "./Collaboration.scss";


class Collaborations extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            collaboration: {}
        }
    }

    componentWillMount = () => {
        const params = this.props.match.params;
        if (params.id) {
            collaborationById(params.id)
                .then(json => this.setState({collaboration: json}))
                .catch(e => this.props.history.push("/404"));
        } else {
            this.props.history.push("/404");
        }

    };

    render() {
        const {collaboration} = this.state;
        return <div className="collaboration">
            {collaboration.name}
        </div>
    }
}

export default Collaborations;