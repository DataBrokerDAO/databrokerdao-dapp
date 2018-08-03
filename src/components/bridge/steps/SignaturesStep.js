import React from 'react';

import CenteredCard from '../../generic/CenteredCard';
import CardContent from '../../generic/CardContent';
import { CircularProgress } from 'react-md';

export default function SignaturesStep() {
  return (
    <CenteredCard>
      <CardContent>
        <h1>Deposit started</h1>
        <h2>Waiting for validator approvals</h2>
        <CircularProgress id="loading" />
      </CardContent>
    </CenteredCard>
  )
}