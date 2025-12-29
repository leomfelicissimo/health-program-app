import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Dumbbell, Utensils, Zap, Calendar, TrendingUp, Info } from 'lucide-react';

const App = () => {
  // Load initial state from localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const [activeTab, setActiveTab] = useState(() => loadFromStorage('activeTab', 'program'));
  const [activeWeek, setActiveWeek] = useState(() => loadFromStorage('activeWeek', 1));
  const [checkedItems, setCheckedItems] = useState(() => loadFromStorage('checkedItems', {}));
  const [checkpointWeights, setCheckpointWeights] = useState(() => loadFromStorage('checkpointWeights', {}));
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => loadFromStorage('completedCheckpoints', []));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [unlockedCheckpoint, setUnlockedCheckpoint] = useState(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('activeTab', JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('activeWeek', JSON.stringify(activeWeek));
  }, [activeWeek]);

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('checkpointWeights', JSON.stringify(checkpointWeights));
  }, [checkpointWeights]);

  useEffect(() => {
    localStorage.setItem('completedCheckpoints', JSON.stringify(completedCheckpoints));
  }, [completedCheckpoints]);

  // Toggle checklist items
  const toggleItem = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle checkpoint weight change
  const handleWeightChange = (checkpointId, weight) => {
    setCheckpointWeights(prev => ({
      ...prev,
      [checkpointId]: weight
    }));
  };

  // Calculate day number from week and day index
  const getDayNumber = (week, dayIdx) => {
    let dayNumber = 0;
    for (let w = 1; w < week; w++) {
      dayNumber += weekData[w - 1].days.length;
    }
    return dayNumber + dayIdx + 1;
  };

  // Calculate all checklist item IDs up to a specific day
  const getChecklistItemsUpToDay = (targetDay) => {
    const items = [];
    
    for (let week = 1; week <= 4; week++) {
      const weekDays = weekData[week - 1].days;
      for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
        const dayNumber = getDayNumber(week, dayIdx);
        if (dayNumber > targetDay) break;
        
        // Each day has 5 checklist items
        items.push(`w${week}-d${dayIdx}-wake`);
        items.push(`w${week}-d${dayIdx}-cardio`);
        items.push(`w${week}-d${dayIdx}-lunch`);
        items.push(`w${week}-d${dayIdx}-workout`);
        items.push(`w${week}-d${dayIdx}-dinner`);
      }
    }
    
    return items;
  };

  // Check if checkpoint is automatically completed (all items checked)
  const isCheckpointCompleted = (checkpointDay) => {
    const requiredItems = getChecklistItemsUpToDay(checkpointDay);
    if (requiredItems.length === 0) return false;
    
    // Check if all required items are checked
    const allCompleted = requiredItems.every(itemId => checkedItems[itemId] === true);
    return allCompleted;
  };

  // Progress Calculation
  const calculateWeekProgress = (week) => {
    const weekKeys = Object.keys(checkedItems).filter(key => key.startsWith(`w${week}-`));
    if (weekKeys.length === 0) return 0;
    const completed = weekKeys.filter(key => checkedItems[key]).length;
    // Calculate total items per week (days * 5 items per day)
    const totalItems = weekData[week - 1].days.length * 5;
    return Math.min(Math.round((completed / totalItems) * 100), 100);
  };

  const trainingData = {
    A: [
      { name: "Agachamento Livre", s1: "3x12", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Afundo (Passada)", s1: "3x10/perna", s2: "3x15/perna", s3: "4x15/perna", s4: "4x15/perna" },
      { name: "Elevação Pélvica", s1: "3x15", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Prancha Abdominal", s1: "3x30s", s2: "3x40s", s3: "4x50s", s4: "4x50s" },
    ],
    B: [
      { name: "Flexão de Braço", s1: "3x10", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Polichinelos", s1: "3x45s", s2: "3x1min", s3: "4x1m15s", s4: "4x1m15s" },
      { name: "Remada Curvada", s1: "3x12", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Escalador", s1: "3x30s", s2: "3x1min", s3: "4x1m15s", s4: "4x1m15s" },
    ]
  };

  const weekData = [
    {
      id: 1,
      title: "Semana 1: Adaptação e Desinflamação",
      objective: "Redução de estoques de glicogênio e eliminação de retenção hídrica.",
      days: [
        { name: "Segunda (Dia 1)", training: "Treino A", cardio: "Caminhada Contínua (20 min)", lunch: "Frango + Arroz Integral", dinner: "Peixe/Frango + Brócolis", rule: "Sem açúcar/álcool" },
        { name: "Terça (Dia 2)", training: "Intervalada", cardio: "Intervalada (25 min)", lunch: "Carne Moída + Abóbora", dinner: "Omelete + Espinafre", rule: "3L de água" },
        { name: "Quarta (Dia 3)", training: "Treino B", cardio: "Caminhada Contínua (20 min)", lunch: "Sobrecoxa + Arroz", dinner: "Sopa de Legumes", checkpoint: 1 },
        { name: "Quinta (Dia 4)", training: "Longa", cardio: "Caminhada Longa (40 min)", lunch: "Peixe + Batata Doce", dinner: "Frango + Vagem", rule: "Não comer após 20:30" },
        { name: "Sexta (Dia 5)", training: "Treino A", cardio: "Caminhada Contínua (20 min)", lunch: "Carne Bovina + Arroz Int.", dinner: "Salmão/Atum + Folhas", rule: "Resiliência social" },
        { name: "Sábado (Dia 6)", training: "Longa", cardio: "Caminhada Longa (50 min - Jejum)", lunch: "Churrasco Magro", dinner: "Frango + Creme Abóbora", rule: "Sem bebidas calóricas" },
        { name: "Domingo (Dia 7)", training: "Moderada", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Vegetais Vapor", dinner: "Omelete Simples", checkpoint: 2 }
      ]
    },
    {
      id: 2,
      title: "Semana 2: Otimização Metabólica",
      objective: "Aumento da taxa metabólica e estabilização da glicemia.",
      days: [
        { name: "Segunda (Dia 8)", training: "Treino A (S2)", cardio: "Caminhada Contínua (25 min)", lunch: "Frango + Arroz Int.", dinner: "Carne Moída + Couve" },
        { name: "Terça (Dia 9)", training: "Intervalada", cardio: "Intervalada (30 min)", lunch: "Peixe + Batata Baroa", dinner: "Frango + Folhas" },
        { name: "Quarta (Dia 10)", training: "Treino B (S2)", cardio: "Caminhada Contínua (25 min)", lunch: "Carne Magra + Arroz", dinner: "Atum + Alface", checkpoint: 3 },
        { name: "Quinta (Dia 11)", training: "Longa", cardio: "Caminhada Longa (45 min)", lunch: "Sobrecoxa + Abóbora", dinner: "Omelete + Espinafre" },
        { name: "Sexta (Dia 12)", training: "Treino A (S2)", cardio: "Caminhada Contínua (25 min)", lunch: "Frango + Arroz", dinner: "Peixe + Brócolis" },
        { name: "Sábado (Dia 13)", training: "Longa", cardio: "Caminhada Longa (60 min)", lunch: "Carne Assada + Salada", dinner: "Frango + Abobrinha" },
        { name: "Domingo (Dia 14)", training: "Moderada", cardio: "Caminhada Contínua (40 min)", lunch: "Peixe + Vegetais", dinner: "Sopa de Legumes", checkpoint: 4 }
      ]
    },
    {
      id: 3,
      title: "Semana 3: Intensificação",
      objective: "Estresse metabólico controlado e queima máxima.",
      days: [
        { name: "Segunda (Dia 15)", training: "Treino A (S3)", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz (1 colher)", dinner: "Peixe + Aspargos" },
        { name: "Terça (Dia 16)", training: "Intervalada", cardio: "Intervalada (35 min)", lunch: "Carne Bovina + Vegetais", dinner: "Omelete + Cogumelos" },
        { name: "Quarta (Dia 17)", training: "Treino B (S3)", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz (1 colher)", dinner: "Salada + Frango", checkpoint: 5 },
        { name: "Quinta (Dia 18)", training: "Longa", cardio: "Caminhada Longa (50 min)", lunch: "Peixe + Batata Doce", dinner: "Carne Moída + Vagem" },
        { name: "Sexta (Dia 19)", training: "Treino A (S3)", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz (1 colher)", dinner: "Omelete + Folhas" },
        { name: "Sábado (Dia 20)", training: "Longa", cardio: "Caminhada Longa (70 min)", lunch: "Frango + Salada", dinner: "Peixe + Brócolis" },
        { name: "Domingo (Dia 21)", training: "Moderada", cardio: "Caminhada Contínua (50 min)", lunch: "Carne Magra + Vegetais", dinner: "Sopa de Legumes", checkpoint: 6 }
      ]
    },
    {
      id: 4,
      title: "Semana 4: Consolidação",
      objective: "Manutenção do déficit e preservação de massa magra.",
      days: [
        { name: "Segunda (Dia 22)", training: "Treino A", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz", dinner: "Peixe + Brócolis" },
        { name: "Terça (Dia 23)", training: "Intervalada", cardio: "Caminhada (30 min)", lunch: "Carne + Vegetais", dinner: "Omelete + Espinafre" },
        { name: "Quarta (Dia 24)", training: "Treino B", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz", dinner: "Frango + Salada", checkpoint: 7 },
        { name: "Quinta (Dia 25)", training: "Longa", cardio: "Caminhada Longa (45 min)", lunch: "Peixe + Batata Doce", dinner: "Carne Moída + Couve" },
        { name: "Sexta (Dia 26)", training: "Treino A", cardio: "Caminhada Contínua (30 min)", lunch: "Frango + Arroz", dinner: "Omelete Simples" },
        { name: "Sábado (Dia 27)", training: "Longa", cardio: "Caminhada Longa (60 min)", lunch: "Carne Magra + Salada", dinner: "Peixe + Brócolis", checkpoint: 8 },
        { name: "Domingo (Dia 28)", training: "Moderada", cardio: "Caminhada Contínua (40 min)", lunch: "Frango + Vegetais", dinner: "Sopa de Legumes" },
        { name: "Dia 29", training: "Treino B", cardio: "Caminhada Contínua (30 min)", lunch: "Peixe + Vegetais", dinner: "Frango + Folhas" },
        { name: "Dia 30", training: "Final", cardio: "Caminhada Contínua (40 min)", lunch: "Carne Bovina + Vegetais", dinner: "Peixe + Brócolis", checkpoint: 'Final' }
      ]
    }
  ];

  const checkpoints = [
    { id: 1, day: 3, loss: "-1kg a -1.5kg", desc: "Corpo esvaziando reservas de açúcar e liberando água.", msg: "O início é o ajuste da balança. Mantenha a precisão." },
    { id: 2, day: 7, loss: "-2kg a -2.5kg", desc: "Inflamação sistêmica diminuiu. Disposição matinal subindo.", msg: "Fase crítica de abstinência concluída." },
    { id: 3, day: 10, loss: "-2.8kg a -3.5kg", desc: "Utilização de gordura estocada como energia principal.", msg: "A consistência é a única variável que você controla." },
    { id: 4, day: 14, loss: "-3.5kg a -4.5kg", desc: "Ajuste de receptores de insulina. Menos fome.", msg: "Você chegou à metade. O resultado visual é nítido." },
    { id: 5, day: 17, loss: "-4.5kg a -5.5kg", desc: "Ativação máxima da lipólise. Metabolismo elevado.", msg: "Intensidade é a chave na Semana 3." },
    { id: 6, day: 21, loss: "-5.5kg a -6kg", desc: "Reeducação do paladar e controle de impulsos.", msg: "Faltam apenas 9 dias. O 'eu' do passado ficaria orgulhoso." },
    { id: 7, day: 24, loss: "-6kg a -6.5kg", desc: "Eficiência no transporte de oxigênio.", msg: "O objetivo final está visível. Mantenha a guarda alta." },
    { id: 8, day: 27, loss: "-6.5kg a -6.8kg", desc: "Mudança na composição corporal. Menos volume abdominal.", msg: "Execute com perfeição militar." },
    { id: 9, day: 30, loss: "-7kg", desc: "Reset metabólico, disciplina e performance.", msg: "Você provou que a execução vence a motivação." }
  ];

  // Detect when a checkpoint is completed
  useEffect(() => {
    // Only check if checkedItems actually changed (user interaction)
    checkpoints.forEach(cp => {
      const wasCompleted = completedCheckpoints.includes(cp.id);
      const isNowCompleted = isCheckpointCompleted(cp.day);
      
      // If checkpoint just got completed (wasn't before, but is now)
      if (!wasCompleted && isNowCompleted) {
        // Use setTimeout to ensure state updates happen after render
        setTimeout(() => {
          setCompletedCheckpoints(prev => {
            if (!prev.includes(cp.id)) {
              return [...prev, cp.id];
            }
            return prev;
          });
          setUnlockedCheckpoint(cp);
          setShowSuccessModal(true);
        }, 100);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems]);

  const ChecklistItem = ({ id, label, icon: Icon }) => (
    <div 
      onClick={() => toggleItem(id)}
      className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all ${checkedItems[id] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 border'}`}
    >
      {checkedItems[id] ? <CheckCircle2 className="text-green-600 mr-3 shrink-0" size={20} /> : <Circle className="text-gray-400 mr-3 shrink-0" size={20} />}
      <div className="flex items-center gap-2 overflow-hidden">
        {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
        <span className={`text-sm sm:text-base truncate ${checkedItems[id] ? 'text-green-800 line-through opacity-70' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
    </div>
  );

  // Get checkpoint completion status and progress
  const getCheckpointStatus = (checkpointDay) => {
    const requiredItems = getChecklistItemsUpToDay(checkpointDay);
    if (requiredItems.length === 0) return { completed: false, progress: 0 };
    
    const completedCount = requiredItems.filter(itemId => checkedItems[itemId] === true).length;
    const progress = Math.round((completedCount / requiredItems.length) * 100);
    const completed = completedCount === requiredItems.length;
    
    return { completed, progress };
  };

  // Confetti Component
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 80 }, (_, i) => i);
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24', '#34d399'];
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confettiPieces.map((piece) => {
          const randomX = Math.random() * 100;
          const randomDelay = Math.random() * 0.5;
          const randomDuration = 2 + Math.random() * 1;
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const randomSize = Math.random() * 8 + 4;
          const randomRotation = Math.random() * 360;
          
          return (
            <div
              key={piece}
              className="absolute confetti-piece"
              style={{
                left: `${randomX}%`,
                top: '-10px',
                animationDelay: `${randomDelay}s`,
                animationDuration: `${randomDuration}s`,
                backgroundColor: randomColor,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                transform: `rotate(${randomRotation}deg)`,
              }}
            />
          );
        })}
      </div>
    );
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !unlockedCheckpoint) return null;

    return (
      <>
        <Confetti />
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowSuccessModal(false)}>
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Resultado Atingido!
              </h2>
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">
                  Dia {unlockedCheckpoint.day}
                </p>
                <p className="text-xl font-bold text-green-900 mb-1">
                  {unlockedCheckpoint.loss}
                </p>
                <p className="text-sm text-green-700">
                  {unlockedCheckpoint.desc}
                </p>
              </div>
              <p className="text-slate-600 mb-6 italic">
                "{unlockedCheckpoint.msg}"
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('checkpoints');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Ver Detalhes
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-2 text-slate-500 hover:text-slate-700 font-medium py-2"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <SuccessModal />
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PROTOCOLO 7em30</h1>
            <p className="text-slate-400 text-sm">30 Dias de Execução Estrita</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Status Geral</p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map(w => (
                <div key={w} className={`h-2 w-8 rounded-full ${calculateWeekProgress(w) === 100 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border p-1 mb-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('program')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'program' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar size={18} /> Cronograma
          </button>
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'workouts' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Dumbbell size={18} /> Treinos
          </button>
          <button 
            onClick={() => setActiveTab('checkpoints')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'checkpoints' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <TrendingUp size={18} /> Checkpoints
          </button>
        </div>

        {activeTab === 'program' && (
          <>
            {/* Week Selector */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[1, 2, 3, 4].map(w => (
                <button
                  key={w}
                  onClick={() => setActiveWeek(w)}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${activeWeek === w ? 'border-slate-900 bg-white shadow-md' : 'border-transparent bg-slate-100 opacity-60'}`}
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Sem</span>
                  <span className="text-xl font-black">{w}</span>
                  <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div className="bg-green-500 h-full" style={{ width: `${calculateWeekProgress(w)}%` }}></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Week Content */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-bold mb-2">{weekData[activeWeek-1].title}</h2>
                <div className="flex items-start gap-2 text-slate-300 text-sm">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>{weekData[activeWeek-1].objective}</p>
                </div>
              </div>

              {weekData[activeWeek-1].days.map((day, idx) => {
                const dayNumber = getDayNumber(activeWeek, idx);
                return (
                  <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Dia {dayNumber}</span>
                        {day.name}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Checklist Diário</p>
                      <ChecklistItem id={`w${activeWeek}-d${idx}-wake`} label="Manhã: 500ml água + Café" icon={Zap} />
                      <ChecklistItem id={`w${activeWeek}-d${idx}-cardio`} label={day.cardio} icon={Calendar} />
                      <ChecklistItem id={`w${activeWeek}-d${idx}-lunch`} label={`Almoço: ${day.lunch}`} icon={Utensils} />
                      <ChecklistItem id={`w${activeWeek}-d${idx}-workout`} label={day.training} icon={Dumbbell} />
                      <ChecklistItem id={`w${activeWeek}-d${idx}-dinner`} label={`Jantar: ${day.dinner}`} icon={Utensils} />
                      {day.rule && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium">
                          Regra: {day.rule}
                        </div>
                      )}
                      {day.checkpoint && (() => {
                        const checkpoint = checkpoints.find(cp => cp.id === day.checkpoint || (day.checkpoint === 'Final' && cp.id === 9));
                        if (!checkpoint) return null;
                        const { completed } = getCheckpointStatus(checkpoint.day);
                        // Só mostra o checkpoint se foi completado
                        if (!completed) return null;
                        return (
                          <div className="mt-2 p-3 bg-green-600 rounded-lg text-white flex justify-between items-center">
                            <span className="font-bold">✓ RESULTADO ATINGIDO!</span>
                            <button 
                              onClick={() => setActiveTab('checkpoints')} 
                              className="text-xs bg-white text-green-600 px-2 py-1 rounded font-bold uppercase hover:bg-green-50"
                            >
                              Ver resultado
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 border-b pb-4 text-slate-900">
                TREINO A <span className="text-sm font-normal text-slate-400">(Inferiores & Core)</span>
              </h2>
              <div className="space-y-6">
                {trainingData.A.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-800">{ex.name}</h4>
                      <p className="text-xs text-slate-400">Focar em amplitude</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {ex[`s${activeWeek}`]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 border-b pb-4 text-slate-900">
                TREINO B <span className="text-sm font-normal text-slate-400">(Superior & Cardio)</span>
              </h2>
              <div className="space-y-6">
                {trainingData.B.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-800">{ex.name}</h4>
                      <p className="text-xs text-slate-400">Intensidade alta</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {ex[`s${activeWeek}`]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 mb-6">RESULTADOS ATINGIDOS</h2>
            {(() => {
              const completedCheckpoints = checkpoints.filter(cp => {
                const { completed } = getCheckpointStatus(cp.day);
                return completed;
              });

              if (completedCheckpoints.length === 0) {
                return (
                  <div className="bg-white border rounded-xl p-8 shadow-sm text-center">
                    <div className="text-slate-400 mb-4">
                      <TrendingUp size={48} className="mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum resultado atingido ainda</h3>
                    <p className="text-sm text-slate-500">
                      Complete todos os itens da checklist para desbloquear os resultados dos checkpoints.
                    </p>
                  </div>
                );
              }

              return completedCheckpoints.map((cp) => (
                <div 
                  key={cp.id} 
                  className="bg-white border-l-4 border-l-green-600 rounded-xl p-6 shadow-sm border border-gray-100 bg-green-50/30"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider bg-green-100 text-green-700">
                          DIA {cp.day}
                        </span>
                        <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded uppercase">
                          ✓ Resultado Atingido
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Resultado Esperado: {cp.loss}</h3>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="Peso (kg)"
                        value={checkpointWeights[cp.id] || ''}
                        onChange={(e) => handleWeightChange(cp.id, e.target.value)}
                        className="w-24 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      />
                      {checkpointWeights[cp.id] && (
                        <span className="text-xs text-slate-500 mt-1">Registrado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Processo:</span> {cp.desc}
                    </p>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <p className="text-green-800 font-semibold text-sm">
                      🎉 Parabéns! Você completou todos os itens até o dia {cp.day}. 
                      Você possivelmente atingiu o resultado esperado de {cp.loss}.
                    </p>
                  </div>
                  
                  <p className="text-green-700 font-medium italic text-sm mt-3">"{cp.msg}"</p>
                </div>
              ));
            })()}
          </div>
        )}
      </main>

      {/* Floating Action Button for Weight Entry (Optional) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around text-slate-400 sm:hidden">
        <button onClick={() => setActiveTab('program')} className={activeTab === 'program' ? 'text-slate-900' : ''}>
          <Calendar size={24} />
        </button>
        <button onClick={() => setActiveTab('workouts')} className={activeTab === 'workouts' ? 'text-slate-900' : ''}>
          <Dumbbell size={24} />
        </button>
        <button onClick={() => setActiveTab('checkpoints')} className={activeTab === 'checkpoints' ? 'text-slate-900' : ''}>
          <TrendingUp size={24} />
        </button>
      </footer>
    </div>
  );
};

export default App;

