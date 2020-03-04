/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

const host = dataHelper.getJetpackHost();

export default class MyPlanPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-plans .current-plan' ) );
	}

	async openPlansTab() {
		await driverHelper.ensureMobileMenuOpen( this.driver );
		const selector = By.css(
			'.current-plan a[href*="plans"]:not([href*="my-plan"]).section-nav-tab__link'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async isPremium() {
		const planPrefix = host === 'WPCOM' ? 'wpcom' : 'jetpack';
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( `img.is-${ planPrefix }-premium` )
		);
	}
}
