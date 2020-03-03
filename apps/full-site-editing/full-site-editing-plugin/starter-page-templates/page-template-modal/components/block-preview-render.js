/**
 * External dependencies
 */
import { get, castArray, debounce, noop } from 'lodash';
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
	onFrameReady = noop,
	blocksByTemplatesSlug = {},
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
	useEffect( () => {
		/*
		 * Populate iframe window object with
		 * parsed (already) blocks sorted by template slug.
		 */
		const frameWindow = get( iframeRef, [ 'current', 'contentWindow' ] );
		if ( frameWindow ) {
			frameWindow.blocksByTemplateSlug = blocksByTemplatesSlug;
		}

		rescale();
		onFrameReady( iframeRef );
	}, [] );

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

const getBlocksByTemplateSlug = slug => {
	if ( ! window.blocksByTemplateSlug || ! window.blocksByTemplateSlug[ slug ] ) {
		return [];
	}
	return window.blocksByTemplateSlug[ slug ];
};

const _BlockFrameContent = ( { settings } ) => {
	const [ slug, setSlug ] = useState();

	// Listening messages.
	useEffect( () => {
		const receiveMessage = ( { data: slug } ) => {
			if ( ! slug || ! window.blocksByTemplateSlug || ! window.blocksByTemplateSlug[ slug ] ) {
				return;
			}
			setSlug( slug );
		};

		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	const renderedBlocks = useMemo( () => castArray( getBlocksByTemplateSlug( slug ) ), [ slug ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ slug ] );

	return (
		<Modal
			className="frame-preview-modal"
			overlayClassName="frame-preview-modal-screen-overlay"
			shouldCloseOnClickOutside={ false }
			isDismissable={ false }
			isDismissible={ false }
		>
			<div className="block-editor block-frame-preview__container">
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
								<Disabled key={ recomputeBlockListKey }>
									<BlockList />
								</Disabled>
							</BlockEditorProvider>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export const BlockFrameContent =  compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( _BlockFrameContent );
