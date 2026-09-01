"use client";

import { useState } from "react";
import ChatRoom from "@/components/rooms/ChatRoom";

const activeRooms = [
  { id: "room-1", name: "Food Split", count: 4, type: "#foodsplit", isCreator: true },
  { id: "room-2", name: "Cab to Station (6 PM)", count: 3, type: "#cabsplit", isCreator: false },
  { id: "room-3", name: "Selling Watch", count: 2, type: "#resell", isCreator: false },
];

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState(activeRooms[0]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Rooms</h1>
        <p className="mt-1 text-sm text-gray-500">
          Coordinate split fares, food orders, and marketplace chats in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Room List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Available Rooms
          </h2>

          <div className="space-y-2">
            {activeRooms.map((room) => {
              const isSelected = selectedRoom.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "border-black bg-white shadow-sm ring-2 ring-black"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">
                      {room.type}
                    </span>
                    <span className="text-xs text-green-600 font-medium">● Live</span>
                  </div>
                  <h3 className="mt-2 font-bold text-gray-900">{room.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {room.isCreator ? "You created this room" : `${room.count} members active`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Chat Room */}
        <div className="lg:col-span-2">
          <ChatRoom
            key={selectedRoom.id}
            roomName={selectedRoom.name}
            isCreator={selectedRoom.isCreator}
          />
        </div>
      </div>
    </main>
  );
}
