/*interface MessageBubbleProps {
  user: string;
  message: string;
  isCurrentUser?: boolean;
}

export default function MessageBubble({
  user,
  message,
  isCurrentUser = false,
}: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
      <p className="text-xs font-semibold text-gray-500 mb-1 px-1">
        {user}
      </p>

      <div
        className={`max-w-sm sm:max-w-md rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isCurrentUser
            ? "bg-black text-white rounded-br-xs"
            : "bg-gray-100 text-gray-800 rounded-bl-xs"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
*/
interface MessageBubbleProps {
  user: string;
  message: string;
  timestamp?: string;
  isCurrentUser?: boolean;
}

export default function MessageBubble({
  user,
  message,
  timestamp = "Just now",
  isCurrentUser = false,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex flex-col ${
        isCurrentUser ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`mb-1 flex items-center gap-2 px-1 ${
          isCurrentUser ? "flex-row-reverse" : ""
        }`}
      >
        <p className="text-xs font-semibold text-gray-500">
          {user}
        </p>

        <span className="text-[10px] text-gray-400">
          {timestamp}
        </span>
      </div>

      <div
        className={`max-w-sm rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-md ${
          isCurrentUser
            ? "rounded-br-sm bg-black text-white"
            : "rounded-bl-sm bg-gray-100 text-gray-800"
        }`}
      >
        {message}
      </div>
    </div>
  );
}