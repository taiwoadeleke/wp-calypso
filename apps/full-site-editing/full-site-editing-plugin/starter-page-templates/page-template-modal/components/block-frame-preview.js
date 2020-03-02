/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { useRef, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

const BlockFramePreview = ( { unparsed_html } ) => {
	const renderedBlocksRef = useRef();
	// Getting template slug from parent post message.
	const [ html, setHTML ] = useState( unparsed_html );
	const receiveMessage = ( { data: slug } ) => {
		if ( ! slug ) {
			return;
		}
		setHTML( slug );
	};

	// Listening parent messages.
	useEffect( () => {
		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	return (
		<Modal
			className="frame-preview-modal"
			overlayClassName="frame-preview-modal-screen-overlay"
			shouldCloseOnClickOutside={ false }
			isDismissable={ false }
			isDismissible={ false }
		>
			<div ref={ renderedBlocksRef } className="block-editor frame-template-preview">
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow"></div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default withSelect( select => {
	return {
		settings: select( 'core/block-editor' ).getSettings(),
	};
} )( BlockFramePreview );
