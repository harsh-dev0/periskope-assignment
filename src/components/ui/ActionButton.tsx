import React from "react"
import { Icon } from "@iconify/react"

export enum ActionButtonType {
  TEXT = "TEXT",
  ICON_TEXT = "ICON_TEXT",
  ICON = "ICON",
}

interface ActionButtonProps {
  icon?: string
  text?: string
  type?: ActionButtonType
  onClickFunc?: (e: React.MouseEvent) => void
  color?: string
}

const ActionButton = ({
  icon,
  text,
  type = ActionButtonType.ICON_TEXT,
  onClickFunc = () => {},
  color = "black",
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClickFunc}
      className="flex items-center space-x-1 border border-slate-200 px-2 py-1 rounded-md cursor-pointer bg-white"
      style={{ color }}
    >
      {icon && type !== ActionButtonType.TEXT && (
        <Icon icon={icon} width="15" height="15" />
      )}
      {text &&
        (type === ActionButtonType.ICON_TEXT ||
          type === ActionButtonType.TEXT) && (
          <p className="text-xs font-medium">{text}</p>
        )}
    </button>
  )
}

export default ActionButton
