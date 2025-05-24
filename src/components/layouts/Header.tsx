import { Icon } from "@iconify/react"
import ActionButton, { ActionButtonType } from "../ui/ActionButton"

const Header = () => {
  return (
    <header className="w-full h-full border-b border-ws-green-50 flex items-center justify-between px-4">
      <div className="flex items-center space-x-1">
        <Icon
          icon="line-md:chat-round-dots-filled"
          width="18"
          height="18"
          className="text-gray-500"
        />
        <h1 className="text-sm font-semibold text-gray-500">Chats</h1>
      </div>

      <div className="flex items-center space-x-3">
        <ActionButton icon="uis:refresh" text="Refresh" />
        <ActionButton icon="material-symbols:help-outline" text="Help" />

        <button className="flex items-center space-x-1 border border-slate-200 px-2 py-1 rounded-md cursor-pointer bg-white hover:bg-slate-50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-amber-200 mr-3 shadow-xl shadow-amber-400" />
          <span className="text-xs font-medium">5/6 Phones</span>
          <Icon
            icon="mi:select"
            width="15"
            height="15"
            className="text-gray-400"
          />
        </button>

        <ActionButton
          icon="icon-park-outline:download-computer"
          type={ActionButtonType.ICON}
        />
        <ActionButton
          icon="material-symbols:notifications-off-rounded"
          type={ActionButtonType.ICON}
        />

        <button className="flex items-center space-x-1 border border-slate-200 px-2 py-1 rounded-md cursor-pointer bg-white hover:bg-slate-50 transition-colors">
          <Icon
            icon="bi:stars"
            width="15"
            height="15"
            className="text-yellow-500"
          />
          <Icon
            icon="f7:menu"
            width="15"
            height="15"
            className="text-black"
          />
        </button>
      </div>
    </header>
  )
}

export default Header
