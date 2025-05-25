import Image from "next/image"
import { Icon } from "@iconify/react"
import { useState } from "react"
import { useAuthContext } from "@/providers/AuthProvider"

const DivisionComp = ({
  children,
  hasBorder = true,
}: Readonly<{
  children: React.ReactNode
  hasBorder?: boolean
}>) => {
  return (
    <div
      className={`w-full flex flex-col items-center space-y-6 ${
        hasBorder && "border-b border-ws-green-50"
      } py-3`}
    >
      {children}
    </div>
  )
}

const Sidebar = () => {
  const [isLogoutOpen, setIsLogoutOpen] = useState<boolean>(false)

  const { logout } = useAuthContext()

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-3 px-2 border-r border-ws-green-50">
      <div className="w-full flex flex-col items-center">
        <Image
          src={"/logo.png"}
          alt="Periskope logo"
          width={"32"}
          height={"32"}
        />

        <div className="w-full flex flex-col items-center mt-3">
          <DivisionComp>
            <Icon
              icon="ic:round-home"
              width="20"
              height="20"
              className="text-gray-500"
            />
          </DivisionComp>

          <DivisionComp>
            <div className="w-fit px-2 py-1 rounded-md h-fit bg-slate-100 cursor-pointer">
              <Icon
                icon="line-md:chat-round-dots-filled"
                width="20"
                height="20"
                className="text-ws-green-400"
              />
            </div>

            <Icon
              icon="ion:ticket"
              width="20"
              height="20"
              className="text-gray-500"
            />

            <Icon
              icon="octicon:graph-16"
              width="20"
              height="20"
              className="text-gray-500"
            />
          </DivisionComp>

          <DivisionComp>
            <Icon
              icon="f7:menu"
              width="20"
              height="20"
              className="text-gray-500"
            />

            <Icon
              icon="heroicons:megaphone-20-solid"
              width="20"
              height="20"
              className="text-gray-500"
            />

            <Icon
              icon="lucide:network"
              width="20"
              height="20"
              className="text-gray-500"
            />
          </DivisionComp>

          <DivisionComp>
            <Icon
              icon="ri:contacts-book-fill"
              width="20"
              height="20"
              className="text-gray-500"
            />

            <Icon
              icon="ri:folder-image-fill"
              width="20"
              height="20"
              className="text-gray-500"
            />
          </DivisionComp>

          <DivisionComp hasBorder={false}>
            <Icon
              icon="material-symbols:checklist-rounded"
              width="20"
              height="20"
              className="text-gray-500"
            />

            <div
              className="w-fit h-fit relative flex items-center cursor-pointer"
              onClick={() => setIsLogoutOpen(!isLogoutOpen)}
            >
              {isLogoutOpen && (
               <div className="absolute shadow-xl -right-4 top-2 translate-x-full z-50 bg-white w-64 px-6 py-5 rounded-xl border border-gray-200 space-y-4">
               
               <button
                 onClick={logout}
                 className="w-full bg-red-500 hover:bg-red-600 text-white py-2 text-sm rounded-md transition-colors"
               >
                 Logout
               </button>
             </div>
             
              )}

              <Icon
                icon="si:settings-alt-fill"
                width="20"
                height="20"
                className="text-gray-500"
              />
            </div>
          </DivisionComp>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3">
        <Icon
          icon="tabler:stars-filled"
          width="20"
          height="20"
          className="text-gray-500"
        />

        <Icon
          icon="tabler:layout-sidebar-left-expand-filled"
          width="20"
          height="20"
          className="text-gray-500"
        />
      </div>
    </div>
  )
}

export default Sidebar
