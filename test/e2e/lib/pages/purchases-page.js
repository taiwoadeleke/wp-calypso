/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

const by = webdriver.By;
const host = dataHelper.getJetpackHost();

export default class PurchasesPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'a[href="/me/purchases"][aria-current="true"]' ) );
	}

	async _postInit() {
		return await this._waitForPurchases();
	}

	async selectBusinessPlan() {
		return await this._selectPlan( host === 'WPCOM' ? 'business' : 'professional' );
	}

	async selectPremiumPlan() {
		return await this._selectPlan( 'premium' );
	}

	async selectPersonalPlan() {
		return await this._selectPlan( 'personal' );
	}

	async selectPremiumPlanOnConnectedSite() {
		return await this._selectPlanOnConnectedSite( 'premium' );
	}

	async selectTheme() {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'a.purchase-item svg.gridicons-themes' )
		);
	}

	async dismissGuidedTour() {
		return await driverHelper.clickIfPresent(
			this.driver,
			by.css( '.guided-tours__choice-button-row button:not(.is-primary)' ),
			1
		);
	}

	async _waitForPurchases() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.is-placeholder' ),
			this.explicitWaitMS * 3
		);
	}

	async _selectPlan( planName ) {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `a.purchase-item img.is-${ planName }` )
		);
	}

	async _selectPlanOnConnectedSite( planName ) {
		await this._waitForPurchases();
		const planPrefix = host === 'WPCOM' ? 'wpcom' : 'jetpack';
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `a.purchase-item[data-e2e-connected-site=true] img.is-${ planPrefix }-${ planName }` )
		);
	}
}
