import MarkdownRenderer from "./ui/MarkdownRenderer";

function Summary({ content }) {

	return (
		<div className="summary">
			<MarkdownRenderer content={content} />
		</div>
	);
}

export default Summary;
