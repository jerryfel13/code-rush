import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const questionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsData);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await addDoc(collection(db, "questions"), {
        title,
        description,
        difficulty,
        order: Number(order),
        createdAt: new Date().toISOString(),
      });
      setMessage("Question added successfully!");
      setTitle("");
      setDescription("");
      setDifficulty("easy");
      setOrder(1);
      setIsAddModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setMessage("Error adding question.");
    }
    setLoading(false);
  };

  const handleEdit = (question: any) => {
    setSelectedQuestion(question);
    setTitle(question.title);
    setDescription(question.description);
    setDifficulty(question.difficulty);
    setOrder(question.order);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedQuestion) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "questions", selectedQuestion.id), {
        title,
        description,
        difficulty,
        order: Number(order),
      });
      setMessage("Question updated successfully!");
      setIsEditModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setMessage("Error updating question.");
    }
    setLoading(false);
  };

  const handleDelete = (question: any) => {
    setSelectedQuestion(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "questions", selectedQuestion.id));
      setMessage("Question deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchQuestions();
    } catch (err) {
      setMessage("Error deleting question.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-4xl mt-8 p-6 bg-black/40 rounded-lg border border-cyan-700">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Questions Management</h2>
      <Button onClick={() => setIsAddModalOpen(true)}>Add New Question</Button>
      {message && <div className="text-center text-cyan-300 mt-2">{message}</div>}

      <h2 className="text-2xl font-bold text-cyan-400 mt-8 mb-4">All Questions</h2>
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="p-4 bg-black/60 rounded border border-cyan-700">
            <h3 className="font-bold">{question.title}</h3>
            <p>{question.description}</p>
            <p>Difficulty: {question.difficulty}</p>
            <p>Order: {question.order}</p>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => handleEdit(question)}>Edit</Button>
              <Button onClick={() => handleDelete(question)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-black/80 border border-cyan-700 rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-2xl font-bold">Add New Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Textarea
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100">
                <SelectValue placeholder="Select difficulty" className="text-cyan-300" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 border-cyan-700 text-cyan-100">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              type="number"
              min={1}
              placeholder="Order"
              value={order}
              onChange={e => setOrder(Number(e.target.value))}
              required
            />
            <DialogFooter>
              <Button type="submit" className="w-full py-2 bg-cyan-500 text-white font-bold rounded hover:bg-cyan-600 transition" disabled={loading}>
                {loading ? "Adding..." : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-black/80 border border-cyan-700 rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-2xl font-bold">Edit Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
            <Input
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Textarea
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100">
                <SelectValue placeholder="Select difficulty" className="text-cyan-300" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 border-cyan-700 text-cyan-100">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-full p-2 rounded border border-cyan-700 bg-black/60 text-cyan-100 placeholder:text-cyan-300"
              type="number"
              min={1}
              placeholder="Order"
              value={order}
              onChange={e => setOrder(Number(e.target.value))}
              required
            />
            <DialogFooter>
              <Button type="submit" className="w-full py-2 bg-cyan-500 text-white font-bold rounded hover:bg-cyan-600 transition" disabled={loading}>
                {loading ? "Updating..." : "Update Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this question?</p>
          <DialogFooter>
            <Button onClick={confirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 