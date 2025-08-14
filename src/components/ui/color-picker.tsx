
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const colors = [
  '#F0F4C3', '#DCEDC8', '#C8E6C9', '#B2DFDB', 
  '#80CBC4', '#4DB6AC', '#26A69A', '#009688', 
  '#00897B', '#00796B', '#FFE0B2', '#FFCC80',
  '#FFB74D', '#FFA726', '#FF9800', '#F57C00'
];

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onColorChange
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 border-2"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <Button
              key={c}
              className="w-12 h-12 p-0 border-2"
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
              variant={color === c ? "default" : "outline"}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
