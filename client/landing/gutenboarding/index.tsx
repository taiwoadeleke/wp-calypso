/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { I18nProvider } from '@automattic/react-i18n';
import { getLanguageSlugs } from '../../lib/i18n-utils';
import { getLanguageFile, switchWebpackCSS } from '../../lib/i18n-utils/switch-locale';
import React, { FunctionComponent, useEffect } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import config from '../../config';
import { subscribe, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { path } from './path';
import { USER_STORE } from './stores/user';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );

type User = import('@automattic/data-stores').User.CurrentUser;

interface AppWindow extends Window {
	currentUser?: User;
	i18nLocaleStrings?: string;
}
declare const window: AppWindow;

window.AppBoot = async () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
		return;
	}
	setupWpDataDebug();

	// Add accessible-focus listener.
	accessibleFocus();

	let localeData;
	try {
		localeData = await getLocale();

		// FIXME: Use rtl detection tooling
		if ( ( localeData as any )[ 'text direction\u0004ltr' ]?.[ 0 ] === 'rtl' ) {
			switchWebpackCSS( true );
		}
	} catch {}

	ReactDom.render(
		<CalypsoI18nProvider initialLocaleData={ localeData as any }>
			<BrowserRouter basename="gutenboarding">
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<Redirect to="/" />
					</Route>
				</Switch>
			</BrowserRouter>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};

const CalypsoI18nProvider: FunctionComponent< {
	initialLocaleData: any;
} > = ( { children, initialLocaleData } ) => {
	const [ localeData, setLocale ] = React.useState( initialLocaleData );

	// Debugging
	useEffect( () => {
		window.updateLocale = async ( newLocale: string ) => {
			try {
				const newLocaleData = await getLanguageFile( newLocale );
				setLocale( newLocaleData );
			} catch {}
		};
	}, [] );
	return <I18nProvider localeData={ localeData }>{ children }</I18nProvider>;
};

/**
 * Load the user's locale
 *
 * 1. If there's an explicit locale slug, use that locale.
 * 2. If i18nLocalStrings is present use those strings and data.
 * 3. If we have a currentUser object, use that locale to fetch data.
 * 4. Fetch the current user and use language to fetch data.
 * 5. TODO (#39312): If we have a URL locale slug, fetch and use data.
 * 6. Fallback to "en" locale without data.
 *
 * @returns Locale data
 */
async function getLocale(): Promise< object > {
	// Explicit locale slug.
	const pathname = new URL( window.location.href ).pathname;
	const lastPathSegment = pathname.substr( pathname.lastIndexOf( '/' ) + 1 );
	if ( getLanguageSlugs().includes( lastPathSegment ) ) {
		const data = await getLocaleData( lastPathSegment );
		return data;
	}

	// Bootstraped locale
	if ( window.i18nLocaleStrings ) {
		const bootstrappedLocaleData = JSON.parse( window.i18nLocaleStrings );
		return bootstrappedLocaleData;
	}

	// User without bootstrapped locale
	const user = window.currentUser || ( await waitForCurrentUser() );
	if ( ! user ) {
		return {};
	}
	const localeSlug: string = getLocaleFromUser( user );

	const data = await getLocaleData( localeSlug );
	return data;
}

async function getLocaleData( locale: string ) {
	if ( locale === DEFAULT_LOCALE_SLUG ) {
		return {};
	}
	return getLanguageFile( locale );
}

function waitForCurrentUser(): Promise< User | undefined > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< User | undefined >( resolve => {
		unsubscribe = subscribe( () => {
			const currentUser = select( USER_STORE ).getCurrentUser();
			if ( currentUser ) {
				resolve( currentUser );
			}
			if ( ! select( 'core/data' ).isResolving( USER_STORE, 'getCurrentUser' ) ) {
				resolve( undefined );
			}
		} );
		select( USER_STORE ).getCurrentUser();
	} ).finally( unsubscribe );
}

function getLocaleFromUser( user: User ): string {
	return user.locale_variant || user.language;
}
