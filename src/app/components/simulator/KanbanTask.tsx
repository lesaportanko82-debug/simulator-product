import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock, Flame, GripVertical, Rocket, Target, TrendingUp } from 'lucide-react';

// --- Types ---

export type KanbanTicket = {
    id: string;
    title: string;
    desc: string;
    effort: number; // 1-5
    impact: number; // 1-10
    urgency: 'low' | 'medium' | 'high' | 'critical';
    type: 'feature' | 'bug' | 'tech_debt';
};

type KanbanData = {
    tickets: KanbanTicket[];
    capacity: number;
    minImpact: number;
};

type Props = {
    data: KanbanData;
    onComplete: (success: boolean) => void;
};

// --- Draggable Ticket ---

export const ItemType = 'TICKET';

export const UrgencyIcon = ({ level }: { level: string }) => {
    switch(level) {
        case 'critical': return <Flame className="w-4 h-4 text-red-500 fill-red-100" />;
        case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
        case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
        default: return <div className="w-4" />;
    }
};

export const TicketCardVisual = ({ ticket, isDragging = false }: { ticket: KanbanTicket, isDragging?: boolean }) => (
    <div
        className={clsx(
            "p-3 rounded-lg border-2 mb-2 shadow-sm transition-all select-none relative group bg-white",
            isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100",
            ticket.type === 'bug' ? "bg-red-50 border-red-100 hover:border-red-300" :
            ticket.type === 'tech_debt' ? "bg-slate-50 border-slate-100 hover:border-slate-300" :
            "bg-white border-violet-100 hover:border-violet-300"
        )}
    >
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                    <UrgencyIcon level={ticket.urgency} />
                    <span className="font-bold text-gray-800 text-sm">{ticket.title}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-tight">{ticket.desc}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={clsx(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide",
                    ticket.type === 'bug' ? "bg-red-100 text-red-700" :
                    ticket.type === 'tech_debt' ? "bg-slate-200 text-slate-700" :
                    "bg-violet-100 text-violet-700"
                )}>
                    {ticket.type === 'tech_debt' ? 'DEBT' : ticket.type}
                </span>
            </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
            <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1 text-gray-600" title="Effort (Story Points)">
                    <Clock className="w-3 h-3" />
                    <span>{ticket.effort} sp</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold" title="Business Impact">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{ticket.impact}</span>
                </div>
            </div>
            <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
        </div>
    </div>
);

const TicketCard = ({ ticket, inSprint }: { ticket: KanbanTicket, inSprint: boolean }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { ...ticket }, // Pass full ticket data for preview
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    
    // Hide the original element while dragging (optional, but good for TouchBackend if we use a DragLayer)
    // However, TouchBackend usually doesn't hide it automatically, so we might want to keep it visible or dim.
    // We already have opacity-50 in TicketCardVisual.

    return (
        <div ref={drag}>
            <TicketCardVisual ticket={ticket} isDragging={isDragging} />
        </div>
    );
};

// --- Droppable Column ---

const Column = ({ title, tickets, status, onDrop, capacity, currentLoad, isSprintColumn }: any) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item: { id: string }) => onDrop(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [onDrop, status]);

    const isOverLimit = isSprintColumn && currentLoad > capacity;

    return (
        <div 
            ref={drop}
            className={clsx(
                "flex-1 rounded-xl p-3 flex flex-col min-h-[400px] transition-colors",
                isSprintColumn 
                    ? (isOverLimit ? "bg-red-50 border-2 border-red-200" : "bg-emerald-50/50 border-2 border-emerald-100") 
                    : "bg-gray-50 border-2 border-gray-100"
            )}
        >
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className={clsx("font-bold flex items-center gap-2", isSprintColumn ? "text-emerald-900" : "text-gray-700")}>
                    {title}
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border border-black/5 text-gray-500">
                        {tickets.length}
                    </span>
                </h3>
                {isSprintColumn && (
                    <div className={clsx(
                        "text-xs font-mono font-bold px-2 py-1 rounded",
                        isOverLimit ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                        {currentLoad} / {capacity} SP
                    </div>
                )}
            </div>
            
            <div className={clsx(
                "flex-1 transition-colors rounded-lg",
                isOver ? "bg-black/5 ring-2 ring-violet-400 ring-inset" : ""
            )}>
                {tickets.map((t: KanbanTicket) => (
                    <TicketCard key={t.id} ticket={t} inSprint={isSprintColumn} />
                ))}
                {tickets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic opacity-50">
                        <GripVertical className="w-8 h-8 mb-2" />
                        <span>Перетащите задачи сюда</span>
                    </div>
                )}
            </div>
        </div>
    );
};

