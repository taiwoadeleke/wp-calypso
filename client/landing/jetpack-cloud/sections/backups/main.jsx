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
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';

class BackupsPage extends Component {
	state = {
		currentDateSetting: false,
	};

	dateChange = currentDateSetting => this.setState( { currentDateSetting } );

	render() {
		const { allowRestore, logs, siteId, siteSlug } = this.props;
		const initialDate = new Date();
		const currentDateSetting = this.state.currentDateSetting
			? this.state.currentDateSetting
			: new Date().toISOString().split( 'T' )[ 0 ];

		const backupAttempts = getBackupAttemptsForDate( logs, currentDateSetting );

		return (
			<div>
				<QueryRewindState siteId={ siteId } />
				<DatePicker siteId={ siteId } initialDate={ initialDate } onChange={ this.dateChange } />
				<DailyBackupStatus
					allowRestore={ allowRestore }
					date={ currentDateSetting }
					backupAttempts={ backupAttempts }
					siteSlug={ siteSlug }
				/>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, { group: 'rewind' } );
	const rewind = getRewindState( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );

	return {
		allowRestore,
		logs: logs?.data ?? [],
		rewind,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( BackupsPage );
