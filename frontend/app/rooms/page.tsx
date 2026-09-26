"use client";

import {
  Suspense,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import ChatRoom from "@/components/rooms/ChatRoom";

interface Room {
  id: string;
  name: string;
  count: number;
  type: "#foodsplit" | "#cabsplit" | "#resell";
  isCreator: boolean;
  joined: boolean;
}

const activeRooms: Room[] = [
  {
    id: "room-1",
    name: "Food Split",
    count: 4,
    type: "#foodsplit",
    isCreator: true,
    joined: true,
  },
  {
    id: "room-2",
    name: "Cab to Station (6 PM)",
    count: 3,
    type: "#cabsplit",
    isCreator: false,
    joined: true,
  },
  {
    id: "room-3",
    name: "Selling Watch",
    count: 2,
    type: "#resell",
    isCreator: false,
    joined: false,
  },
];

function RoomsContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  const defaultRoom = useMemo(() => {
    if (!postId) return activeRooms[0];
    const roomIndex = Number(postId.replace(/\D/g, "")) || 0;
    return activeRooms[roomIndex % activeRooms.length];
  }, [postId]);

  const selectedRoom =
    (userSelectedId
      ? activeRooms.find((room) => room.id === userSelectedId)
      : null) || defaultRoom;

  const availableRooms = useMemo(
    () =>
      activeRooms.filter(
        (room) => room.id !== selectedRoom.id
      ),
    [selectedRoom]
  );

  if (!selectedRoom) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading rooms...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">
            Campus coordination
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Active Rooms
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
            Join conversations happening around campus.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Room list */}
          <aside>
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="px-2 pb-3 pt-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Other active rooms
                  </h2>

                  <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                    {availableRooms.length} live
                  </span>
                </div>
              </div>

              {availableRooms.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No other rooms
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    You&apos;re viewing the only active room.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() =>
                        setUserSelectedId(room.id)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                          {room.type}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Live
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-semibold text-gray-900">
                        {room.name}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">
                          {room.count} members
                        </span>

                        {room.joined && (
                          <span className="text-[10px] font-semibold text-blue-600">
                            Joined
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Selected room */}
          <section className="min-w-0">
            <div className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Currently viewing
                  </p>

                  <h2 className="mt-1 text-sm font-bold text-gray-900">
                    {selectedRoom.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                    {selectedRoom.type}
                  </span>

                  {selectedRoom.isCreator ? (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                      Created by you
                    </span>
                  ) : selectedRoom.joined ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                      Joined
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

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
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Loading rooms...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <RoomsContent />
    </Suspense>
  );
}