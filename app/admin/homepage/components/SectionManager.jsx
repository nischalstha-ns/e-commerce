"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Switch, Button, Card } from "@heroui/react";
import { GripVertical, Eye, EyeOff, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function SectionManager({ sections, onReorder, onToggle, onEdit }) {
  const [items, setItems] = useState(sections);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setItems(reordered);
    onReorder(reordered);
    toast.success("Section order updated");
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {items.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{section.name}</h3>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          isSelected={section.enabled}
                          onValueChange={() => onToggle(section.id)}
                        />
                        {section.enabled ? (
                          <Eye className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => onEdit(section.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
