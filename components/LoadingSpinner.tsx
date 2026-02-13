import React from 'react';
import { ThemeConfig } from '../types';

interface Props {
    theme: ThemeConfig;
}

export const LoadingSpinner: React.FC<Props> = ({ theme }) => {
    return (
        <div className="flex items-center justify-center h-full w-full absolute inset-0 z-0 pointer-events-none">
            <div className="relative">
                <div 
                    className="w-12 h-12 border-4 rounded-full animate-spin"
                    style={{ 
                        borderColor: `${theme.accent}30`, 
                        borderTopColor: theme.accent 
                    }} 
                />
            </div>
        </div>
    );
};