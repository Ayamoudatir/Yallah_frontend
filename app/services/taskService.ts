// app/services/taskService.ts
import { Task, TaskStats } from '../types';
import API from './api';

class TaskService {
  /**
   * Toutes les tâches
   */
  async getTasks(): Promise<Task[]> {
    const res = await API.get('/tasks/');
    return res.data;
  }

  /**
   * Tâches par date (si ton backend filtre via ?date=)
   */
  async getTasksByDate(date: string): Promise<Task[]> {
    const res = await API.get(`/tasks/?date=${date}`);
    return res.data;
  }

  /**
   * Tâches du jour
   * 👉 on utilise getTasksByDate
   */
  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasksByDate(today);
  }

  /**
   * Créer une tâche
   */
  async createTask(
    title: string,
    date: string,
    description?: string
  ): Promise<Task> {
    const res = await API.post('/tasks/', {
      title,
      description: description || '',
      date,
      completed: false,
    });
    return res.data;
  }

  /**
   * Modifier une tâche
   */
  async patchTask(id: number, data: Partial<Task>): Promise<Task> {
    const res = await API.patch(`/tasks/${id}/`, data);
    return res.data;
  }

  /**
   * Marquer comme complétée / non complétée
   * 👉 correspond EXACTEMENT à ton backend
   */
  async toggleTask(id: number): Promise<Task> {
    const res = await API.post(`/tasks/${id}/complete/`);
    return res.data;
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(id: number): Promise<void> {
    await API.delete(`/tasks/${id}/`);
  }

  /**
   * Statistiques utilisateur
   * ❌ PAS /tasks/stats/
   * ✅ /stats/
   */
  async getStats(): Promise<TaskStats> {
    const res = await API.get('/stats/');
    return res.data;
  }
}

export default new TaskService();