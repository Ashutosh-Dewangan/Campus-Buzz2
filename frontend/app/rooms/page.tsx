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
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Active Rooms
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Join conversations happening around campus.
        </p>
      </div>

      {/* Rooms Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Available Rooms
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
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
                    onClick={() =>
                      setSelectedRoom(room)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-black bg-gray-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                        {room.type}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Live
                      </span>
                    </div>

                    <h3 className="mt-3 truncate font-semibold text-gray-900">
                      {room.name}
                    </h3>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
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
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Active Rooms
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Loading conversations...
          </p>
        </div>
      </main>
    }>
      <RoomsContent />
    </Suspense>
  );
}
