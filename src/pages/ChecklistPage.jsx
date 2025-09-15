import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2, X, UploadCloud, Paperclip, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';

const ChecklistPage = () => {
  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = localStorage.getItem('checklistCategories');
      return savedCategories ? JSON.parse(savedCategories) : [];
    } catch (error) {
      console.error("Error parsing checklist categories from localStorage", error);
      return [];
    }
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('checklistCategories', JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving checklist categories to localStorage", error);
    }
  }, [categories]);

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      setCategories([...categories, { id: Date.now(), name: newCategoryName, items: [] }]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const handleAddTask = (categoryId, taskName) => {
    if (taskName.trim() !== '') {
      const updatedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, items: [...cat.items, { id: Date.now(), text: taskName, completed: false, file: null }] };
        }
        return cat;
      });
      setCategories(updatedCategories);
    }
  };

  const handleToggleTask = (categoryId, taskId) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === taskId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const handleDeleteTask = (categoryId, taskId) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: cat.items.filter(item => item.id !== taskId) };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const handleFileUpload = (categoryId, taskId, file) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === taskId ? { ...item, file: { name: file.name, size: file.size } } : item
          )
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const handleRemoveFile = (categoryId, taskId) => {
     const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === taskId ? { ...item, file: null } : item
          )
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const { totalProgress, totalTasks, completedTasks } = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    categories.forEach(cat => {
      totalTasks += cat.items.length;
      completedTasks += cat.items.filter(item => item.completed).length;
    });
    const totalProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { totalProgress, totalTasks, completedTasks };
  }, [categories]);

  return (
    <>
      <Helmet>
        <title>Checklist de Cumplimiento - MIR</title>
        <meta name="description" content="Gestiona y verifica el cumplimiento de todas las normativas aplicables." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regresar al dashboard */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/mir/user'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar al Dashboard
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-center text-gray-800">Checklist de Cumplimiento Normativo</h1>
          <p className="text-lg text-center text-gray-500 mt-1 mb-8">Gestiona y verifica el cumplimiento de todas las normativas aplicables</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-red-50 p-6 rounded-xl border border-red-100 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-800">Progreso total</h2>
            <span className="text-sm font-medium text-gray-600">{completedTasks} de {totalTasks} documentos</span>
          </div>
          <Progress value={totalProgress} className="h-2 [&>div]:bg-red-600" />
          <p className="text-sm text-gray-500 mt-2">{totalProgress.toFixed(0)}% completado</p>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categorías Personalizadas</h2>
            <p className="text-gray-500">Crea tus propias listas de tareas y seguimiento personalizado</p>
          </div>
          <Button onClick={() => setIsAddingCategory(true)}><Plus className="mr-2 h-4 w-4" /> Nueva Categoría</Button>
        </div>

        <AnimatePresence>
          {isAddingCategory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <Button onClick={handleAddCategory}>Crear</Button>
                <Button variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancelar</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {categories.length === 0 && !isAddingCategory ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center border-2 border-dashed border-gray-300 p-12 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-xl font-medium text-gray-900">No hay categorías personalizadas</h3>
              <p className="mt-1 text-sm text-gray-500">Crea tu primera categoría para empezar a organizar tus tareas personalizadas.</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddingCategory(true)}><Plus className="mr-2 h-4 w-4" /> Crear Primera Categoría</Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {categories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDeleteCategory={handleDeleteCategory}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={handleRemoveFile}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const CategoryCard = ({ category, onDeleteCategory, onAddTask, onToggleTask, onDeleteTask, onFileUpload, onRemoveFile }) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const fileInputRef = useRef(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const { toast } = useToast();

  const progress = useMemo(() => {
    if (category.items.length === 0) return 0;
    const completed = category.items.filter(item => item.completed).length;
    return (completed / category.items.length) * 100;
  }, [category.items]);

  const handleAddTaskClick = () => {
    onAddTask(category.id, newTaskName);
    setNewTaskName('');
    setIsAddingTask(false);
  };
  
  const handleFileIconClick = (taskId) => {
    setCurrentTaskId(taskId);
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && currentTaskId) {
      onFileUpload(category.id, currentTaskId, file);
      toast({
        title: "Archivo adjuntado",
        description: `Se ha adjuntado "${file.name}".`,
      });
    }
    event.target.value = null; // Reset file input
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-6 rounded-xl shadow-md border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.items.filter(i => i.completed).length} de {category.items.length} completadas</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría "{category.name}" y todas sus tareas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Progress value={progress} className="h-1 mb-4" />
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {category.items.map(item => (
            <motion.div layout key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 group">
              <div className="flex items-center space-x-3 flex-grow">
                <Checkbox id={`task-${item.id}`} checked={item.completed} onCheckedChange={() => onToggleTask(category.id, item.id)} />
                <div className="flex-grow">
                  <Label htmlFor={`task-${item.id}`} className={`transition-colors ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.text}</Label>
                  {item.file && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                      <Paperclip className="h-3 w-3" />
                      <span>{item.file.name} ({(item.file.size / 1024).toFixed(2)} KB)</span>
                       <button onClick={() => onRemoveFile(category.id, item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <X className="h-3 w-3" />
                       </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {!item.file && (
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleFileIconClick(item.id)}>
                     <UploadCloud className="h-4 w-4" />
                   </Button>
                 )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDeleteTask(category.id, item.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {isAddingTask ? (
        <div className="flex items-center gap-2 mt-4">
          <Input
            placeholder="Nueva tarea"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTaskClick()}
            autoFocus
            className="h-9"
          />
          <Button onClick={handleAddTaskClick} size="sm">Añadir</Button>
          <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(false)}>Cancelar</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAddingTask(true)}><Plus className="mr-2 h-4 w-4" /> Añadir Tarea</Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </motion.div>
  );
};

export default ChecklistPage;
