import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, ...props }) => {
    return (
        <div className="relative mb-6">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    <Icon size={20} />
                </div>
            )}
            <input
                {...props}
                className={`
          block w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 
          ${Icon ? 'pl-10' : 'pl-4'} 
          text-white placeholder-transparent focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue
          transition-all duration-300 peer
        `}
                placeholder={label}
            />
            <label
                className={`
          absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 
          transition-all duration-300 pointer-events-none
          ${Icon ? 'peer-placeholder-shown:left-10' : 'peer-placeholder-shown:left-4'}
          peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-deep-bg peer-focus:px-1 peer-focus:text-neon-blue peer-focus:text-xs
          peer-[&:not(:placeholder-shown)]:-top-2.5 peer-[&:not(:placeholder-shown)]:left-3 peer-[&:not(:placeholder-shown)]:bg-deep-bg peer-[&:not(:placeholder-shown)]:px-1 peer-[&:not(:placeholder-shown)]:text-xs
        `}
            >
                {label}
            </label>
        </div>
    );
};

export default Input;
