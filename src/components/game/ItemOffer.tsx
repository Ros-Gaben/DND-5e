import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItemOfferProps {
  itemName: string;
  itemType: string;
  description?: string;
  characterId: string;
  onItemTaken: () => void;
}

const ItemOffer = ({ itemName, itemType, description, characterId, onItemTaken }: ItemOfferProps) => {
  const [status, setStatus] = useState<'pending' | 'taken' | 'left'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTakeItem = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .insert({
          character_id: characterId,
          item_name: itemName,
          item_type: itemType,
          description: description || null,
          quantity: 1,
          equipped: false,
        });

      if (error) throw error;

      setStatus('taken');
      toast({
        title: "Item Acquired!",
        description: `${itemName} has been added to your inventory.`,
      });
      onItemTaken();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveItem = () => {
    setStatus('left');
  };

  if (status === 'taken') {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg mt-2">
        <Check className="w-4 h-4 text-green-500" />
        <span className="text-sm text-green-400">You took the {itemName}</span>
      </div>
    );
  }

  if (status === 'left') {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg mt-2">
        <X className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">You left the {itemName} behind</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gold" />
        <span className="font-semibold text-gold">{itemName}</span>
        <span className="text-xs text-muted-foreground">({itemType})</span>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleTakeItem}
          disabled={isLoading}
          className="bg-gradient-gold hover:opacity-90"
        >
          <Check className="w-3 h-3 mr-1" />
          Take
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLeaveItem}
          disabled={isLoading}
          className="border-border text-muted-foreground hover:bg-muted"
        >
          <X className="w-3 h-3 mr-1" />
          Leave
        </Button>
      </div>
    </div>
  );
};

export default ItemOffer;
