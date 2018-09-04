import React, { Component } from 'react';
import { withFormik } from 'formik';
import Yup from 'yup';
import styled from 'styled-components';
import { Button } from 'react-md';

import EnhancedTextField from '../../generic/EnhancedTextField';
import EnhancedTextArea from '../../generic/EnhancedTextArea';
import EnhancedSelectField from '../../generic/EnhancedSelectField';
import EnlistDatasetConfirmationDialog from './EnlistDatasetConfirmationDialog';
import moment from 'moment';

export default class EnlistForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      DatasetConfirmationDialogVisible: false
    };
  }

  toggleConfirmationDialog() {
    this.setState({
      DatasetConfirmationDialogVisible: !this.state
        .DatasetConfirmationDialogVisible
    });
  }

  render() {
    const datasetCategories = [
      {
        label: 'Health',
        value: 'health'
      },
      {
        label: 'Energy',
        value: 'energy'
      },
      {
        label: 'Agriculture',
        value: 'agriculture'
      },
      {
        label: 'Environment',
        value: 'environment'
      }
    ];

    const datasetFiletypes = [
      {
        label: 'CSV',
        value: 'csv'
      },
      {
        label: 'JSON',
        value: 'json'
      },
      {
        label: 'XLS',
        value: 'xls'
      }
    ];

    const StyledForm = styled.form`
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    `;

    const StyledColumn = styled.div`
      width: 49%;

      @media (max-width: ${props => props.theme.mobileBreakpoint}) {
        width: 100%;
      }
    `;

    // Our inner form component. Will be wrapped with Formik({..})
    const InnerForm = props => {
      const {
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        isSubmitting
      } = props;
      return (
        <div>
          <StyledForm onSubmit={handleSubmit}>
            <StyledColumn>
              <EnhancedTextField
                id="name"
                fieldname="name"
                label="Name"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.name}
                touched={touched.name}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedSelectField
                id="type"
                fieldname="category"
                label="Category"
                className="md-cell"
                onChange={setFieldValue}
                menuItems={datasetCategories}
                simplifiedMenu={true}
                onBlur={setFieldTouched}
                style={{ width: '100%', paddingTop: '3px' }}
                error={errors.type}
                touched={touched.type}
                valueInState={true}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedSelectField
                id="type"
                fieldname="filetype"
                label="Filetype"
                className="md-cell"
                onChange={setFieldValue}
                menuItems={datasetFiletypes}
                simplifiedMenu={true}
                onBlur={setFieldTouched}
                style={{ width: '100%', paddingTop: '3px' }}
                error={errors.type}
                touched={touched.type}
                valueInState={true}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="price"
                fieldname="price"
                label="Price (DTX)"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.price}
                touched={touched.price}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="stake"
                fieldname="stake"
                label="Owner stake (DTX)"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.stake}
                touched={touched.stake}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="url"
                fieldname="url"
                label="Download Url"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.name}
                touched={touched.name}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn style={{ width: '100%' }}>
              <EnhancedTextArea
                id="example"
                fieldname="example"
                label="Example reading(s)"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.example}
                touched={touched.example}
                style={{ width: '100%' }}
                rows={4}
                maxRows={10}
              />
            </StyledColumn>
            <StyledColumn />
            <StyledColumn
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button
                type="submit"
                flat
                swapTheming
                primary
                disabled={isSubmitting}
                style={{ marginTop: '20px' }}
              >
                Submit
              </Button>
            </StyledColumn>
          </StyledForm>
          {this.state.dataset && (
            <EnlistDatasetConfirmationDialog
              visible={this.state.DatasetConfirmationDialogVisible}
              dataset={this.state.dataset}
              hideEventHandler={() => this.toggleConfirmationDialog()}
            />
          )}
        </div>
      );
    };

    const EnhancedForm = withFormik({
      mapPropsToValues: () => ({
        name: '',
        category: '',
        filetype: '',
        example: '',
        price: '',
        stake: ''
      }),
      validationSchema: Yup.object().shape({
        name: Yup.string().required('Stream name is required'),
        category: Yup.string().required('Category is required'),
        filetype: Yup.string().required('Filetype is required'),
        url: Yup.string().required('Download url is required'),
        example: Yup.string().required('Example is required'),
        price: Yup.number()
          .typeError('Price must be a number')
          .required('Price is required'),
        stake: Yup.number()
          .typeError('Stake must be a number')
          .min(50, 'Minimum stake amount 50 DTX')
          .required('Stake is required')
      }),
      handleSubmit: (values, { setSubmitting }) => {
        setSubmitting(false);
        this.setState({
          dataset: {
            name: values.name,
            category: values.category,
            filetype: values.filetype,
            sensorid: [
              values.name,
              values.category,
              values.filetype,
              moment.now()
            ].join('_'),
            sensortype: 'DATASET',
            url: values.url,
            example: values.example,
            price: values.price,
            stake: values.stake
          }
        });
        this.toggleConfirmationDialog();
      },
      displayName: 'EnlistForm' // helps with React DevTools
    })(InnerForm);

    return <EnhancedForm />;
  }
}
