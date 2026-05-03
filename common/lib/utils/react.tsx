export type AnyComponent = React.FunctionComponent<any>;
export type AnyMemo = React.MemoExoticComponent<AnyComponent>;

export const EmptyComponent: AnyComponent = (props) => null;

export const EmptyWrapperComponent: AnyComponent = (props) => <span {...props} />;

export const ErrorPopout: AnyComponent = (props) => (
	<div style={{ backgroundColor: "var(--background-floating)", color: "red", padding: "8px", borderRadius: "8px" }}>
		Error: Popout component not found
	</div>
);
