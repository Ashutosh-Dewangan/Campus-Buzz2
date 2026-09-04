"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatRoom from "@/components/rooms/ChatRoom";

const activeRooms = [
  {
    id: "room-1",
    name: "Food Split",
    count: 4,
    type: "#foodsplit",
    isCreator: true,
  },
  {
    id: "room-2",
    name: "Cab to Station (6 PM)",
    count: 3,
    type: "#cabsplit",
    isCreator: false,
  },
  {
    id: "room-3",
    name: "Selling Watch",
    count: 2,
    type: "#resell",
    isCreator: false,
  },
];

function RoomsContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [selectedRoom, setSelectedRoom] = useState(activeRooms[0]);

  useEffect(() => {
    if (!postId) return;

    const roomIndex =
      Number(postId.replace(/\D/g, "")) || 0;

    const room =
      activeRooms[roomIndex % activeRooms.length];

    setSelectedRoom(room);
  }, [postId]);

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="comic-title">Active Rooms</h1>
          <p className="comic-sub">Join conversations happening around campus.</p>
        </div>

        {/* Rooms Layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="comic-card p-4">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="stay-loop-title" style={{ fontSize: 20 }}>
                    Available Rooms
                  </h2>

                  <p className="comic-sub">
                    {activeRooms.length} active conversations
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-sm text-green-600">
                  ●
                </span>
              </div>

              <div className="space-y-2">
                {activeRooms.map((room) => {
                  const isSelected =
                    selectedRoom.id === room.id;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() =>
                        setSelectedRoom(room)
                      }
                      className={`w-full cursor-pointer p-4 text-left comic-card ${
                        isSelected ? "" : "opacity-80"
                      }`}
                      style={
                        isSelected
                          ? { outline: "2px solid var(--neon-cyan)" }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between gap-3">

                        <span className="tag-pill tag-cab">
                          {room.type}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Live
                        </span>
                      </div>

                      <h3 className="mt-3 truncate font-semibold">
                        {room.name}
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                          👥 {room.count}{" "}
                          {room.count === 1
                            ? "member"
                            : "members"}
                        </span>

                        {room.isCreator && (
                          <span className="text-[11px] font-medium text-blue-600">
                            Your room
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </aside>

          {/* Chat */}
          <section className="min-w-0 lg:col-span-2">
            <ChatRoom
              key={selectedRoom.id}
              roomName={selectedRoom.name}
              roomType={selectedRoom.type}
              memberCount={selectedRoom.count}
              isCreator={selectedRoom.isCreator}
            />
          </section>

        </div>
      </div>
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <main className="comic-page">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="comic-title">Active Rooms</h1>
            <p className="comic-sub">Loading conversations...</p>
          </div>
        </div>
      </main>
    }>
      <RoomsContent />
    </Suspense>
  );
}
