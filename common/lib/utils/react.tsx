export type AnyComponent = (props: any) => React.ReactElement;
export type AnyMemo = React.MemoExoticComponent<AnyComponent>;

export const EmptyComponent: React.FunctionComponent<any> = (props) => null;

export const EmptyWrapperComponent: React.FunctionComponent<any> = (props) => <div {...props} />;

export const ErrorPopout: React.FunctionComponent<any> = (props) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		Error: Popout component not found
	</div>
);
