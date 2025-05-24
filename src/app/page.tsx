"use client"

import ChatArea from "@/components/chat/ChatArea"
import MessageArea from "../components/MessageArea"
import Header from "@/components/layouts/Header"
import Sidebar from "../components/Sidebar"

import { useState } from "react"

export default function Page() {
  const [currentChatPersonId, setCurrentChatPersonId] =
    useState<string>("")

  return (
    <div className="flex h-screen flex-1 w-full">
      <section className="h-full w-full flex-[0.04]">
        <Sidebar />
      </section>
      <div className="h-full w-full flex-[0.96]  flex flex-col ">
        <section className="flex-[0.06] w-full h-full">
          <Header />
        </section>

        <main className="w-full h-full flex-[0.94] flex min-h-0 min-w-0">
          <section className="w-full h-full flex-[0.27] border-r border-ws-green-50 min-h-0 min-w-0">
            <ChatArea
              updateSelectedPersonId={setCurrentChatPersonId}
              selectedPersonId={currentChatPersonId}
            />
          </section>
          <section className="w-full h-full flex-[0.73] min-h-0 min-w-0">
            <MessageArea currentChatPersonId={currentChatPersonId} />
          </section>
        </main>
      </div>
    </div>
  )
}
