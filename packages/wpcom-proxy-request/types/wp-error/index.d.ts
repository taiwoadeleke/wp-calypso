declare module 'wp-error' {
	function WPError( ...args: any[] ): Error;
	export = WPError;
}
