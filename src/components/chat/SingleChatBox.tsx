import { Icon } from "@iconify/react/dist/iconify.js"
import { ConversationData } from "@/lib/types/chat.types"
import { formatToDate } from "@/utils/formatTime"


const SingleChatBox = ({
  conversationData,
  updateSelectedPersonId,
  selectedPersonId,
}: {
  conversationData: ConversationData
  updateSelectedPersonId: React.Dispatch<React.SetStateAction<string>>
  selectedPersonId: string
}) => {
  return (
    <div
      onClick={() => {
        updateSelectedPersonId(conversationData.person_id)
      }}
      className={`w-full flex px-2 py-2 space-x-3 cursor-pointer hover:bg-gray-50 ${
        conversationData.person_id == selectedPersonId && "bg-gray-100"
      } `}
    >
      <div>
        <div className="p-3 rounded-full bg-neutral-300">
          <Icon
            icon={"bi:person-fill"}
            width={"15"}
            height={"15"}
            className="text-white"
          />
        </div>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full flex items-center justify-between">
          <p className="text-black font-bold text-sm">
            {conversationData.name || "Unknown User"}
          </p>

          <div className="flex items-center space-x-2">
            {conversationData.labels?.map((tagData, idx) => (
              <div key={idx} className="bg-green-50 rounded-md px-2 py-1">
                <p
                  key={idx}
                  className="text-[10px]"
                  style={{
                    color: tagData.color,
                  }}
                >
                  {tagData.label_name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex items-center flex-1 justify-between">
          <div className="w-full flex-[0.8]">
            <p className="text-neutral-400 text-xs line-clamp-1">
              {conversationData.latest_message}
            </p>
          </div>

          <div className="w-full flex-[0.2] flex items-center space-x-2 justify-end">
            <div className="py-[2px] px-[5px] rounded-full bg-ws-green-200">
              <p className="text-white text-[9px]">4</p>
            </div>

            <div className="p-1 rounded-full bg-neutral-200">
              <Icon
                icon={"bi:person-fill"}
                width={"8"}
                height={"8"}
                className="text-white"
              />
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-1">
          <div className="px-2 py-1 text-neutral-500 bg-neutral-100 rounded-md flex items-center space-x-1">
            <Icon icon={"ion:call-outline"} width={"8"} height={"8"} />
            <p className="text-[9px] font-medium">
              {conversationData.phone || "N/A"}
            </p>
          </div>

          <p className="text-[9px] text-neutral-400 font-semibold">
            {formatToDate(conversationData.latest_message_timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SingleChatBox
