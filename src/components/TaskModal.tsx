import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task?: any; // if editing
};

export default function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [status, setStatus] = useState(task?.status || "todo");
  const [description, setDescription] = useState(task?.description || "");

  if (!isOpen) return null;

  async function handleSave() {
    if (!title) return alert("Task title is required");

    if (task) {
      // ✅ Update existing
      const { error } = await supabase
        .from("tasks")
        .update({
          title,
          priority,
          status,
          description,
        })
        .eq("id", task.id);

      if (error) console.error("Update failed:", error.message);
    } else {
      // ✅ Insert new
      const { error } = await supabase.from("tasks").insert([
        {
          title,
          priority,
          status,
          description,
        },
      ]);

      if (error) console.error("Insert failed:", error.message);
    }

    onClose();
  }

  async function handleDelete() {
    if (!task) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) console.error("Delete failed:", error.message);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex justify-between mt-6">
          {task && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
