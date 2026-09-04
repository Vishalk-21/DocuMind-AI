import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import "../../styles/markdown.css";

function MarkdownRenderer({ content }) {

	return (
		<div className="markdown-content">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{content || ""}
			</ReactMarkdown>
		</div>
	);
}

export default MarkdownRenderer;