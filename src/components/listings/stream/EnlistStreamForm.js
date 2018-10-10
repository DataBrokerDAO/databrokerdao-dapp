import React, { Component } from 'react';
import { withFormik } from 'formik';
import Yup from 'yup';
import styled from 'styled-components';
import { Button } from 'react-md';
import moment from 'moment';
import EnhancedTextField from '../../generic/EnhancedTextField';
import EnhancedTextArea from '../../generic/EnhancedTextArea';
import EnhancedSelectField from '../../generic/EnhancedSelectField';
import EnlistConfirmationDialog, {
  TYPE_STREAM
} from '../EnlistConfirmationDialog';

export default class EnlistForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      StreamConfirmationDialogVisible: false
    };
  }

  toggleConfirmationDialog() {
    this.setState({
      StreamConfirmationDialogVisible: !this.state
        .StreamConfirmationDialogVisible
    });
  }

  render() {
    const streamTypes = [
      {
        label: 'Temperature',
        value: 'temperature'
      },
      {
        label: 'Humidity',
        value: 'humidity'
      },
      {
        label: 'PM2.5',
        value: 'PM25'
      },
      {
        label: 'PM10',
        value: 'PM10'
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
                label="Stream name"
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
                fieldname="type"
                label="Stream type"
                className="md-cell"
                onChange={setFieldValue}
                menuItems={streamTypes}
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
                id="lat"
                fieldname="lat"
                label="Latitude"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.lat}
                touched={touched.lat}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="lng"
                fieldname="lng"
                label="Longitude"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.lng}
                touched={touched.lng}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="updateinterval"
                fieldname="updateinterval"
                label="Update interval (seconds)"
                className="md-cell md-cell--bottom"
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                error={errors.updateinterval}
                touched={touched.updateinterval}
                style={{ width: '100%' }}
              />
            </StyledColumn>
            <StyledColumn>
              <EnhancedTextField
                id="price"
                fieldname="price"
                label="Price per second (DTX)"
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
          {this.state.stream && (
            <EnlistConfirmationDialog
              visible={this.state.StreamConfirmationDialogVisible}
              sensor={this.state.stream}
              type={TYPE_STREAM}
              hideEventHandler={() => this.toggleConfirmationDialog()}
            />
          )}
        </div>
      );
    };

    const EnhancedForm = withFormik({
      mapPropsToValues: () => ({
        name: '',
        lat: '',
        lng: '',
        type: '',
        example: '',
        updateinterval: '',
        price: '',
        stake: ''
      }),
      validationSchema: Yup.object().shape({
        name: Yup.string().required('Stream name is required'),
        type: Yup.string().required('Type is required'),
        lat: Yup.number()
          .typeError('Latitude must be a number')
          .required('Latitude is required'),
        lng: Yup.number()
          .typeError('Longitude must be a number')
          .required('Longitude is required'),
        example: Yup.string().required('Example is required'),
        updateinterval: Yup.number()
          .typeError('Update must be a number')
          .required('Update interval is required'),
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
          stream: {
            name: values.name,
            type: values.type,
            lat: values.lat,
            lng: values.lng,
            example: values.example,
            sensorid: [values.name, values.type, moment.now()].join('_'),
            updateinterval: values.updateinterval,
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