import { KanbanDragLayer } from './KanbanDragLayer';

// --- Main Board ---

export const KanbanTask = ({ data, onComplete }: Props) => {
    const [backlog, setBacklog] = useState<KanbanTicket[]>(data.tickets);
    const [sprint, setSprint] = useState<KanbanTicket[]>([]);
    
    const sprintLoad = sprint.reduce((acc, t) => acc + t.effort, 0);
    const sprintImpact = sprint.reduce((acc, t) => acc + t.impact, 0);
    const isOverloaded = sprintLoad > data.capacity;
    
    // Critical bugs must be included check (optional logic, can be part of success condition)
    // For now, let's keep it simple: Meet minImpact and Not Overloaded.

    const handleDrop = (ticketId: string, targetColumn: 'backlog' | 'sprint') => {
        const allTickets = [...backlog, ...sprint];
        const ticket = allTickets.find(t => t.id === ticketId);
        if (!ticket) return;

        if (targetColumn === 'sprint') {
            // Check if already in sprint
            if (sprint.find(t => t.id === ticketId)) return;
            setBacklog(prev => prev.filter(t => t.id !== ticketId));
            setSprint(prev => [...prev, ticket]);
        } else {
            // Check if already in backlog
            if (backlog.find(t => t.id === ticketId)) return;
            setSprint(prev => prev.filter(t => t.id !== ticketId));
            setBacklog(prev => [...prev, ticket]);
        }
    };

    const handleLaunch = () => {
        if (isOverloaded) return; // Button should be disabled but just in case
        
        // Success Logic:
        // 1. Must not be overloaded (already checked)
        // 2. Must meet minimum impact target
        // 3. (Optional) Could require specific Critical tickets. Let's rely on Impact for now.
        
        // Actually, let's add a "Critical Bug" rule. If there is a critical bug in backlog, you fail.
        const criticalLeftBehind = backlog.some(t => t.urgency === 'critical');
        
        if (criticalLeftBehind) {
            // Fail: You forgot critical bugs
            onComplete(false); 
        } else if (sprintImpact >= data.minImpact) {
            // Success
            onComplete(true);
        } else {
            // Fail: Low impact
            onComplete(false);
        }
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl my-4">
            <KanbanDragLayer />
            {/* Header */}
            <div className="bg-violet-50 px-6 py-4 border-b border-violet-100 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-violet-900 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-violet-600" />
                        Планирование Спринта
                    </h2>
                    <p className="text-xs text-violet-700 mt-1">
                        Соберите спринт на <strong>{data.capacity} SP</strong> с максимальной ценностью. 
                        <br/>Не забудьте про <strong>Critical</strong> баги!
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-xs font-bold text-gray-500 uppercase">Total Impact</div>
                    <div className={clsx(
                        "text-2xl font-black",
                        sprintImpact >= data.minImpact ? "text-emerald-600" : "text-gray-400"
                    )}>
                        {sprintImpact} <span className="text-sm font-medium text-gray-400">/ {data.minImpact}</span>
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50">
                <Column 
                    title="Backlog" 
                    tickets={backlog} 
                    status="backlog" 
                    onDrop={handleDrop} 
                    isSprintColumn={false}
                />
                <Column 
                    title="Sprint Candidate" 
                    tickets={sprint} 
                    status="sprint" 
                    onDrop={handleDrop} 
                    capacity={data.capacity}
                    currentLoad={sprintLoad}
                    isSprintColumn={true}
                />
            </div>

            {/* Footer / Actions */}
            <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                        {isOverloaded && (
                            <span className="text-red-600 flex items-center gap-1 font-bold animate-pulse">
                                <AlertCircle className="w-4 h-4" />
                                Перегрузка! Уберите задачи.
                            </span>
                        )}
                        {!isOverloaded && sprintImpact < data.minImpact && (
                            <span className="text-orange-600 flex items-center gap-1 font-bold">
                                <Target className="w-4 h-4" />
                                Мало ценности. Добавьте фичи.
                            </span>
                        )}
                </div>
                
                <button
                    onClick={handleLaunch}
                    disabled={isOverloaded || sprint.length === 0}
                    className={clsx(
                        "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
                        (isOverloaded || sprint.length === 0)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105"
                    )}
                >
                    <Rocket className="w-4 h-4" />
                    Запустить Спринт
                </button>
            </div>
        </div>
    );
};
