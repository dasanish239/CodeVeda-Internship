import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Simulated Backend API
class TaskAPI {
  constructor() {
    this.tasks = [
      { id: 1, title: 'Complete project documentation', description: 'Write comprehensive docs for the API', status: 'in-progress', priority: 'high', dueDate: '2024-10-10', createdAt: '2024-10-01' },
      { id: 2, title: 'Review pull requests', description: 'Review and merge pending PRs', status: 'todo', priority: 'medium', dueDate: '2024-10-08', createdAt: '2024-10-02' },
      { id: 3, title: 'Update dependencies', description: 'Update all npm packages to latest versions', status: 'completed', priority: 'low', dueDate: '2024-10-05', createdAt: '2024-09-30' }
    ];
    this.nextId = 4;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async getAllTasks() {
    await this.delay();
    return { success: true, data: [...this.tasks] };
  }

  async createTask(taskData) {
    await this.delay();
    const newTask = {
      id: this.nextId++,
      ...taskData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.tasks.unshift(newTask);
    return { success: true, data: newTask };
  }

  async updateTask(id, taskData) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...taskData };
      return { success: true, data: this.tasks[index] };
    }
    return { success: false, error: 'Task not found' };
  }

  async deleteTask(id) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Task not found' };
  }
}

const api = new TaskAPI();

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.getAllTasks();
      if (response.success) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      if (editingTask) {
        const response = await api.updateTask(editingTask.id, formData);
        if (response.success) {
          setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
          resetForm();
          setError('');
        }
      } else {
        const response = await api.createTask(formData);
        if (response.success) {
          setTasks([response.data, ...tasks]);
          resetForm();
          setError('');
        }
      }
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.deleteTask(id);
        if (response.success) {
          setTasks(tasks.filter(t => t.id !== id));
        }
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: ''
    });
    setShowForm(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📋 Task Manager
              </h1>
              <p className="text-gray-600">Full-Stack CRUD Application with REST API</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? 'Cancel' : 'New Task'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard label="Total Tasks" value={stats.total} color="purple" />
            <StatCard label="To Do" value={stats.todo} color="gray" />
            <StatCard label="In Progress" value={stats.inProgress} color="blue" />
            <StatCard label="Completed" value={stats.completed} color="green" />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'todo', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading tasks...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getStatusIcon={getStatusIcon}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 mt-2">Create a new task to get started</p>
          </div>
        )}

        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Built by Anish Das | Full-Stack CRUD Application | Codveda Technology
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    gray: 'from-gray-500 to-gray-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-4 rounded-lg`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, getStatusIcon, getPriorityColor, getStatusColor }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>📅 Due: {task.dueDate}</span>
        <span>Created: {task.createdAt}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
