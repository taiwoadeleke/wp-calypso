/**
 * External dependencies
 */
import { get, castArray, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { Modal } from '@wordpress/components';
import {
	useRef,
	useEffect,
	useState,
	useMemo,
	useReducer,
	useLayoutEffect,
	useCallback,
} from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

// Debounce time applied to the on resize window event.
const DEBOUNCE_TIMEOUT = 300;

export const BlockPreviewFrame = ( {
	viewportWidth,
	className = 'block-preview-render',
} ) => {
	const iframeRef = useRef();

	// Set the initial scale factor.
	const [ style, setStyle ] = useState( {
		transform: `scale( 1 )`,
	} );

	/**
	 * This function re scales the viewport depending on
	 * the wrapper and the iframe width.
	 */
	const rescale = useCallback( () => {
		const parentNode = get( iframeRef, [ 'current', 'parentNode' ] );
		if ( ! parentNode ) {
			return;
		}

		// Scaling iFrame.
		const width = viewportWidth || iframeRef.current.offsetWidth;
		const scale = parentNode.offsetWidth / viewportWidth;
		const height = parentNode.offsetHeight / scale;

		setStyle( {
			width,
			height,
			transform: `scale( ${ scale } )`,
		} );
	}, [ viewportWidth ] );

	// Set initial scale.
	useEffect( rescale, [] );

	// Handling windows resize event.
	useEffect( () => {
		const refreshPreview = debounce( rescale, DEBOUNCE_TIMEOUT );
		window.addEventListener( 'resize', refreshPreview );

		return () => {
			window.removeEventListener( 'resize', refreshPreview );
		};
	}, [ rescale ] );

	// Handle wp-admin specific `wp-collapse-menu` event to refresh the preview on sidebar toggle.
	useEffect( () => {
		if ( window.jQuery ) {
			window.jQuery( window.document ).on( 'wp-collapse-menu', rescale );
		}
		return () => {
			if ( window.jQuery ) {
				window.jQuery( window.document ).off( 'wp-collapse-menu', rescale );
			}
		};
	}, [ rescale ] );

	return (
		<iframe
			src="#iframepreview=true"
			ref={ iframeRef }
			title={ __( 'Preview' ) }
			className={ classnames( 'editor-styles-wrapper', className ) }
			style={ style }
		/>
	)
};

export const BlockFrameContent = ( { unparsed_html } ) => {
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
			<div ref={ renderedBlocksRef } className="block-editor block-frame-preview__container">
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow"></div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

/**
 * Performs a blocks preview using an iFrame.
 *
 * @param {object} props component's props
 * @param {Array}  props.blocks array of Gutenberg Block objects
 * @param {object} props.settings block Editor settings object
 */
const BlockPreviewRender = ( {
	blocks,
	settings,
} ) => {
	const renderedBlocksRef = useRef();

	// Rendering blocks list.
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ blocks ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-preview-render__render-container" ref={ renderedBlocksRef }>
			<BlockEditorProvider value={ blocks } settings={ settings }>
				<Disabled key={ recomputeBlockListKey }>
					<BlockList />
				</Disabled>
			</BlockEditorProvider>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( BlockPreviewRender );
