/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { BlockPreviewFrame } from './block-preview-render';

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, blocksByTemplatesSlug = {}, slug } ) => {
	const noBlocks = ! blocks.length;

	const [ frameRef, setFrameRef ] = useState(null);

	useEffect( () => {
		if ( ! frameRef || ! frameRef.current || ! slug ) {
			return;
		}

		// Send message to the FramePreview (iFrame).
		frameRef.current.contentWindow.postMessage( slug, "*" );

		const body = get( frameRef, [ 'current', 'contentDocument', 'body' ] );
		if ( ! body ) {
			// scroll to top when blocks changes.
			body.scrollTop = 0;
		}
	}, [ blocks ] );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ noBlocks ? 'not-selected' : '' }` }>
			{ noBlocks && (
				<div className="editor-styles-wrapper">
					<div className="template-selector-preview__empty-state">
						{ __( 'Select a layout to preview.', 'full-site-editing' ) }
					</div>
				</div>
			) }

			<BlockPreviewFrame
				blocksByTemplatesSlug={ blocksByTemplatesSlug }
				viewportWidth={ viewportWidth }
				onFrameReady={ setFrameRef }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
