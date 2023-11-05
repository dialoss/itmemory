import React, {useState} from 'react';
import Viewer from './Viewer';
import './App.css';
import ActionButton from "../../Buttons/ActionButton/ActionButton";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.wrapper = null;
        this.state = {
            camera: null,
            selectedIds: [],
            ui: props.ui,
        };
    }

    render() {
        const { token, urn } = this.props;
        return (
            <div className={"app " + (this.state.ui ? 'default' : 'hidden')}>
                <ActionButton onClick={() => this.setState({ui: !this.state.ui})} className={'ui-toggler'}>UI</ActionButton>
                <div style={{ position: 'relative'}}>
                    <Viewer
                        runtime={{ accessToken: token }}
                        urn={urn}
                        selectedIds={this.state.selectedIds}
                        onCameraChange={({ viewer, camera }) => this.setState({ camera: camera.getWorldPosition() })}
                        onSelectionChange={({ viewer, ids }) => this.setState({ selectedIds: ids })}
                        ref={ref => this.wrapper = ref}
                    />
                </div>
            </div>
        );
    }
}

export default App;
