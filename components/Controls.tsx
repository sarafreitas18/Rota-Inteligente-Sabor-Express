import React from 'react';

interface ControlsProps {
    numPoints: number;
    setNumPoints: (value: number) => void;
    numClusters: number;
    setNumClusters: (value: number) => void;
    onGenerate: () => void;
    onCluster: () => void;
    onCalculate: () => void;
    onSimulate: () => void;
    isLoading: boolean;
    canCluster: boolean;
    canCalculate: boolean;
    canSimulate: boolean;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean }> = ({ label, value, min, max, onChange, disabled }) => (
    <div className="w-full">
        <label className="flex justify-between items-center text-sm font-medium text-slate-300 mb-2">
            <span>{label}</span>
            <span className="text-amber-400 font-bold text-base">{value}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
        />
    </div>
);

const ActionButton: React.FC<{ onClick: () => void, disabled: boolean, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'tertiary' }> = ({ onClick, disabled, children, variant = 'primary' }) => {
    const baseClasses = "w-full text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
    
    let variantClasses = '';
    switch(variant) {
        case 'secondary':
            variantClasses = "bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 focus:ring-sky-500";
            break;
        case 'tertiary':
            variantClasses = "bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 focus:ring-teal-500";
            break;
        case 'primary':
        default:
            variantClasses = "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 focus:ring-amber-500";
            break;
    }

    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
        >
            {children}
        </button>
    );
};

const Controls: React.FC<ControlsProps> = ({ numPoints, setNumPoints, numClusters, setNumClusters, onGenerate, onCluster, onCalculate, onSimulate, isLoading, canCluster, canCalculate, canSimulate }) => {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-700/50 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">Configurações</h3>
                <Slider 
                    label="Pontos de Entrega"
                    value={numPoints}
                    min={10}
                    max={200}
                    onChange={(e) => setNumPoints(parseInt(e.target.value, 10))}
                    disabled={isLoading}
                />
                <Slider 
                    label="Entregadores (Clusters)"
                    value={numClusters}
                    min={2}
                    max={10}
                    onChange={(e) => setNumClusters(parseInt(e.target.value, 10))}
                    disabled={isLoading}
                />
            </div>
            
            <div className="space-y-3">
                <ActionButton onClick={onGenerate} disabled={isLoading}>
                    1. Gerar Pontos
                </ActionButton>
                
                <ActionButton onClick={onCluster} disabled={isLoading || !canCluster} variant="secondary">
                    2. Agrupar Zonas
                </ActionButton>

                <ActionButton onClick={onCalculate} disabled={isLoading || !canCalculate}>
                    3. Calcular Rotas
                </ActionButton>

                <ActionButton onClick={onSimulate} disabled={isLoading || !canSimulate} variant="tertiary">
                    4. Simular Entregas
                </ActionButton>
            </div>
        </div>
    );
};

export default Controls;