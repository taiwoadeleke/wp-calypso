/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs } from 'state/data-getters';
import DatePicker from '../../components/date-picker';
import DailyBackupStatus from '../../components/daily-backup-status';
import { getBackupAttemptsForDate } from './utils';

class BackupsPage extends Component {
	state = {
		currentDateSetting: new Date(),
	};

	dateChange = currentDateSetting => this.setState( { currentDateSetting } );

	render() {
		const { logs, siteId } = this.props;
		const { currentDateSetting } = this.state;

		const backupAttempts = getBackupAttemptsForDate( logs, currentDateSetting );

		return (
			<div>
				<DatePicker siteId={ siteId } date={ currentDateSetting } onChange={ this.dateChange } />
				<DailyBackupStatus date={ currentDateSetting } backupAttempts={ backupAttempts } />
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, { group: 'rewind' } );

	return {
		siteId,
		logs: logs?.data ?? [],
	};
} )( BackupsPage );
