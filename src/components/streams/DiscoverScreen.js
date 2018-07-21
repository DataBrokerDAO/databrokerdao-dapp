import React, { Component } from 'react';
import styled from 'styled-components';

import Toolbar from '../generic/Toolbar';
import DiscoverMap from './DiscoverMap';
import Sidebar from './Sidebar';
import MapErrorBoundary from '../generic/MapErrorBoundary';
import {connect} from "react-redux";
import {USER_ACTIONS} from "../../redux/user/actions";
import {STREAMS_ACTIONS} from "../../redux/streams/actions";

class DiscoverScreen extends Component {
    componentDidMount() {
    }

    constructor(props) {
        super(props);

        const { location } = this.props.match.params;
        if (location) {
            this.props.setMapCenterByAddress(location)
        } else {
            this.props.updateUserLocation();
        }
        this.state = {
            sidebarWidth: window.innerWidth > 480 ? 320 : 0
        };
    }

    setSidebarWidth(width) {
        this.setState({ sidebarWidth: width });
    }

    render() {
        const StyledContent = styled.div`
      flex: 1;
    `;

        const mapElementsStyle = {
            height: `100%`,
            width: `calc(100% - ${this.state.sidebarWidth}px)`,
            position: 'absolute',
            top: '0',
            left: '320'
        };

        const APIKey = 'AIzaSyBv4e2Uj5ZFp82G8QXKfYv7Ea3YutD4eTg';

        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                <Toolbar showTabs={true} />
                <Sidebar setWidthHandler={width => this.setSidebarWidth(width)} />
                <StyledContent>
                    <MapErrorBoundary>
                        {
                            (error) => {
                                return <DiscoverMap
                                    googleMapURL={!error.message ? `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=${APIKey}` : `https://maps.google.cn/maps/api/js?v=3.exp&libraries=places&key=${APIKey}`}
                                    loadingElement={<div style={mapElementsStyle} />}
                                    containerElement={<div style={{ mapElementsStyle }} />}
                                    mapElement={<div style={mapElementsStyle} />}
                                />
                            }
                        }
                    </MapErrorBoundary>
                </StyledContent>
            </div>
        );
    }
}

const mapStateToProps = () => ({});

function mapDispatchToProps(dispatch) {
    return {
        updateUserLocation: () => dispatch(USER_ACTIONS.updateLocation()),
        setMapCenterByAddress: (address) => dispatch(STREAMS_ACTIONS.setCenter({ address })),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverScreen)

