/* src/components/KanbanBoard.tsx */
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

const STATUS_META: Record<Task["status"], { label: string; tint: string }> = {
  todo: { label: "To Do", tint: "from-sky-400/30 to-sky-300/10" },
  in_progress: { label: "In Progress", tint: "from-amber-400/30 to-amber-300/10" },
  done: { label: "Completed", tint: "from-emerald-400/30 to-emerald-300/10" },
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
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
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
    [tasks]
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
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            setSelectedTask(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium shadow-lg shadow-indigo-900/20 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          + New Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(STATUS_META) as Array<Task["status"]>).map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`glass-col border border-white/10 relative`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${STATUS_META[status].tint}`}
                  />
                  <div className="p-4 flex items-center justify-between">
                    <h2 className="text-white font-semibold tracking-wide uppercase text-sm">
                      {STATUS_META[status].label}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                      {columns[status].length}
                    </span>
                  </div>

                  <div className="px-3 pb-3 space-y-3 min-h-[300px]">
                    {loading && (
                      <div className="glass-tile p-4 text-slate-300/90">
                        Loading...
                      </div>
                    )}
                    {!loading && columns[status].length === 0 && (
                      <div className="glass-tile p-4 text-slate-300/80">
                        No tasks
                      </div>
                    )}
                    {!loading &&
                      columns[status].map((task, index) => (
                        <Draggable
                          draggableId={task.id}
                          index={index}
                          key={task.id}
                        >
                          {(provided: DraggableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                setSelectedTask(task);
                                setModalOpen(true);
                              }}
                              className="task-card group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-white font-medium leading-tight">
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="text-sm text-slate-300/90 mt-1 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                {task.priority && (
                                  <span
                                    className={`text-[10px] px-2 py-1 rounded-full border ${
                                      task.priority === "High"
                                        ? "bg-rose-500/15 text-rose-200 border-rose-400/30"
                                        : task.priority === "Medium"
                                        ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
                                        : "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-slate-400">
                                  Drag to move
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
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
        task={selectedTask ?? undefined}
      />
    </>
  );
}
