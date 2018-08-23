import React, { Component } from 'react';

import Toolbar from '../../generic/Toolbar.js';
import CenteredCard from '../../generic/CenteredCard.js';
import CardContent from '../../generic/CardContent.js';
import ToolbarSpacer from '../../generic/ToolbarSpacer.js';
import EnlistForm from './EnlistDatasetForm';

export default class AddDatasetScreen extends Component {
  render() {
    return (
      <div>
        <Toolbar showTabs={true} />
        <ToolbarSpacer />
        <CenteredCard>
          <CardContent>
            <h1>Enlist your dataset</h1>
            <EnlistForm />
          </CardContent>
        </CenteredCard>
      </div>
    );
  }
}
