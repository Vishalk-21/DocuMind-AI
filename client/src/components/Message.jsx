import MarkdownRenderer from "./ui/MarkdownRenderer";


function Message({ message }) {

    const isUser =
        message.role === "user";


    return (

        <div
            className={
                isUser
                    ? "message user-message"
                    : "message assistant-message"
            }
        >

            <div className="message-role">

                {isUser
                    ? "You"
                    : "DocuMind AI"}

            </div>


            <div className="message-content">
                <MarkdownRenderer content={message.content} />

            </div>

        </div>

    );
}

export default Message;