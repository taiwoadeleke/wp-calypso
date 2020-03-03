declare module 'progress-event' {
	const ProgressEvent: {
		prototype: ProgressEvent;
		new ( type: string, eventInitDict?: ProgressEventInit ): ProgressEvent;
	};
	export = ProgressEvent;
}
