/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import { setSiteTopic } from 'state/signup/site-topic/actions';
import getSignupStepsSiteTopic from 'state/selectors/get-signup-steps-site-topic';

class SiteTopicStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		setSiteTopic: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		siteTopic: PropTypes.string,
	};

	state = {
		siteTopicInputValue: '',
	};

	componentDidMount( props ) {
		const { siteTopic } = props;

		if ( siteTopic ) {
			this.state.siteTopicInputValue = siteTopic;
		}
	}

	onChangeTopic = event => this.setState( { siteTopicInputValue: event.target.value } );

	submitSiteTopic( event ) {
		event.preventDefault();

		const { goToNextStep, flowName } = this.props;

		this.props.setSiteTopic( this.state.siteTopicInputValue );

		goToNextStep( flowName );
	}

	renderContent() {
		const { translate } = this.props;
		const { siteTopicInputValue } = this.state;

		return (
			<Card className="site-topic__content">
				<form onSubmit={ this.submitSiteTopic }>
					<FormFieldset>
						<FormLabel htmlFor="siteTopic">{ translate( 'Type of Business' ) }</FormLabel>
						<FormTextInput
							id="siteTopic"
							name="siteTopic"
							placeholder={ translate( 'e.g. Fashion, travel, design, plumber, electrician' ) }
							value={ this.state.siteTopicInputValue }
							onChange={ this.onChangeTopic }
							autoComplete="off"
						/>
					</FormFieldset>
					<Button type="submit" disabled={ ! siteTopicInputValue } primary>
						{ translate( 'Continue' ) }
					</Button>
					<span className="site-topic__form-description">
						{ translate( 'Search above to continue' ) }
					</span>
				</form>
			</Card>
		);
	}

	render() {
		const { translate } = this.props;
		const headerText = translate( 'Search for your type of business.' );
		const subHeaderText = translate( "Don't stress, you can change this later." );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		siteTopic: getSignupStepsSiteTopic( state ),
	} ),
	{
		setSiteTopic,
	}
)( localize( SiteTopicStep ) );
