import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TaskModal from "./TaskModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTasks((prev) => [...prev, payload.new]);
        }
        if (payload.eventType === "UPDATE") {
          setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
        }
        if (payload.eventType === "DELETE") {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase.from("tasks").select("*");
    if (!error && data) setTasks(data);
    setLoading(false);
  }

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  // ✅ Handle drag end
  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // Update Supabase
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggableId);

    if (error) console.error("Drag update failed:", error.message);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([status, columnTasks]) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-lg shadow p-4 min-h-[300px]"
                >
                  <h2 className="text-lg font-semibold capitalize mb-4">
                    {status.replace("_", " ")}
                  </h2>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <p className="text-sm text-gray-500">No tasks</p>
                    ) : (
                      columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                setSelectedTask(task);
                                setModalOpen(true);
                              }}
                              className="p-3 bg-yellow-100 rounded-lg shadow cursor-pointer hover:bg-yellow-200"
                            >
                              <p className="font-medium">{task.title}</p>
                              {task.priority && (
                                <p className="text-xs text-gray-600">
                                  Priority: {task.priority}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
