"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Switch, Chip } from "@heroui/react";
import { GripVertical, Eye, EyeOff, Settings, ArrowUp, ArrowDown } from "lucide-react";

export default function SectionManager({ 
  sections, 
  activeSections, 
  sectionOrder, 
  onToggleSection, 
  onReorderSection,
  onSelectSection,
  activeSection 
}) {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      onReorderSection(draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  const moveSection = (fromIndex, direction) => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex >= 0 && toIndex < sectionOrder.length) {
      onReorderSection(fromIndex, toIndex);
    }
  };

  const orderedSections = sectionOrder.map(sectionId => 
    sections.find(s => s.id === sectionId)
  ).filter(Boolean);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">Page Sections</h3>
      </CardHeader>
      <CardBody className="pt-0 space-y-2">
        {orderedSections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isEnabled = activeSections[`${section.id}Section`]?.enabled ?? true;
          const Icon = section.icon;
          
          return (
            <div
              key={section.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 ${
                isActive
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100 border-transparent"
              } ${draggedItem === index ? "opacity-50" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelectSection(section.id)}
            >
              <div className="flex items-center gap-3">
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className="text-gray-400" />
                </div>
                <Icon 
                  size={18} 
                  className={isActive ? "text-blue-600" : "text-gray-600"} 
                />
                <div className="flex flex-col">
                  <span className={`font-medium ${isActive ? "text-blue-900" : "text-gray-700"}`}>
                    {section.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={isEnabled ? "success" : "default"}
                      startContent={isEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                    >
                      {isEnabled ? "Visible" : "Hidden"}
                    </Chip>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSection(index, "up");
                    }}
                    isDisabled={index === 0}
                  >
                    <ArrowUp size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSection(index, "down");
                    }}
                    isDisabled={index === orderedSections.length - 1}
                  >
                    <ArrowDown size={12} />
                  </Button>
                </div>
                
                <Switch
                  size="sm"
                  isSelected={isEnabled}
                  onValueChange={(enabled) => {
                    onToggleSection(section.id, enabled);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          );
        })}
        
        {orderedSections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No sections configured</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}