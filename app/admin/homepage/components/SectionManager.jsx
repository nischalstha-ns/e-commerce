"use client";

import { useState } from "react";
import { Card, CardBody, Switch, Button } from "@heroui/react";
import { GripVertical, Settings } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function SectionManager({ sections, onReorder, onToggle, onEdit }) {
  const [localSections, setLocalSections] = useState(sections);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localSections);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setLocalSections(items);
    onReorder(items);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Section Order & Visibility</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Drag to reorder sections and toggle visibility
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {localSections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="text-gray-400 cursor-grab" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{section.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                      </div>
                      <Switch
                        isSelected={section.enabled}
                        onValueChange={() => onToggle(section.id)}
                        size="sm"
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => onEdit(section.id)}
                      >
                        <Settings size={16} />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
