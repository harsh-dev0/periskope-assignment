"use client"

import { Icon } from "@iconify/react"
import ActionButton, { ActionButtonType } from "../ui/ActionButton"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthContext } from "@/providers/AuthProvider"
import SingleChatBox from "./SingleChatBox"
import { ConversationData, GroupedMessages, ProfileMap } from "@/lib/types/chat.types"

let cachedConversations: ConversationData[] = []

const ChatArea = ({
  updateSelectedPersonId,
  selectedPersonId,
}: {
  updateSelectedPersonId: React.Dispatch<React.SetStateAction<string>>
  selectedPersonId: string
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthContext()
  const [conversationsList, setConversationsList] = useState<
    ConversationData[]
  >([])

  const [searchResultsList, setSearchResultsList] = useState<
    ConversationData[]
  >([])

  const [existingChatsQuery, setExistingChatsQuery] = useState<string>("")
  const [newContactQuery, setNewContactQuery] = useState<string>("")

  const [showSearchInput, setShowSearchInput] = useState<boolean>(false)

  const [sortingEnabled, setSortingEnabled] = useState<boolean>(false)

  const fetchConversationsData = async () => {
    try {
      if (!user?.id) return;

      // Directly query messages instead of using the database function
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        setConversationsList([]);
        cachedConversations = [];
        return;
      }

      // Handle case where there are no messages yet
      if (!messagesData || messagesData.length === 0) {
        setConversationsList([]);
        cachedConversations = [];
        return;
      }

      // Group messages by conversation partner
      interface GroupedMessages {
        [key: string]: {
          person_id: string;
          messages: Array<{
            content: string;
            created_at: string;
          }>;
        };
      }

      const groupedByPartner = messagesData.reduce<GroupedMessages>((acc, message) => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        
        if (!acc[partnerId]) {
          acc[partnerId] = {
            person_id: partnerId,
            messages: [],
          };
        }
        
        acc[partnerId].messages.push({
          content: message.content,
          created_at: message.created_at,
        });
        
        return acc;
      }, {});

      const partnerIds = Object.keys(groupedByPartner);

      // Fetch profile information for all conversation partners
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", partnerIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      // Create a lookup map for profile data
      interface ProfileMap {
        [key: string]: {
          name: string;
          phone: string;
        };
      }

      const profilesMap = profilesData.reduce<ProfileMap>((acc, profile) => {
        acc[profile.id] = {
          name: profile.name,
          phone: profile.phone,
        };
        return acc;
      }, {});

      // Fetch chat labels
      const { data: labelsData, error: labelsError } = await supabase
        .from("chat_labels")
        .select("chat_partner_id, label_ids")
        .eq("user_id", user.id);

      if (labelsError) {
        console.error("Error fetching labels:", labelsError);
      }

      // Get label details
      const { data: labelTypes } = await supabase
        .from("chat_label_types")
        .select("*");

      // Process conversations with the latest message for each partner
      const processedConversations = Object.values(groupedByPartner).map((group) => {
        // Sort messages by date (newest first) and take the latest one
        const sortedMessages = group.messages.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestMessage = sortedMessages[0];
        
        // Get profile details or use defaults
        const profile = profilesMap[group.person_id] || {};
        
        // Find labels for this conversation
        const chatLabels = labelsData?.find(
          (label) => label.chat_partner_id === group.person_id
        );
        
        // Map label IDs to full label objects
        const labels = chatLabels?.label_ids
          ? chatLabels.label_ids.map((id: string) => {
              const labelType = labelTypes?.find((lt) => lt.id === id);
              return labelType 
                ? { 
                    id: labelType.id,
                    label_name: labelType.label_name,
                    color: labelType.color
                  }
                : null;
            }).filter(Boolean)
          : [];

        return {
          person_id: group.person_id,
          name: profile.name || "Unknown User",
          phone: profile.phone || "N/A",
          latest_message: latestMessage.content,
          latest_message_timestamp: latestMessage.created_at,
          labels: labels,
        };
      });

      // Sort conversations by latest message timestamp (newest first)
      processedConversations.sort(
        (a, b) => 
          new Date(b.latest_message_timestamp).getTime() - 
          new Date(a.latest_message_timestamp).getTime()
      );

      setConversationsList(processedConversations);
      cachedConversations = processedConversations;
    } catch (error) {
      console.error("Unexpected error in fetchConversationsData:", error);
      setConversationsList([]);
      cachedConversations = [];
    }
  };

  useEffect(() => {
    if (!user) return

    fetchConversationsData()
  }, [user?.id])

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (newContactQuery.trim()) {
        searchForNewContacts(newContactQuery)
      } else {
        setSearchResultsList([])
      }
    }, 500)

    return () => {
      clearTimeout(delayTimer)
    }
  }, [newContactQuery])

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (existingChatsQuery.trim()) {
        const filteredResults = cachedConversations.filter(
          (conversation) => {
            const query = existingChatsQuery.toLowerCase()
            return (
              conversation.name.toLowerCase().includes(query) ||
              conversation.phone.includes(query) ||
              conversation.latest_message.toLowerCase().includes(query)
            )
          }
        )

        setConversationsList(filteredResults)
      } else {
        setConversationsList([...cachedConversations])
      }
    }, 500)

    return () => {
      clearTimeout(delayTimer)
    }
  }, [existingChatsQuery])

  const searchForNewContacts = async (phoneInput: string) => {
    if (!user?.id) return

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("phone", `%${phoneInput}%`)
      .neq("id", user?.id)

    if (error) {
      console.error("Supabase error:", error)
      setSearchResultsList([])
      return
    }

    const contactsData: ConversationData[] = data.map(
      (contactItem: any) => ({
        person_id: contactItem.id,
        name: contactItem.name,
        phone: contactItem.phone,
        latest_message: "",
        latest_message_timestamp: "",
        labels: [],
      })
    )

    setSearchResultsList(contactsData)
  }

  useEffect(() => {
    const containerElement = scrollContainerRef.current
    if (!containerElement) return

    containerElement.scrollTo({
      behavior: "smooth",
      left: containerElement.offsetWidth * activeTabIndex,
    })
  }, [activeTabIndex])

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full flex scrollbar-hide overflow-x-hidden"
    >
      <div className="w-full h-full flex flex-col shrink-0 min-h-0">
        <header className="w-full h-full flex-[0.07] bg-neutral-100 border-b border-ws-green-50 flex items-center justify-between px-2">
          {showSearchInput ? (
            <>
              <div className="w-full h-full flex items-center">
                <Icon
                  icon={"proicons:search"}
                  width={"20"}
                  height={"20"}
                />

                <input
                  type="text"
                  value={existingChatsQuery}
                  onChange={(e) => {
                    setExistingChatsQuery(e.target.value)
                  }}
                  placeholder="Search"
                  className="w-full px-4 text-sm outline-none"
                />

                <Icon
                  onClick={() => {
                    setShowSearchInput(false)
                    setExistingChatsQuery("")
                  }}
                  className="cursor-pointer"
                  icon={"material-symbols-light:close"}
                  width={"20"}
                  height={"20"}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-ws-green-400 cursor-pointer">
                  <Icon
                    icon={"mingcute:folder-download-fill"}
                    width={"15"}
                    height={"15"}
                  />
                  <p className="text-xs font-semibold">Custom filter</p>
                </button>

                <ActionButton text="Save" type={ActionButtonType.TEXT} />
              </div>

              <div className="flex items-center space-x-2">
                <ActionButton
                  onClickFunc={() => {
                    setShowSearchInput(true)
                  }}
                  icon="proicons:search"
                  text="Search"
                  type={ActionButtonType.ICON_TEXT}
                />

                <div
                  className="w-fit h-fit relative cursor-pointer"
                  onClick={() => {
                    if (!sortingEnabled) {
                      const sortedConversations = [
                        ...cachedConversations,
                      ].sort((conversationA, conversationB) =>
                        conversationB.name.localeCompare(
                          conversationA.name
                        )
                      )

                      setConversationsList([...sortedConversations])
                    } else {
                      setConversationsList([...cachedConversations])
                    }

                    setSortingEnabled(!sortingEnabled)
                  }}
                >
                  {sortingEnabled && (
                    <div className="bg-ws-green-400 rounded-full absolute -right-1 -top-1">
                      <Icon
                        icon={"basil:cross-solid"}
                        width={"14"}
                        height={"14"}
                        className="text-white"
                      />
                    </div>
                  )}

                  <ActionButton
                    icon="bx:filter"
                    text={sortingEnabled ? "Filtered" : "Filter"}
                    color={sortingEnabled ? "#15803d" : "black"}
                  />
                </div>
              </div>
            </>
          )}
        </header>

        <div className="w-full h-full flex-[0.93] flex flex-col min-h-0 relative">
          <div
            onClick={() => {
              setActiveTabIndex(1)
            }}
            className="z-50 absolute bottom-5 right-4 bg-ws-green-400 rounded-full p-2 cursor-pointer"
          >
            <Icon
              icon={"system-uicons:chat-add"}
              width={"20"}
              height={"20"}
              className="text-white"
            />
          </div>

          <div className="w-full flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
            {conversationsList.length === 0 && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">No chats available</p>
              </div>
            )}

            {conversationsList.map((conversationData, idx) => (
              <SingleChatBox
                updateSelectedPersonId={updateSelectedPersonId}
                selectedPersonId={selectedPersonId}
                conversationData={conversationData}
                key={idx}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-full flex flex-col shrink-0 min-h-0">
        <header className="w-full h-full flex-[0.07] bg-neutral-100 border-b border-ws-green-50 items-center justify-between px-2">
          <div className="w-full h-full flex items-center">
            <Icon icon={"proicons:search"} width={"20"} height={"20"} />

            <input
              type="text"
              value={newContactQuery}
              onChange={(e) => {
                setNewContactQuery(e.target.value)
              }}
              placeholder="Search"
              className="w-full px-4 text-sm outline-none"
            />

            <Icon
              onClick={() => {
                setNewContactQuery("")
                setActiveTabIndex(0)
              }}
              className="cursor-pointer"
              icon={"material-symbols-light:close"}
              width={"20"}
              height={"20"}
            />
          </div>
        </header>

        <div className="w-full h-full flex-[0.93] flex flex-col min-h-0 relative">
          <div className="w-full flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
            {searchResultsList.map((conversationData, idx) => (
              <SingleChatBox
                updateSelectedPersonId={updateSelectedPersonId}
                selectedPersonId={selectedPersonId}
                conversationData={conversationData}
                key={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatArea
