import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TaskModal from "./TaskModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from "@hello-pangea/dnd";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  status: "todo" | "in_progress" | "done";
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel("tasks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t)),
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase.from("tasks").select("*");
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }

  const columns = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks],
  );

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newStatus = destination.droppableId as Task["status"];
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggableId);
    if (error) console.error("Drag update failed:", error.message);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-3 flex justify-end">
        <button
          onClick={() => {
            setSelectedTask(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          + New Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {(["todo", "in_progress", "done"] as const).map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-50 rounded p-3 min-h-[300px]"
              >
                <h2 className="font-semibold mb-2 uppercase">
                  {status.replace("_", " ")}
                </h2>
                {loading && <p>Loading...</p>}
                {!loading && columns[status].length === 0 && (
                  <p className="text-sm text-gray-500">No tasks</p>
                )}
                {!loading &&
                  columns[status].map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => {
                            setSelectedTask(task);
                            setModalOpen(true);
                          }}
                          className="p-3 bg-yellow-100 rounded-lg shadow cursor-pointer hover:bg-yellow-200 mb-2"
                        >
                          <div className="font-medium">{task.title}</div>
                          {task.priority && (
                            <div className="text-xs text-gray-700">
                              Priority: {task.priority}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask ?? undefined}
      />
    </div>
  );
}
