"use client"

  import { useAuthContext } from "@/providers/AuthProvider"
  import { supabase } from "@/lib/supabase"
  import { formatToOnlyTime } from "@/utils/formatTime"
  import { Icon } from "@iconify/react"
  import React, { useEffect, useRef, useState, useCallback } from "react"
  import Modal from "./ui/Modal"
  import { MESSAGE_TYPES, CHAT_INFO_TYPE } from "@/lib/types/message.types"
  import { ProfileInfoType } from "@/lib/types/profile.types"
  import { LabelData } from "@/lib/types/label.types"
  import Spinner from "@/components/ui/Spinner"
import Image from "next/image"

  const MessageBox = ({
    chatInfo,
    setCurrentSelectedId,
    repliedchatInfo,
  }: {
    chatInfo: CHAT_INFO_TYPE
    repliedchatInfo?: CHAT_INFO_TYPE
    setCurrentSelectedId: React.Dispatch<React.SetStateAction<string>>
  }) => {
    return (
      <div
        onDoubleClick={() => setCurrentSelectedId(chatInfo.id)}
        className={`w-full h-fit flex ${
          chatInfo.type === MESSAGE_TYPES.SENT ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex mx-3 space-x-2">
          {chatInfo.type === MESSAGE_TYPES.RECEIVED && (
            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
          )}
          <div
            className={`w-fit h-fit ${
              chatInfo.type === MESSAGE_TYPES.SENT
                ? "bg-ws-green-100 rounded-l-lg"
                : "bg-white rounded-r-lg"
            } px-3 py-2 rounded-b-lg min-w-60 flex flex-col max-w-96 space-y-2 shadow-md ${
              chatInfo.isPending ? "opacity-50" : ""
            }`}
          >
            {repliedchatInfo && (
              <div className="text-sm bg-gray-200 w-full p-2 rounded">
                {repliedchatInfo.content}
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-ws-green-400">{chatInfo.name}</p>
              <p className="text-[10px] text-gray-400">{chatInfo.number}</p>
            </div>
            <div>
              <p className="text-black text-sm">{chatInfo.content}</p>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center space-x-2">
                <p className="text-[10px] text-gray-400">
                  {formatToOnlyTime(chatInfo.createdAt)}
                </p>
                {chatInfo.type === MESSAGE_TYPES.SENT && !chatInfo.isPending && (
                  <Icon
                    icon="charm:tick-double"
                    width="14"
                    height="14"
                    className="text-blue-500"
                  />
                )}
                {chatInfo.isPending && (
                  <Icon
                    icon="mdi:clock-outline"
                    width="14"
                    height="14"
                    className="text-gray-400"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MessageArea = ({ currentChatPersonId }: { currentChatPersonId: string }) => {
    const [chatHistory, setChatHistory] = useState<CHAT_INFO_TYPE[]>([])
    const [profileInfo, setProfileInfo] = useState<ProfileInfoType | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [labels, setLabels] = useState<LabelData[]>([])
    const [selectedLabels, setSelectedLabels] = useState<LabelData[]>([])
    const [message, setMessage] = useState<string>("")
    const [currentSelectedMessageId, setCurrentSelectedMessageId] = useState<string>("")
    const [isScrolltobottomVisible, setisScrolltobottomVisible] = useState<boolean>(false)
    const [isLabelModalOpen, setIsLabelModalOpen] = useState<boolean>(false)
    const [, setCurrentChatId] = useState<string | null>(null)

    const processedMessageIds = useRef<Set<string>>(new Set())

    const { user } = useAuthContext()
    const messageAreaRef = useRef<HTMLDivElement>(null)
    // @ts-expect-error Supabase RealtimeChannel type is not properly exposed in the types
    const realtimeChannelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
      processedMessageIds.current.clear();
    }, [currentChatPersonId]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      const element = messageAreaRef.current
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior
        })
      }
    }, [])

    const initializeChat = useCallback(async () => {
      if (!currentChatPersonId || !user) {
        console.log("📌 No current chat person ID or user, resetting chat state")
        setChatHistory([])
        setProfileInfo(undefined)
        setSelectedLabels([])
        setCurrentChatId(null)
        setIsLoading(false)
        // Clear processed message IDs
        processedMessageIds.current.clear()
        return
      }

      console.log(`📌 Initializing chat for user ${user.id} with partner ${currentChatPersonId}`)
      setIsLoading(true)
      setChatHistory([])
      setCurrentSelectedMessageId("")
      // Clear processed message IDs for new chat
      processedMessageIds.current.clear()

      try {
        const [profileResponse, messagesResponse] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", currentChatPersonId)
            .maybeSingle(),
          supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${currentChatPersonId}),and(sender_id.eq.${currentChatPersonId},receiver_id.eq.${user.id})`)
            .order("created_at", { ascending: true }),
        ])

        if (profileResponse.error) {
          console.error("❌ Error fetching profile:", profileResponse.error)
          return
        }

        console.log(`📌 Profile fetched: ${profileResponse.data?.name}`)
        setProfileInfo(profileResponse.data)

        if (messagesResponse.data && profileResponse.data) {
          console.log(`📌 Fetched ${messagesResponse.data.length} messages`)
          
          const formattedMessages: CHAT_INFO_TYPE[] = messagesResponse.data.map((d) => ({
            id: d.id,
            content: d.content,
            is_read: d.is_read,
            createdAt: d.created_at,
            sender_id: d.sender_id,
            receiver_id: d.receiver_id,
            name: d.sender_id === user.id ? user.name || "" : profileResponse.data.name,
            number: d.sender_id === user.id ? user.phone || "" : profileResponse.data.phone,
            type: d.sender_id === user.id ? MESSAGE_TYPES.SENT : MESSAGE_TYPES.RECEIVED,
            replied_id: d.replied_id,
            isPending: false
          }))

          // Add all existing message IDs to the processed set
          messagesResponse.data.forEach(msg => {
            processedMessageIds.current.add(msg.id)
          })

          setChatHistory(formattedMessages)
        }

        setTimeout(() => scrollToBottom("auto"), 100)
      } catch (error) {
        console.error("❌ Error initializing chat:", error)
      } finally {
        setIsLoading(false)
      }
    }, [currentChatPersonId, user, scrollToBottom, processedMessageIds])

    const fetchLabels = useCallback(async () => {
      if (!user) return

      try {
        const [labelsResponse, selectedLabelsResponse] = await Promise.all([
          supabase
            .from("chat_label_types")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("chat_labels")
            .select("chat_partner_id, label_ids")
            .eq("user_id", user.id)
            .eq("chat_partner_id", currentChatPersonId)
            .maybeSingle()
        ])

        if (labelsResponse.data) {
          setLabels(labelsResponse.data)

          if (selectedLabelsResponse.data?.label_ids) {
            const selectedLabelsData = labelsResponse.data.filter((label) =>
              selectedLabelsResponse.data!.label_ids.includes(label.id)
            )
            setSelectedLabels(selectedLabelsData)
          } else {
            setSelectedLabels([])
          }
        }
      } catch (error) {
        console.error("❌ Error fetching labels:", error)
      }
    }, [user, currentChatPersonId])

    // @ts-expect-error Supabase realtime payload structure is complex and varies
    const handleNewMessage = useCallback((newMessage) => {
      if (!user || !profileInfo) {
        console.log("❌ Can't handle new message: missing user or profile info");
        return;
      }

      // Check if we've already processed this message
      if (processedMessageIds.current.has(newMessage.id)) {
        console.log("🛑 Already processed this message ID, preventing duplicate:", newMessage.id);
        return;
      }

      console.log("🟢 Realtime: Processing new message:", newMessage);
      console.log("🟡 Current user ID:", user.id);
      console.log("🟡 Current chat person ID:", currentChatPersonId);

      // Check if message is relevant to current chat
      const isRelevantMessage = 
        (newMessage.sender_id === user.id && newMessage.receiver_id === currentChatPersonId) ||
        (newMessage.sender_id === currentChatPersonId && newMessage.receiver_id === user.id);

      if (!isRelevantMessage) {
        console.log("❌ Message not relevant to current chat");
        return;
      }

      const isMine = newMessage.sender_id === user.id;
      console.log(`📌 Message is ${isMine ? 'mine' : 'from partner'}`);

      const formattedMessage: CHAT_INFO_TYPE = {
        id: newMessage.id,
        content: newMessage.content,
        is_read: newMessage.is_read,
        createdAt: newMessage.created_at,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        name: isMine ? user.name || "" : profileInfo.name || "",
        number: isMine ? user.phone || "" : profileInfo.phone || "",
        type: isMine ? MESSAGE_TYPES.SENT : MESSAGE_TYPES.RECEIVED,
        replied_id: newMessage.replied_id,
        isPending: false
      };

      // Add this message ID to our processed set
      processedMessageIds.current.add(newMessage.id);

      setChatHistory((prev) => {
        // Check if message already exists by ID
        if (prev.some((msg) => msg.id === newMessage.id)) {
          console.log("🔁 Message already exists in chat history. Skipping.");
          return prev;
        }

        // Check for pending message replacement
        const existingPendingIndex = prev.findIndex(
          (m) =>
            m.isPending &&
            m.content === newMessage.content &&
            m.sender_id === newMessage.sender_id &&
            m.receiver_id === newMessage.receiver_id
        );

        if (existingPendingIndex !== -1) {
          console.log("✅ Replacing pending message at index:", existingPendingIndex);
          const updated = [...prev];
          updated[existingPendingIndex] = formattedMessage;
          return updated;
        }

        console.log("➕ Adding new realtime message to chat.");
        return [...prev, formattedMessage];
      });

      // Use a small timeout to avoid duplicate scrolls
      const scrollTimeoutId = setTimeout(() => scrollToBottom(), 50);
      return () => clearTimeout(scrollTimeoutId);
    }, [user, profileInfo, currentChatPersonId, scrollToBottom, processedMessageIds]);

    const sendMessage = useCallback(async () => {
      if (!message.trim() || !user || !currentChatPersonId) return

      console.log(`📌 Sending message: "${message}" to ${currentChatPersonId}`)
      
      const tempId = `temp_${Date.now()}_${Math.random()}`
      const currentMessageText = message.trim();
      
      const tempMessage: CHAT_INFO_TYPE = {
        id: tempId,
        type: MESSAGE_TYPES.SENT,
        name: user.name || "",
        content: currentMessageText,
        sender_id: user.id,
        receiver_id: currentChatPersonId,
        is_read: false,
        createdAt: new Date().toISOString(),
        number: user.phone || "",
        replied_id: currentSelectedMessageId || "",
        isPending: true,
      }

      // Update UI first
      setChatHistory((prev) => [...prev, tempMessage])
      scrollToBottom()
      setMessage("")
      setCurrentSelectedMessageId("")

      try {
        console.log(`📌 Inserting message into database: "${currentMessageText}"`)
        
       
        let timeoutWarningShown = false;
        const timeoutId = setTimeout(() => {
          timeoutWarningShown = true;
          console.log("⏱️ Database operation is taking longer than expected...");
          console.log("💡 This may be due to the database trigger that creates or finds a chat.");
        }, 5000);
        
        // Insert message - the database trigger will handle chat creation
        const { data: newMessage, error, status, statusText } = await supabase
          .from("messages")
          .insert([{
            sender_id: user.id,
            receiver_id: currentChatPersonId,
            content: currentMessageText,
            replied_id: currentSelectedMessageId || null,
            // No need to set chat_id, the database trigger will handle it
          }])
          .select()
          .single();
        
        clearTimeout(timeoutId);
        
        if (timeoutWarningShown) {
          console.log("✅ Database operation completed successfully after delay");
        }
        
        console.log(`📊 Database response status: ${status} ${statusText || ''}`)

        if (error) {
          console.error("❌ Error inserting message:", error)
          throw error
        }

        if (!newMessage) {
          console.error("❌ No message data returned from database")
          throw new Error("No message data returned")
        }

        console.log(`✅ Message inserted successfully:`, newMessage)

        // Update UI immediately instead of waiting for realtime
        const formattedMessage: CHAT_INFO_TYPE = {
          id: newMessage.id,
          type: MESSAGE_TYPES.SENT,
          name: user.name || "",
          content: newMessage.content,
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          is_read: newMessage.is_read,
          createdAt: newMessage.created_at,
          number: user.phone || "",
          replied_id: newMessage.replied_id || "",
          isPending: false,
        }

        // Update the temporary message with the real one
        setChatHistory((prev) =>
          prev.map((msg) => (msg.id === tempId ? formattedMessage : msg))
        )
        
        console.log(`✅ UI updated with confirmed message`)
      }
      
      catch (error) {
        console.error("❌ Error sending message:", error)
        
        // Remove the temporary message on error
        setChatHistory((prev) => prev.filter((msg) => msg.id !== tempId))
        
        // Show user-friendly error
        alert("Failed to send message. The server is taking too long to respond. Please try again later.")
      }
    }, [message, user, currentChatPersonId, currentSelectedMessageId, scrollToBottom])

    const addLabels = useCallback(async () => {
      if (!user) return

      try {
        const { error } = await supabase
          .from("chat_labels")
          .upsert([{
            user_id: user.id,
            chat_partner_id: currentChatPersonId,
            label_ids: selectedLabels.map((label) => label.id),
          }], { onConflict: "user_id, chat_partner_id" })

        if (error) {
          console.error("❌ Error adding labels:", error)
        } else {
          setIsLabelModalOpen(false)
        }
      } catch (error) {
        console.error("❌ Error adding labels:", error)
      }
    }, [user, currentChatPersonId, selectedLabels])

    // Initialize chat when dependencies change
    useEffect(() => {
      initializeChat()
    }, [initializeChat])

    // Fetch labels when dependencies change
    useEffect(() => {
      fetchLabels()
    }, [fetchLabels])

    // Set up realtime subscription
    useEffect(() => {
      if (!user || !currentChatPersonId) {
        // Clean up existing subscription
        if (realtimeChannelRef.current) {
          console.log("🧹 Cleaning up realtime subscription")
          supabase.removeChannel(realtimeChannelRef.current)
          realtimeChannelRef.current = null
        }
        return
      }

      // Clean up existing subscription before creating new one
      if (realtimeChannelRef.current) {
        console.log("🧹 Cleaning up existing realtime subscription")
        supabase.removeChannel(realtimeChannelRef.current)
      }

      // Use a unique channel name that covers both directions of communication
      const channelId = [user.id, currentChatPersonId].sort().join('-')
      const channelName = `chat-messages-${channelId}`
      console.log("🧠 Setting up realtime channel:", channelName);

      try {
        const subscription = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              // We can't use OR conditions in the filter, so we'll do the filtering in the callback
            },
            (payload) => {
              console.log(`📩 Realtime event (${payload.eventType}):`, payload);
              
              if (payload.eventType === 'INSERT') {
                const msg = payload.new;
                // Filter relevant messages in the callback
                const isRelevantMessage = 
                  (msg.sender_id === user.id && msg.receiver_id === currentChatPersonId) ||
                  (msg.sender_id === currentChatPersonId && msg.receiver_id === user.id);
                
                if (isRelevantMessage) {
                  console.log(`🔔 Handling new message in chat: ${msg.content.substring(0, 20)}...`);
                  handleNewMessage(msg);
                } else {
                  console.log("❌ Message not relevant to current chat");
                }
              }
            }
          )
          .subscribe((status) => {
            console.log(`🔌 Realtime subscription status: ${status}`);
          });

        realtimeChannelRef.current = subscription;
      } catch (error) {
        console.error("❌ Error setting up realtime subscription:", error);
      }

      return () => {
        console.log("🧹 Unsubscribing from realtime channel:", channelName)
        if (realtimeChannelRef.current) {
          try {
            supabase.removeChannel(realtimeChannelRef.current)
          } catch (error) {
            console.error("❌ Error removing channel:", error)
          }
          realtimeChannelRef.current = null
        }
      }
    }, [user?.id, currentChatPersonId, handleNewMessage, processedMessageIds, user])

    // Handle scroll detection
    useEffect(() => {
      const element = messageAreaRef.current
      if (!element) return

      const handleScroll = () => {
        const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 20
        setisScrolltobottomVisible(!isAtBottom)
      }

      element.addEventListener("scroll", handleScroll)
      return () => element.removeEventListener("scroll", handleScroll)
    }, [])

    // Auto scroll when new messages arrive
    useEffect(() => {
      if (chatHistory.length > 0 && !isLoading) {
        scrollToBottom()
      }
    }, [chatHistory, isLoading, scrollToBottom])

    return (
      <div className="w-full h-full flex flex-1">
        <Modal isOpen={isLabelModalOpen} setIsOpen={setIsLabelModalOpen}>
          <div
            className="w-1/2 h-3/5 bg-white rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-lg font-semibold">Chat Labels</h1>
            <div className="flex items-center gap-2 flex-wrap my-3">
              {labels.map((label, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!selectedLabels.includes(label)) {
                      setSelectedLabels((prev) => [...prev, label])
                    }
                  }}
                  className="w-fit h-fit px-2 py-1 rounded-md cursor-pointer bg-green-50"
                >
                  <p className="text-sm" style={{ color: label.color }}>
                    {label.label_name}
                  </p>
                </div>
              ))}
            </div>

            <p>Selected Labels:</p>
            <div className="flex items-center gap-2 flex-wrap my-3">
              {selectedLabels.map((label, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedLabels((prev) => prev.filter((l) => l.id !== label.id))
                  }}
                  className="w-fit h-fit px-2 py-1 rounded-md cursor-pointer bg-ws-green-50"
                >
                  <p className="text-sm" style={{ color: label.color }}>
                    {label.label_name}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={addLabels}
              className="bg-ws-green-400 text-sm px-3 py-1 rounded-md text-white mt-5 cursor-pointer"
            >
              Add labels
            </button>
          </div>
        </Modal>

        <section className="w-full h-full flex flex-col border-r border-ws-green-50 min-h-0 min-w-0" style={{ flex: '0.95' }}>
          <header
            className={`w-full flex items-center justify-between px-4 ${
              !currentChatPersonId && "hidden"
            }`}
            style={{ height: '7%' }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-neutral-300">
                <Icon
                  icon="bi:person-fill"
                  width="14"
                  height="14"
                  className="text-white"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-black text-sm font-bold">{profileInfo?.name}</p>
                <div className="text-neutral-400 text-xs font-medium flex items-center space-x-1">
                  <p>{profileInfo?.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon
                icon="mdi:stars"
                width="20"
                height="20"
                className="text-black"
              />
              <Icon
                icon="proicons:search"
                width="20"
                height="20"
                className="text-black"
              />
            </div>
          </header>

          <div
            className={`relative w-full border-y border-ws-green-50 flex flex-col min-h-0 min-w-0 justify-end ${
              !currentChatPersonId ? "flex-1" : ""
            }`}
            style={{ height: !currentChatPersonId ? 'auto' : '84%' }}
          >
            <Image
              src="/chat.png"
              alt="background"
              className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-100"
              width={1000}
              height={1000}
            />

            {isScrolltobottomVisible && (
              <div className="w-full flex justify-center absolute bottom-4 z-50">
                <div
                  onClick={() => scrollToBottom()}
                  className="bg-white w-14 h-fit py-1 rounded-sm cursor-pointer shadow-md flex justify-center"
                >
                  <Icon icon="mdi-light:arrow-down" width="20" height="20" />
                </div>
              </div>
            )}

            <div
              className="w-full z-40 flex flex-col space-y-5 min-h-0 overflow-y-auto py-3 scrollbar"
              ref={messageAreaRef}
            >
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Spinner variant="green" size="md" />
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <MessageBox
                    key={chat.id}
                    chatInfo={chat}
                    setCurrentSelectedId={setCurrentSelectedMessageId}
                    repliedchatInfo={chatHistory.find((c) => c.id === chat.replied_id)}
                  />
                ))
              )}
            </div>
          </div>

          <footer
            className={`w-full px-5 py-3 relative ${
              !currentChatPersonId && "hidden"
            }`}
            style={{ height: '9%' }}
          >
            {currentSelectedMessageId && (
              <div className="z-50 bg-white">
                <MessageBox
                  chatInfo={
                    chatHistory.find((c) => c.id === currentSelectedMessageId) as CHAT_INFO_TYPE
                  }
                  setCurrentSelectedId={() => setCurrentSelectedMessageId("")}
                />
              </div>
            )}

            <div className="w-full h-full flex flex-col space-y-4">
              <div className="w-full flex items-center justify-between space-x-3">
                <input
                  type="text"
                  value={message}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage()
                  }}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full outline-none text-sm placeholder:text-neutral-400"
                  placeholder="Message..."
                />
                <Icon
                  onClick={sendMessage}
                  icon="ic:round-send"
                  width="20"
                  height="20"
                  className="text-ws-green-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5 text-black [&>*]:cursor-pointer">
                  <Icon icon="icomoon-free:attachment" width="16" height="16" />
                  <Icon icon="proicons:emoji" width="16" height="16" />
                  <Icon icon="mdi-light:clock" width="16" height="16" />
                  <Icon icon="ant-design:reload-time-outline" width="16" height="16" />
                  <Icon icon="mage:stars-c" width="16" height="16" />
                  <Icon icon="mage:note-with-text-fill" width="16" height="16" />
                  <Icon icon="stash:mic-solid" width="16" height="16" />
                </div>

                <div>
                  <button className="flex items-center justify-between border border-neutral-200 rounded-md px-2 py-1 w-32">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                      <p className="text-xs font-medium">{user?.name}</p>
                    </div>
                    <Icon
                      icon="mi:select"
                      width="14"
                      height="14"
                      className="text-neutral-400"
                    />
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </section>

        <section className="w-full h-full flex flex-col" style={{ flex: '0.05' }}>
          <div className="w-full" style={{ height: '7%' }}></div>
          <div className="w-full flex flex-col items-center space-y-8 text-neutral-400 [&>*]:cursor-pointer" style={{ height: '93%' }}>
            <Icon icon="tabler:layout-sidebar-right-expand-filled" width="18" height="18" />
            <Icon icon="lineicons:refresh-circle-1-clockwise" width="18" height="18" />
            <Icon
              onClick={() => setIsLabelModalOpen(true)}
              icon="system-uicons:write"
              width="18"
              height="18"
            />
            <Icon icon="gg:menu-left" width="18" height="18" />
            <Icon icon="arcticons:dots" width="18" height="18" />
            <Icon icon="mdi:hubspot" width="18" height="18" />
            <Icon icon="fluent:people-team-24-filled" width="18" height="18" />
            <Icon icon="humbleicons:at-symbol" width="18" height="18" />
            <Icon icon="ri:folder-image-fill" width="18" height="18" />
            <Icon icon="ri:list-settings-line" width="18" height="18" />
          </div>
        </section>
      </div>
    )
  }

  export default MessageArea