import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Dumbbell, Utensils, Zap, Calendar, TrendingUp, Info, Home, ChevronUp, ChevronDown, ChevronRight, X, List } from 'lucide-react';

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

  const [currentPage, setCurrentPage] = useState(() => loadFromStorage('currentPage', 'home'));
  const [activeWeek, setActiveWeek] = useState(() => loadFromStorage('activeWeek', 1));
  const [activeDayIndex, setActiveDayIndex] = useState(() => loadFromStorage('activeDayIndex', 0));
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [checkedItems, setCheckedItems] = useState(() => loadFromStorage('checkedItems', {}));
  const [checkpointWeights, setCheckpointWeights] = useState(() => loadFromStorage('checkpointWeights', {}));
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => loadFromStorage('completedCheckpoints', []));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [unlockedCheckpoint, setUnlockedCheckpoint] = useState(null);
  const [showItemSuccessModal, setShowItemSuccessModal] = useState(false);
  const [lastCompletedItem, setLastCompletedItem] = useState(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('currentPage', JSON.stringify(currentPage));
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('activeWeek', JSON.stringify(activeWeek));
  }, [activeWeek]);

  useEffect(() => {
    localStorage.setItem('activeDayIndex', JSON.stringify(activeDayIndex));
  }, [activeDayIndex]);

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('checkpointWeights', JSON.stringify(checkpointWeights));
  }, [checkpointWeights]);

  useEffect(() => {
    localStorage.setItem('completedCheckpoints', JSON.stringify(completedCheckpoints));
  }, [completedCheckpoints]);

  // Calculate current day and week based on progress
  const getCurrentDayAndWeek = () => {
    let currentDay = 1;
    for (let week = 1; week <= 4; week++) {
      const weekDays = weekData[week - 1].days;
      for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
        const dayNumber = getDayNumber(week, dayIdx);
        const dayItems = getDayChecklistItems(week, dayIdx);
        const allCompleted = dayItems.length > 0 && dayItems.every(itemId => checkedItems[itemId] === true);
        
        if (!allCompleted) {
          return { week, dayIdx, dayNumber };
        }
        currentDay++;
      }
    }
    // All days completed, return last day
    return { week: 4, dayIdx: weekData[3].days.length - 1, dayNumber: 30 };
  };

  // Initialize current day/week on mount
  useEffect(() => {
    const { week, dayIdx } = getCurrentDayAndWeek();
    if (week !== activeWeek || dayIdx !== activeDayIndex) {
      setActiveWeek(week);
      setActiveDayIndex(dayIdx);
    }
  }, []);

  // Get checklist items for a specific day
  const getDayChecklistItems = (week, dayIdx) => {
    const items = [];
    const day = weekData[week - 1].days[dayIdx];
    if (day.morning) items.push(`w${week}-d${dayIdx}-morning`);
    if (day.breakfast) items.push(`w${week}-d${dayIdx}-breakfast`);
    if (day.lunch) items.push(`w${week}-d${dayIdx}-lunch`);
    if (day.training) items.push(`w${week}-d${dayIdx}-training`);
    if (day.dinner) items.push(`w${week}-d${dayIdx}-dinner`);
    return items;
  };

  // Toggle checklist items with feedback
  const toggleItem = (id, itemType = null, itemData = null) => {
    const wasChecked = checkedItems[id];
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

    // Show success modal if item was just completed
    if (!wasChecked) {
      setLastCompletedItem({ id, type: itemType, data: itemData });
      setShowItemSuccessModal(true);
      setTimeout(() => setShowItemSuccessModal(false), 2000);
    }

    // Check if current day is completed and auto-advance
    setTimeout(() => {
      const dayItems = getDayChecklistItems(activeWeek, activeDayIndex);
      const allCompleted = dayItems.length > 0 && dayItems.every(itemId => {
        // Use updated state
        const currentState = { ...checkedItems, [id]: !wasChecked };
        return currentState[itemId] === true;
      });
      
      if (allCompleted) {
        // Day completed, advance to next
        const nextDay = getNextDay(activeWeek, activeDayIndex);
        if (nextDay) {
          setTimeout(() => {
            setActiveWeek(nextDay.week);
            setActiveDayIndex(nextDay.dayIdx);
          }, 500);
        }
      }
    }, 200);
  };

  // Get next day
  const getNextDay = (week, dayIdx) => {
    if (dayIdx < weekData[week - 1].days.length - 1) {
      return { week, dayIdx: dayIdx + 1 };
    } else if (week < 4) {
      return { week: week + 1, dayIdx: 0 };
    }
    return null;
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
        
        const day = weekData[week - 1].days[dayIdx];
        if (day.morning) items.push(`w${week}-d${dayIdx}-morning`);
        if (day.breakfast) items.push(`w${week}-d${dayIdx}-breakfast`);
        if (day.lunch) items.push(`w${week}-d${dayIdx}-lunch`);
        if (day.training) items.push(`w${week}-d${dayIdx}-training`);
        if (day.dinner) items.push(`w${week}-d${dayIdx}-dinner`);
      }
    }
    
    return items;
  };

  // Check if checkpoint is automatically completed (all items checked)
  const isCheckpointCompleted = (checkpointDay) => {
    const requiredItems = getChecklistItemsUpToDay(checkpointDay);
    if (requiredItems.length === 0) return false;
    
    const allCompleted = requiredItems.every(itemId => checkedItems[itemId] === true);
    return allCompleted;
  };

  // Progress Calculation
  const calculateWeekProgress = (week) => {
    const weekKeys = Object.keys(checkedItems).filter(key => key.startsWith(`w${week}-`));
    if (weekKeys.length === 0) return 0;
    const completed = weekKeys.filter(key => checkedItems[key]).length;
    const totalItems = weekData[week - 1].days.reduce((total, day) => {
      let count = 0;
      if (day.morning) count++;
      if (day.breakfast) count++;
      if (day.lunch) count++;
      if (day.training) count++;
      if (day.dinner) count++;
      return total + count;
    }, 0);
    return totalItems === 0 ? 0 : Math.min(Math.round((completed / totalItems) * 100), 100);
  };

  const trainingData = {
    fullbody: [
      { name: "Agachamento Livre", s1: "3x12", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Flexão de Braço", s1: "3x10", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Remada Unilateral", s1: "3x12", s2: "3x15", s3: "4x15", s4: "4x15" },
      { name: "Polichinelos", s1: "3x45s", s2: "3x1min", s3: "4x1m15s", s4: "4x1m15s" },
      { name: "Escalador (Mountain Climber)", s1: "3x30s", s2: "3x1min", s3: "4x1m15s", s4: "4x1m15s" },
      { name: "Corrida Estacionária", s1: "3x45s", s2: "3x1min", s3: "4x1m15s", s4: "4x1m15s" },
    ]
  };

  const weekData = [
    {
      id: 1,
      title: "Semana 1: Adaptação e Desinflamação",
      objective: "Limpeza metabólica e redução de retenção hídrica.",
      days: [
        { name: "Segunda-feira", morning: "500ml água + Caminhada (20 min)", breakfast: "3 ovos mexidos + Café sem açúcar", lunch: "150g frango + Vegetais verdes + 2 colheres arroz integral", training: "Treino FullBody", dinner: "150g peixe/frango + Salada de folhas", rule: "Zero açúcar e zero álcool" },
        { name: "Terça-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "1 iogurte natural + 15g whey ou claras", lunch: "150g carne moída + Salada + 100g abóbora cozida", training: null, dinner: "Omelete (3 ovos) com espinafre", rule: "Consumo mínimo de 3 litros de água" },
        { name: "Quarta-feira", morning: "500ml água + Caminhada (20 min)", breakfast: "3 ovos mexidos + Café", lunch: "150g sobrecoxa frango + Abobrinha + 2 colheres arroz", training: "Treino FullBody", dinner: "Sopa de legumes com carne", checkpoint: 1 },
        { name: "Quinta", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g peixe grelhado + Salada + 1 batata doce pequena", training: null, dinner: "150g frango grelhado + Vegetais verdes", rule: "Última refeição até as 20:30" },
        { name: "Sexta-feira", morning: "500ml água + Caminhada (20 min)", breakfast: "3 ovos mexidos", lunch: "150g carne bovina magra + Vegetais + 2 colheres arroz integral", training: "Treino FullBody", dinner: "150g peixe + Salada caprichada", rule: null },
        { name: "Sábado", morning: "500ml água + Caminhada (45 min em jejum)", breakfast: "Omelete de 3 ovos", lunch: "Carne magra grelhada + Mix de vegetais", training: null, dinner: "Sopa de legumes com carne ou omelete", rule: "Proibido bebidas calóricas" },
        { name: "Domingo", morning: "Descanso", breakfast: "3 ovos mexidos", lunch: "150g proteína + Salada verde (Sem carboidrato)", training: null, dinner: null, checkpoint: 2 }
      ]
    },
    {
      id: 2,
      title: "Semana 2: Otimização Metabólica",
      objective: "Aumento da taxa metabólica e estabilização da glicemia.",
      days: [
        { name: "Segunda-feira", morning: "500ml água + Caminhada (25 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Brócolis + 2 colheres arroz integral", training: "Treino FullBody (S2)", dinner: "150g carne moída + Couve refogada", rule: null },
        { name: "Terça-feira", morning: "500ml água + Caminhada (35 min)", breakfast: "Omelete de 3 ovos", lunch: "150g peixe + Salada + 100g batata baroa", training: null, dinner: "150g frango + Salada de folhas", rule: null },
        { name: "Quarta-feira", morning: "500ml água + Caminhada (25 min)", breakfast: "3 ovos mexidos", lunch: "150g carne magra + Vegetais + 2 colheres arroz", training: "Treino FullBody (S2)", dinner: "2 latas atum (em água) + Salada", checkpoint: 3 },
        { name: "Quinta-feira", morning: "500ml água + Caminhada (35 min)", breakfast: "3 ovos + 1 fatia queijo branco", lunch: "150g sobrecoxa + Vagem + 100g abóbora", training: null, dinner: "Omelete com espinafre e cogumelos", rule: null },
        { name: "Sexta-feira", morning: "500ml água + Caminhada (25 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Salada + 2 colheres arroz", training: "Treino FullBody (S2)", dinner: "Peixe grelhado + Brócolis", rule: null },
        { name: "Sábado", morning: "500ml água + Caminhada (50 min)", breakfast: "3 ovos mexidos", lunch: "Carne assada + Salada de folhas (Sem carboidrato)", training: null, dinner: "150g frango + Abobrinha refogada", rule: null },
        { name: "Domingo", morning: "Descanso", breakfast: null, lunch: "Peixe grelhado + Mix de vegetais", training: null, dinner: null, checkpoint: 4 }
      ]
    },
    {
      id: 3,
      title: "Semana 3: Intensificação de Queima",
      objective: "Estresse metabólico controlado e queima máxima. Carboidrato reduzido para 1 colher.",
      days: [
        { name: "Segunda-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Vegetais + 1 colher arroz integral", training: "Treino FullBody (S3)", dinner: "150g peixe + Aspargos/Vagem", rule: null },
        { name: "Terça-feira", morning: "500ml água + Caminhada (40 min)", breakfast: "3 ovos mexidos", lunch: "150g carne bovina + Mix de vegetais (Sem carboidrato)", training: null, dinner: "Omelete de 3 ovos com cogumelos", rule: null },
        { name: "Quarta-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Brócolis + 1 colher arroz", training: "Treino FullBody (S3)", dinner: "Salada de folhas com 150g frango desfiado", checkpoint: 5 },
        { name: "Quinta-feira", morning: "500ml água + Caminhada (40 min)", breakfast: null, lunch: "150g peixe + Salada + 1 batata doce pequena", training: null, dinner: "150g carne moída + Vagem refogada", rule: null },
        { name: "Sexta-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Vegetais + 1 colher arroz", training: "Treino FullBody (S3)", dinner: "Omelete simples + Salada de folhas", rule: null },
        { name: "Sábado", morning: "500ml água + Caminhada (60 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Salada (Sem carboidrato)", training: null, dinner: "Peixe grelhado + Brócolis", rule: null },
        { name: "Domingo", morning: "Descanso", breakfast: null, lunch: "Carne magra + Vegetais no vapor", training: null, dinner: null, checkpoint: 6 }
      ]
    },
    {
      id: 4,
      title: "Semana 4: Consolidação",
      objective: "Manutenção do déficit e preservação de massa magra. Foco em perfeição técnica.",
      days: [
        { name: "Segunda-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Salada + 1 colher arroz integral", training: "Treino FullBody", dinner: "150g peixe + Brócolis", rule: null },
        { name: "Terça-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g carne + Vegetais (Sem carboidrato)", training: null, dinner: "Omelete de 3 ovos com espinafre", rule: null },
        { name: "Quarta-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Salada + 1 colher arroz", training: "Treino FullBody", dinner: "150g frango desfiado + Salada", checkpoint: 7 },
        { name: "Quinta-feira", morning: "500ml água + Caminhada (30 min)", breakfast: null, lunch: "150g peixe + Vegetais + 1 batata pequena", training: null, dinner: "150g carne moída + Couve", rule: null },
        { name: "Sexta-feira", morning: "500ml água + Caminhada (30 min)", breakfast: "3 ovos mexidos", lunch: "150g frango + Salada + 1 colher arroz", training: "Treino FullBody", dinner: "Omelete simples", rule: null },
        { name: "Sábado", morning: "500ml água + Caminhada (60 min)", breakfast: null, lunch: "150g carne magra + Salada", training: null, dinner: "Peixe grelhado + Brócolis", checkpoint: 8 },
        { name: "Domingo", morning: "Descanso", breakfast: null, lunch: "Frango + Vegetais no vapor", training: null, dinner: null, rule: null },
        { name: "Segunda-feira", morning: "500ml água + Caminhada (30 min)", breakfast: null, lunch: "150g peixe + Salada", training: "Treino FullBody (Último esforço)", dinner: "Frango + Salada de folhas", rule: null },
        { name: "Terça-feira", morning: "500ml água + Caminhada (40 min)", breakfast: null, lunch: "150g carne magra + Vegetais verdes", training: null, dinner: "Peixe grelhado + Brócolis", checkpoint: 'Final' }
      ]
    }
  ];

  const checkpoints = [
    { id: 1, day: 3, loss: "-1,0 kg a -1,5 kg", desc: "Corpo em fase de limpeza.", msg: "O início é o ajuste da balança. Mantenha a precisão." },
    { id: 2, day: 7, loss: "-2,0 kg a -2,5 kg", desc: "Inflamação reduzida.", msg: "Fase crítica de abstinência concluída." },
    { id: 3, day: 10, loss: "-2,8 kg a -3,5 kg", desc: "Corpo queimando gordura.", msg: "A consistência é a única variável que você controla." },
    { id: 4, day: 14, loss: "-3,5 kg a -4,5 kg", desc: "Metade do caminho.", msg: "Você chegou à metade. O resultado visual é nítido." },
    { id: 5, day: 17, loss: "-4,5 kg a -5,5 kg", desc: "Metabolismo acelerado.", msg: "Intensidade é a chave na Semana 3." },
    { id: 6, day: 21, loss: "-5,5 kg a -6,0 kg", desc: "Reta final.", msg: "Faltam apenas 9 dias. O 'eu' do passado ficaria orgulhoso." },
    { id: 7, day: 24, loss: "-6,0 kg a -6,5 kg", desc: "Eficiência no transporte de oxigênio.", msg: "O objetivo final está visível. Mantenha a guarda alta." },
    { id: 8, day: 27, loss: "-6,5 kg a -6,8 kg", desc: "Mudança na composição corporal. Menos volume abdominal.", msg: "Execute com perfeição militar." },
    { id: 9, day: 30, loss: "-7,0 kg", desc: "Meta acumulada.", msg: "Você provou que a execução vence a motivação." }
  ];

  // Detect when a checkpoint is completed
  useEffect(() => {
    checkpoints.forEach(cp => {
      const wasCompleted = completedCheckpoints.includes(cp.id);
      const isNowCompleted = isCheckpointCompleted(cp.day);
      
      if (!wasCompleted && isNowCompleted) {
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

  // Get checkpoint completion status and progress
  const getCheckpointStatus = (checkpointDay) => {
    const requiredItems = getChecklistItemsUpToDay(checkpointDay);
    if (requiredItems.length === 0) return { completed: false, progress: 0 };
    
    const completedCount = requiredItems.filter(itemId => checkedItems[itemId] === true).length;
    const progress = Math.round((completedCount / requiredItems.length) * 100);
    const completed = completedCount === requiredItems.length;
    
    return { completed, progress };
  };

  // Get item link handler (reusable system)
  const getItemLinkHandler = (itemType, itemData) => {
    if (itemType === 'training') {
      return () => setCurrentPage('workouts');
    }
    // Future: add more item types here
    return null;
  };

  // Checklist Item Component (reusable with link support)
  const ChecklistItem = ({ id, label, icon: Icon, itemType = null, itemData = null }) => {
    const isChecked = checkedItems[id];
    const linkHandler = getItemLinkHandler(itemType, itemData);
    const hasLink = linkHandler !== null;

    const handleClick = (e) => {
      if (e.target.closest('.checklist-checkbox')) {
        // Clicked on checkbox area
        toggleItem(id, itemType, itemData);
      } else if (hasLink) {
        // Clicked on label area - navigate
        linkHandler();
      } else {
        // No link, just toggle
        toggleItem(id, itemType, itemData);
      }
    };

    return (
      <div 
        onClick={handleClick}
        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
          isChecked 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-100 hover:bg-gray-100 border'
        }`}
      >
        <div className="checklist-checkbox mr-3 shrink-0">
          {isChecked ? (
            <CheckCircle2 className="text-green-600" size={20} />
          ) : (
            <Circle className="text-gray-400" size={20} />
          )}
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
          <span className={`text-sm ${
            isChecked 
              ? 'text-green-800 line-through opacity-70' 
              : hasLink 
                ? 'text-blue-700 hover:underline' 
                : 'text-gray-700'
          }`}>
            {label}
          </span>
          {hasLink && !isChecked && (
            <ChevronRight className="text-blue-500 shrink-0 ml-auto" size={16} />
          )}
        </div>
      </div>
    );
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

  // Success Modal Component (Checkpoint)
  const CheckpointSuccessModal = () => {
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
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Item Success Toast
  const ItemSuccessToast = () => {
    if (!showItemSuccessModal) return null;

    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-semibold">Item completado! 🎉</span>
        </div>
      </div>
    );
  };


  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalItems = 0;
    let completedItems = 0;
    
    for (let week = 1; week <= 4; week++) {
      weekData[week - 1].days.forEach((day, dayIdx) => {
        const dayItems = getDayChecklistItems(week, dayIdx);
        totalItems += dayItems.length;
        completedItems += dayItems.filter(itemId => checkedItems[itemId]).length;
      });
    }
    
    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  };

  // Get current week progress
  const currentWeekProgress = calculateWeekProgress(activeWeek);
  const overallProgress = calculateOverallProgress();


  // Render Home Page
  const renderHomePage = () => {
    const week = weekData[activeWeek - 1];
    const days = week.days;

    return (
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Week Info */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl mx-4 sm:mx-6 mt-4 sm:mt-6 mb-4">
          <h2 className="text-lg font-bold mb-2">{week.title}</h2>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Info size={14} className="shrink-0" />
            <p className="text-xs">{week.objective}</p>
          </div>
        </div>

        {/* Current Day Card */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24">
          {(() => {
            const day = days[activeDayIndex];
            const dayNumber = getDayNumber(activeWeek, activeDayIndex);
            const dayItems = getDayChecklistItems(activeWeek, activeDayIndex);
            const dayProgress = dayItems.length > 0 
              ? Math.round((dayItems.filter(itemId => checkedItems[itemId]).length / dayItems.length) * 100)
              : 0;

            const hasPreviousDay = activeDayIndex > 0 || activeWeek > 1;
            const hasNextDay = getNextDay(activeWeek, activeDayIndex) !== null;

            return (
              <>
                <div className="bg-white border rounded-2xl shadow-sm w-full flex flex-col mb-4">
                  <div className="flex justify-between items-center px-4 pt-4 pb-3 border-b">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Dia {dayNumber}</span>
                      {day.name}
                    </h3>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Checklist Diário
                    </div>
                  </div>

                  <div className="px-4 py-3 space-y-2">
                    {day.morning && (
                      <ChecklistItem 
                        id={`w${activeWeek}-d${activeDayIndex}-morning`} 
                        label={day.morning} 
                        icon={Zap} 
                      />
                    )}
                    {day.breakfast && (
                      <ChecklistItem 
                        id={`w${activeWeek}-d${activeDayIndex}-breakfast`} 
                        label={`Café da Manhã: ${day.breakfast}`} 
                        icon={Utensils} 
                      />
                    )}
                    {day.lunch && (
                      <ChecklistItem 
                        id={`w${activeWeek}-d${activeDayIndex}-lunch`} 
                        label={`Almoço: ${day.lunch}`} 
                        icon={Utensils} 
                      />
                    )}
                    {day.training && (
                      <ChecklistItem 
                        id={`w${activeWeek}-d${activeDayIndex}-training`} 
                        label={day.training} 
                        icon={Dumbbell}
                        itemType="training"
                        itemData={{ week: activeWeek }}
                      />
                    )}
                    {day.dinner && (
                      <ChecklistItem 
                        id={`w${activeWeek}-d${activeDayIndex}-dinner`} 
                        label={`Jantar: ${day.dinner}`} 
                        icon={Utensils} 
                      />
                    )}
                    {day.rule && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium">
                        Regra: {day.rule}
                      </div>
                    )}
                    {day.checkpoint && (() => {
                      const checkpoint = checkpoints.find(cp => cp.id === day.checkpoint || (day.checkpoint === 'Final' && cp.id === 9));
                      if (!checkpoint) return null;
                      const { completed } = getCheckpointStatus(checkpoint.day);
                      if (!completed) return null;
                      return (
                        <div className="mt-3 p-3 bg-green-600 rounded-lg text-white flex justify-between items-center">
                          <span className="font-bold">✓ RESULTADO ATINGIDO!</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    );
  };

  // Render Weeks List Page
  const renderWeeksPage = () => {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Semanas do Programa</h2>
          <p className="text-slate-600 text-sm">Selecione uma semana para ver os detalhes</p>
        </div>
        <div className="space-y-4">
          {weekData.map((week, index) => (
            <button
              key={week.id}
              onClick={() => {
                setSelectedWeek(week.id);
                setCurrentPage('week-details');
              }}
              className="w-full bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{week.title}</h3>
                  <p className="text-sm text-slate-600">{week.objective}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Progresso</div>
                    <div className="text-sm font-bold text-slate-700">{calculateWeekProgress(week.id)}%</div>
                  </div>
                  <ChevronRight className="text-slate-400" size={20} />
                </div>
              </div>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300" 
                  style={{ width: `${calculateWeekProgress(week.id)}%` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render Week Details Page
  const renderWeekDetailsPage = () => {
    if (!selectedWeek) {
      setCurrentPage('weeks');
      return null;
    }

    const week = weekData.find(w => w.id === selectedWeek);
    if (!week) {
      setCurrentPage('weeks');
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedWeek(null);
              setCurrentPage('weeks');
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ChevronRight className="rotate-180" size={20} />
            <span className="text-sm font-medium">Voltar para Semanas</span>
          </button>
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-2">{week.title}</h2>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Info size={16} className="shrink-0" />
              <p>{week.objective}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {week.days.map((day, dayIdx) => {
            const dayNumber = getDayNumber(selectedWeek, dayIdx);
            const dayItems = getDayChecklistItems(selectedWeek, dayIdx);
            const dayProgress = dayItems.length > 0 
              ? Math.round((dayItems.filter(itemId => checkedItems[itemId]).length / dayItems.length) * 100)
              : 0;

            return (
              <div key={dayIdx} className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Dia {dayNumber}</span>
                    {day.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Progresso: {dayProgress}%</span>
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-300" 
                        style={{ width: `${dayProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Checklist Diário</p>
                  {day.morning && (
                    <ChecklistItem 
                      id={`w${selectedWeek}-d${dayIdx}-morning`} 
                      label={day.morning} 
                      icon={Zap} 
                    />
                  )}
                  {day.breakfast && (
                    <ChecklistItem 
                      id={`w${selectedWeek}-d${dayIdx}-breakfast`} 
                      label={`Café da Manhã: ${day.breakfast}`} 
                      icon={Utensils} 
                    />
                  )}
                  {day.lunch && (
                    <ChecklistItem 
                      id={`w${selectedWeek}-d${dayIdx}-lunch`} 
                      label={`Almoço: ${day.lunch}`} 
                      icon={Utensils} 
                    />
                  )}
                  {day.training && (
                    <ChecklistItem 
                      id={`w${selectedWeek}-d${dayIdx}-training`} 
                      label={day.training} 
                      icon={Dumbbell}
                      itemType="training"
                      itemData={{ week: selectedWeek }}
                    />
                  )}
                  {day.dinner && (
                    <ChecklistItem 
                      id={`w${selectedWeek}-d${dayIdx}-dinner`} 
                      label={`Jantar: ${day.dinner}`} 
                      icon={Utensils} 
                    />
                  )}
                  {day.rule && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium">
                      Regra: {day.rule}
                    </div>
                  )}
                  {day.checkpoint && (() => {
                    const checkpoint = checkpoints.find(cp => cp.id === day.checkpoint || (day.checkpoint === 'Final' && cp.id === 9));
                    if (!checkpoint) return null;
                    const { completed } = getCheckpointStatus(checkpoint.day);
                    if (!completed) return null;
                    return (
                      <div className="mt-2 p-3 bg-green-600 rounded-lg text-white flex justify-between items-center">
                        <span className="font-bold">✓ RESULTADO ATINGIDO!</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Workouts Page
  const renderWorkoutsPage = () => {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              TREINO FULLBODY <span className="text-sm font-normal text-slate-400">(Base)</span>
            </h2>
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-bold">Semana {activeWeek}:</span> {
                activeWeek === 1 ? "Séries base (3 séries)" :
                activeWeek === 2 ? "15 repetições nos exercícios 1, 2, 3. Exercícios 4, 5 e 6 duram 1 minuto" :
                activeWeek === 3 ? "4 séries para todos. Exercícios 4, 5 e 6 duram 1min 15s" :
                "Manter volume da Semana 3. Foco em perfeição técnica"
              }
            </p>
          </div>
          <div className="space-y-6">
            {trainingData.fullbody.map((ex, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-slate-800">{ex.name}</h4>
                  <p className="text-xs text-slate-400">
                    {i < 3 ? "Focar em amplitude e técnica" : "Intensidade alta"}
                  </p>
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
    );
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      <CheckpointSuccessModal />
      <ItemSuccessToast />
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sm:p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">PROTREINO</h1>
              <p className="text-slate-400 text-xs sm:text-sm">30 Dias de Execução Estrita</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              <span className="text-sm font-bold">{overallProgress}%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(w => (
              <div 
                key={w} 
                className={`h-2 rounded-full transition-all ${
                  calculateWeekProgress(w) === 100 
                    ? 'bg-green-500' 
                    : w === activeWeek
                      ? 'bg-blue-500'
                      : 'bg-slate-700'
                }`}
                title={`Semana ${w}: ${calculateWeekProgress(w)}%`}
              ></div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden pb-24">
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'weeks' && renderWeeksPage()}
        {currentPage === 'week-details' && renderWeekDetailsPage()}
        {currentPage === 'workouts' && renderWorkoutsPage()}
      </main>

      {/* Day Navigation Buttons - Fixed above bottom bar */}
      {currentPage === 'home' && (() => {
        const hasPreviousDay = activeDayIndex > 0 || activeWeek > 1;
        const hasNextDay = getNextDay(activeWeek, activeDayIndex) !== null;
        
        if (!hasPreviousDay && !hasNextDay) return null;
        
        return (
          <div className="fixed bottom-[96px] left-0 right-0 z-30 max-w-4xl mx-auto px-4 sm:px-6">
            <div className={`grid gap-3 ${hasPreviousDay && hasNextDay ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {hasPreviousDay && (
                <button
                  onClick={() => {
                    if (activeDayIndex > 0) {
                      setActiveDayIndex(activeDayIndex - 1);
                    } else if (activeWeek > 1) {
                      setActiveWeek(activeWeek - 1);
                      setActiveDayIndex(weekData[activeWeek - 2].days.length - 1);
                    }
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg"
                >
                  Dia Anterior
                </button>
              )}
              {hasNextDay && (
                <button
                  onClick={() => {
                    const nextDay = getNextDay(activeWeek, activeDayIndex);
                    if (nextDay) {
                      setActiveWeek(nextDay.week);
                      setActiveDayIndex(nextDay.dayIdx);
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg"
                >
                  Próximo Dia
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex justify-around items-center p-3">
          <button 
            onClick={() => {
              setCurrentPage('home');
            }} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentPage === 'home' 
                ? 'text-slate-900 bg-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={() => {
              setCurrentPage('weeks');
              setSelectedWeek(null);
            }} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentPage === 'weeks' || currentPage === 'week-details'
                ? 'text-slate-900 bg-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={24} />
            <span className="text-xs font-medium">Semanas</span>
          </button>
          <button 
            onClick={() => {
              setCurrentPage('workouts');
            }} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              currentPage === 'workouts' 
                ? 'text-slate-900 bg-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Dumbbell size={24} />
            <span className="text-xs font-medium">Treinos</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
